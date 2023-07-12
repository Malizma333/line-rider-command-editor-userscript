function mainComp (create, root) {
  return create('div', root.state.active && { style: expandedWindow },
    create('button', {
      style: squareButtonStyle,
      onClick: () => root.onActivate()
    },
    create('text', { style: textStyle.L },
      root.state.active ? '-' : '+'
    )
    ),
    create('div', !root.state.active && { style: { display: 'none' } },
      toolbarComps(create, root),
      tabComps(create, root),
      windowComps(create, root),
      readWriteComps(create, root)
    )
  )
}

function toolbarComps (create, root) {
  return create('div', { style: toolbarStyle },
    create('button', {
      style: squareButtonStyle,
      onClick: () => window.open('https://github.com/Malizma333/line-rider-command-editor-userscript/issues/new')
    },
    create('text', { style: toolbarButtonText }, '⚑')
    ),
    create('button', {
      style: squareButtonStyle,
      onClick: () => window.open('https://github.com/Malizma333/line-rider-command-editor-userscript#readme')
    },
    create('text', { style: toolbarButtonText }, '?')
    )
  )
}

function readWriteComps (create, root) {
  return create('div', {
    style: {
      ...readWriteContainerStyle
    }
  },
  create('button', {
    style: {
      ...readWriteButtonStyle
    },
    onClick: () => root.onRead()
  },
  create('text', { style: textStyle.S }, 'Load')
  ),
  create('button', {
    style: {
      ...readWriteButtonStyle
    },
    onClick: () => root.onTest()
  },
  create('text', { style: textStyle.S }, 'Run')
  ),
  create('button', {
    style: {
      ...readWriteButtonStyle
    },
    onClick: () => root.onPrint()
  },
  create('text', { style: textStyle.S }, 'Print Code')
  ),
  create('div', { style: dataContainerStyle },
    create('text', {
      style: {
        ...dataTextStyle,
        color: root.state.hasError ? 'Red' : 'Black'
      }
    }, root.state.message)
  )
  )
}

function tabComps (create, root) {
  return create('div', { style: tabHeaderStyle },
    Object.keys(
      commandDataTypes
    ).map(command => {
      return create('div', null,
        tabComp(create, root, command)
      )
    })
  )
}

function tabComp (create, root, tab) {
  return create('button', {
    style: {
      ...tabButtonStyle,
      backgroundColor:
        root.state.activeTab === tab
          ? colorTheme.lightgray1
          : colorTheme.darkgray1
    },
    onClick: () => root.onChangeTab(tab)
  }, create('text', { style: textStyle.S }, commandDataTypes[tab].displayName))
}

function windowComps (create, root) {
  return windowComp(
    create, root, root.state.triggerData[root.state.activeTab]
  )
}

function windowComp (create, root, data) {
  if (data.id === Triggers.CustomSkin) {
    return skinEditorComp(create, root, data)
  }

  return create('div', null,
    smoothTabComp(create, root, data),
    create('div', { style: triggerWindowStyle },
      Object.keys(data.triggers).map(i => {
        return triggerComp(create, root, data, parseInt(i))
      }),
      create('button', {
        style: {
          ...squareButtonStyle,
          position: 'relative',
          right: '10px',
          bottom: '4.5px'
        },
        onClick: () => root.createTrigger()
      },
      create('text', {
        style: {
          ...textStyle.L,
          fontWeight: 900
        }
      }, '+')
      )
    )
  )
}

function smoothTabComp (create, root, data) {
  return create('div', { style: smoothTabStyle },
    create('text', { style: textStyle.S }, 'Smoothing'),
    data.id !== Triggers.TimeRemap && create('input', {
      style: {
        ...smoothTextInputStyle,
        marginLeft: '5px'
      },
      value: data.smoothing,
      onChange: (event) => root.updateTrigger(
        {
          prev: data.smoothing,
          new: event.target.value
        },
        ['smoothing'],
        constraintProps.smoothProps
      ),
      onBlur: (event) => root.updateTrigger(
        {
          prev: data.smoothing,
          new: event.target.value
        },
        ['smoothing'],
        constraintProps.smoothProps,
        true
      )
    }),
    data.id === Triggers.TimeRemap && create('div', { style: checkboxDivStyle },
      create('input', {
        style: checkboxStyle,
        type: 'checkbox',
        onChange: () => root.updateTrigger(
          {
            prev: root.state.triggerData[root.state.activeTab].interpolate,
            new: !root.state.triggerData[root.state.activeTab].interpolate
          },
          ['interpolate'],
          constraintProps.interpolateProps
        )
      }),
      data.interpolate && create('square', { style: checkboxFillStyle })
    )
  )
}

function triggerComp (create, root, data, index) {
  const triggerData = data.triggers[index]

  return create('div', {
    style: {
      ...triggerStyle,
      backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white
    }
  },
  triggerHeaderComp(create, root, triggerData, index),
  data.id === Triggers.Zoom && zoomTriggerComp(create, root, triggerData, index),
  data.id === Triggers.CameraPan && camPanTriggerComp(create, root, triggerData, index),
  data.id === Triggers.CameraFocus && camFocusTriggerComp(create, root, triggerData, index),
  data.id === Triggers.TimeRemap && timeRemapTriggerComp(create, root, triggerData, index),
  data.id === Triggers.CustomSkin && false
  )
}

function triggerHeaderComp (create, root, data, index) {
  return create('div', { style: triggerDivStyle },
    create('text', {
      style: {
        ...textStyle.L,
        paddingRight: '10px'
      }
    }, index + 1),
    timeStampComp(create, root, data[0], index),
    create('button', {
      style: {
        ...squareButtonStyle,
        position: 'absolute',
        right: '10px'
      },
      disabled: index === 0,
      onClick: () => root.deleteTrigger(index)
    },
    create('text', {
      style: {
        ...textStyle.M,
        color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
        fontWeight: 900
      }
    }, 'X'))
  )
}

function timeStampComp (create, root, data, index) {
  const tProps = [
    constraintProps.minuteProps,
    constraintProps.secondProps,
    constraintProps.frameProps
  ]

  if (!Array.isArray(data)) {
    return null
  }

  return data.map((timeValue, timeIndex) => {
    return create('div', null,
      create('text', { style: triggerTextStyle },
        ['TIME', ':', ':'][timeIndex]
      ),
      create('input', {
        style: {
          ...triggerTextStyle,
          backgroundColor:
            index === 0
              ? colorTheme.darkgray2
              : colorTheme.white
        },
        disabled: index === 0,
        value: timeValue,
        onChange: (event) => root.updateTrigger(
          {
            prev: timeValue,
            new: event.target.value
          },
          ['triggers', index, 0, timeIndex],
          tProps[timeIndex]
        ),
        onBlur: (event) => root.updateTrigger(
          {
            prev: timeValue,
            new: event.target.value
          },
          ['triggers', index, 0, timeIndex],
          tProps[timeIndex],
          true
        )
      })
    )
  })
}

function zoomTriggerComp (create, root, data, index) {
  const label = 'ZOOM TO'

  return create('div', null,
    create('text', { style: triggerTextStyle }, label),
    create('input', {
      style: triggerTextStyle,
      value: data[1],
      onChange: (event) => root.updateTrigger(
        {
          prev: data[1],
          new: event.target.value
        },
        ['triggers', index, 1],
        constraintProps.zoomProps
      ),
      onBlur: (event) => root.updateTrigger(
        {
          prev: data[1],
          new: event.target.value
        },
        ['triggers', index, 1],
        constraintProps.zoomProps,
        true
      )
    })
  )
}

function camPanTriggerComp (create, root, data, index) {
  const cProps = [
    constraintProps.wProps,
    constraintProps.hProps,
    constraintProps.xProps,
    constraintProps.yProps
  ]
  const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET']

  return create('div', null,
    Object.keys(data[1]).map((prop, propIndex) => {
      return create('div', {
        style: {
          alignItems: 'center',
          display: 'inline-block'
        }
      },
      create('text', { style: triggerTextStyle }, labels[propIndex]),
      create('input', {
        style: triggerTextStyle,
        value: data[1][prop],
        onChange: (event) => root.updateTrigger(
          {
            prev: data[1][prop],
            new: event.target.value
          },
          ['triggers', index, 1, prop],
          cProps[propIndex]
        ),
        onBlur: (event) => root.updateTrigger(
          {
            prev: data[1][prop],
            new: event.target.value
          },
          ['triggers', index, 1, prop],
          cProps[propIndex],
          true
        )
      })
      )
    })
  )
}

function camFocusTriggerComp (create, root, data, index) {
  const dropdownIndex = root.state.focuserDropdowns[index]

  return create('div', null,
    create('select', {
      style: dropdownHeaderStyle,
      value: dropdownIndex,
      onChange: (event) => root.onChangeDropdown(
        index, event.target.value
      )
    },
    Object.keys(data[1]).map(riderIndex => {
      const riderNum = 1 + parseInt(riderIndex)

      return create('option', {
        style: dropdownOptionStyle,
        value: parseInt(riderIndex)
      }, create('text', null, `Rider ${riderNum}`))
    })),
    create('text', { style: triggerTextStyle }, 'WEIGHT'),
    create('input', {
      style: triggerTextStyle,
      value: data[1][dropdownIndex],
      onChange: (event) => root.updateTrigger(
        {
          prev: data[1][dropdownIndex],
          new: event.target.value
        },
        ['triggers', index, 1, dropdownIndex],
        constraintProps.fWeightProps
      ),
      onBlur: (event) => root.updateTrigger(
        {
          prev: data[1][dropdownIndex],
          new: event.target.value
        },
        ['triggers', index, 1, dropdownIndex],
        constraintProps.fWeightProps,
        true
      )
    })
  )
}

function timeRemapTriggerComp (create, root, data, index) {
  const label = 'SPEED'

  return create('div', null,
    create('text', { style: triggerTextStyle }, label),
    create('input', {
      style: triggerTextStyle,
      value: data[1],
      onChange: (event) => root.updateTrigger(
        {
          prev: data[1],
          new: event.target.value
        },
        ['triggers', index, 1],
        constraintProps.timeProps
      ),
      onBlur: (event) => root.updateTrigger(
        {
          prev: data[1],
          new: event.target.value
        },
        ['triggers', index, 1],
        constraintProps.timeProps,
        true
      )
    })
  )
}

function skinEditorComp (create, root, data) {
  return create('div', null,
    create('div', {
      style: customSkinWindowStyle
    },
    create('input', {
      style: colorPickerStyle,
      type: 'color',
      value: root.state.selectedColor,
      onChange: (event) => root.onChangeColor(
        event.target.value
      )
    }),
    FlagComponent(create, root, data.triggers[0]),
    create('svg', { width: '200' }),
    RiderComponent(create, root, data.triggers[0])
    )
  )
}

function FlagComponent (create, root, data) {
  return create('svg', { style: flagSVG },
    create('path', { ...riderStyle.flag, fill: data.flag.fill }),
    create('path', { ...riderStyle.flagOutline, fill: data.flag.stroke })
  )
}

function RiderComponent (create, root, data) {
  return create('svg', { style: riderSVG },
    create('rect', { ...riderStyle.skin, fill: data.skin.fill }), // .skin
    create('rect', { ...riderStyle.hair, fill: data.hair.fill }), // .hair
    create('rect', { ...riderStyle.faceOutline, fill: data.hair.fill }), // .hair
    create('rect', { ...riderStyle.hairFill, fill: data.fill.fill }), // .fill
    create('polygon', { ...riderStyle.eye, fill: data.eye.fill }), // #eye
    create('path', { ...riderStyle.nose, ...riderStyle.outline, fill: data.skin.fill }), // .skin
    create('path', { ...riderStyle.sled, ...riderStyle.outline, fill: data.sled.fill }), // .sled
    create('line', { ...riderStyle.string, stroke: data.string.stroke }), // #string
    create('path', { ...riderStyle.armHand, ...riderStyle.outline, fill: data.armHand.fill }), // .arm .hand
    create('path', { ...riderStyle.legPants, fill: data.legPants.fill }), // .leg .pants
    create('path', { ...riderStyle.legFoot, ...riderStyle.outline, fill: data.legFoot.fill }), // .leg .foot
    create('rect', { ...riderStyle.torso, ...riderStyle.outline, fill: data.torso.fill }), // .torso
    create('rect', { ...riderStyle.scarf1, ...riderStyle.scarfOdd, fill: data.scarf1.fill }), // .scarf1
    create('rect', { ...riderStyle.scarf2, ...riderStyle.scarfEven, fill: data.scarf2.fill }), // .scarf2
    create('rect', { ...riderStyle.scarf3, ...riderStyle.scarfOdd, fill: data.scarf3.fill }), // .scarf3
    create('rect', { ...riderStyle.scarf4, ...riderStyle.scarfEven, fill: data.scarf4.fill }), // .scarf4
    create('rect', { ...riderStyle.scarf5, ...riderStyle.scarfOdd, fill: data.scarf5.fill }), // .scarf5
    create('path', { ...riderStyle.hatTop, ...riderStyle.outline, fill: data.hatTop.fill }), // .hat .top
    create('path', { ...riderStyle.hatBottom, stroke: data.hatBottom.stroke }), // .hat .bottom
    create('circle', { ...riderStyle.hatBall, fill: data.hatBall.fill }), // .hat .ball
    create('path', { ...riderStyle.armSleeve, fill: data.armSleeve.fill }) // .arm .sleeve
  )
}
