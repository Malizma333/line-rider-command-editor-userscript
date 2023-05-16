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
      tabComps(create, root),
      windowComps(create, root),
      readWriteComps(create, root)
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
  }, root.state.activeTab === tab &&
    create('text', { style: textStyle.S }, commandDataTypes[tab].displayName))
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
  const label = 'TIME SCALE'

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

function readWriteComps (create, root) {
  return create('div', null,
    create('button', {
      style: {
        ...readWriteButtonStyle,
        left: '18px'
      },
      onClick: () => root.onRead()
    },
    create('text', { style: textStyle.M }, 'Read')
    ),
    create('button', {
      style: {
        ...readWriteButtonStyle,
        right: '18px'
      },
      onClick: () => root.onCommit()
    },
    create('text', { style: textStyle.M }, 'Commit')
    ),
    create('div', { style: errorContainerStyle },
      create('text', {
        style: {
          ...errorTextStyle,
          color: root.state.hasError ? 'Red' : 'Black'
        }
      }, root.state.errorMessage)
    )
  )
}

function skinEditorComp (create, root, data) {
  return create('div', null,
    create('div', {
      style: {
        ...triggerWindowStyle,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
    FlagComponent(create),
    RiderComponent(create)
    )
  )
}

function FlagComponent (create) {
  return create('svg', {
    transform: 'scale(5)',
    width: '15',
    height: '18'
  },
  create('path', {
    ...riderStyle.flag, transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z'
  }),
  create('path', {
    ...riderStyle.flag,
    transform: 'translate(-5, -3)',
    d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z',
    onClick: () => doSomething()
  })
  )
}

function RiderComponent (create) {
  return create('svg', {
    transform: 'scale(5)',
    width: '15',
    height: '18'
  },
  create('g', { id: 'head' },
    create('rect', {
      ...riderStyle.skin, x: '7', y: '-2.25', width: '3.1', height: '4.5'
    }),
    create('rect', {
      ...riderStyle.hair, x: '9.95', y: '-2.25', width: '0.3', height: '4.5'
    })
  ),
  create('rect', {
    ...riderStyle.hair, x: '7', y: '-0.15', width: '3.1', height: '0.3'
  }),
  create('rect', {
    ...riderStyle.fill, y: '-2.4', width: '3.1', height: '4.8'
  }),
  create('polygon', {
    ...riderStyle.eye, points: '0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0'
  }),
  create('path', {
    ...riderStyle.outline, ...riderStyle.skin, d: 'M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4'
  }),
  create('g', { id: 'sled' },
    create('path', {
      ...riderStyle.sled, ...riderStyle.outline, d: 'M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V1.2l0.7-0.45v-0.4h6.6V0.7l0.7,0.5V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c0.99,0,1.85,0.47,2.38,1.2l0.99,0.38C16.43-1.25,15.12-2.2,13.6-2.2z'
    }),
    create('path', {
      ...riderStyle.sled, ...riderStyle.outline, d: 'M9.75,1.2L9.05,0.7L9.05,4.05L9.75,4.35z'
    }),
    create('path', {
      ...riderStyle.sled, ...riderStyle.outline, d: 'M2.45,4.4V0.75L1.75,1.2v3.2H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h6.85l-0.9-0.7H2.45z'
    }),
    create('path', {
      ...riderStyle.sled, ...riderStyle.outline, d: 'M15.98-0.3c0.36,0.49,0.57,1.09,0.57,1.75c0,1.65-1.3,2.95-2.95,2.95H9.75V4.35l-0.7-0.3V4.4h-3.3l0.9,0.7h6.95c2,0,3.65-1.65,3.65-3.65c0-0.48-0.1-0.95-0.27-1.37L15.98-0.3z'
    }),
    create('path', {
      ...riderStyle.sled, ...riderStyle.outline, d: 'M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z'
    })
  ),
  create('line', {
    ...riderStyle.string, x1: '0', y1: '0', x2: '8', y2: '0'
  }),
  create('g', { id: 'arm' },
    create('path', {
      ...riderStyle.arm.sleeve, d: 'M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5'
    }),
    create('path', {
      ...riderStyle.arm.hand, d: 'M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0'
    })
  ), create('g', { id: 'leg' },
    create('path', {
      ...riderStyle.leg.pants, d: 'M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8'
    }),
    create('path', {
      ...riderStyle.leg.foot, d: 'M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8'
    })
  ), create('g', { id: 'body' },
    create('rect', {
      ...riderStyle.torso, ...riderStyle.outline, x: '0', y: '-2.2', width: '7', height: '4.4'
    }),
    create('g', { className: 'neck' },
      create('rect', {
        ...riderStyle.scarf1, ...riderStyle.scarfOdd, strokeWidth: '0', x: '5.2', y: '1.5', width: '2', height: '1'
      }),
      create('rect', {
        ...riderStyle.scarf2, ...riderStyle.scarfEven, strokeWidth: '0', x: '5.2', y: '0.5', width: '2', height: '1'
      }),
      create('rect', {
        ...riderStyle.scarf3, ...riderStyle.scarfOdd, strokeWidth: '0', x: '5.2', y: '-0.5', width: '2', height: '1'
      }),
      create('rect', {
        ...riderStyle.scarf4, ...riderStyle.scarfEven, strokeWidth: '0', x: '5.2', y: '-1.5', width: '2', height: '1'
      }),
      create('rect', {
        ...riderStyle.scarf5, ...riderStyle.scarfOdd, strokeWidth: '0', x: '5.2', y: '-2.5', width: '2', height: '1'
      })
    ),
    create('g', { class: 'hat' },
      create('path', {
        ...riderStyle.hat.top, ...riderStyle.outline, d: 'M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z'
      }),
      create('path', {
        ...riderStyle.hat.bottom, d: 'M10.6-2.6 v5.2'
      }),
      create('circle', {
        ...riderStyle.hat.ball, cx: '13.9', cy: '0', r: '0.7'
      })
    ),
    create('rect', { ...riderStyle.scarf0, ...riderStyle.scarfEven, x: '0', y: '-1', width: '2', height: '2' }),
    create('rect', { ...riderStyle.scarf1, ...riderStyle.scarfOdd, x: '0', y: '-1', width: '2', height: '2' }),
    create('rect', { ...riderStyle.scarf2, ...riderStyle.scarfEven, x: '0', y: '-1', width: '2', height: '2' }),
    create('rect', { ...riderStyle.scarf3, ...riderStyle.scarfOdd, x: '0', y: '-1', width: '2', height: '2' }),
    create('rect', { ...riderStyle.scarf4, ...riderStyle.scarfEven, x: '0', y: '-1', width: '2', height: '2' }),
    create('rect', { ...riderStyle.scarf5, ...riderStyle.scarfOdd, x: '0', y: '-1', width: '2', height: '2' })
  )
  )
}

function doSomething () {
  console.log('Hi')
}
