class ComponentManager { // eslint-disable-line @typescript-eslint/no-unused-vars
  rc: any
  root: any
  state: any
  computed: any

  constructor (rc: any, root: any) {
    this.rc = rc
    this.root = root
    this.state = root.state
    this.computed = root.computed
  }

  updateState (nextState: any): void {
    this.state = nextState
  }

  updateComputed (nextComputed: any): void {
    this.computed = nextComputed
  }

  main (): ReactComponent {
    const { rc, state } = this
    return rc(
      'div',
      { style: GLOBAL_STYLES.text },
      this.toolbar(),
      state.active as boolean && rc(
        'div',
        { style: STYLES.content },
        state.settingsActive as boolean && this.settingsContainer(),
        !(state.settingsActive as boolean) && this.tabContainer(),
        !(state.settingsActive as boolean) && this.windowContainer()
      )
    )
  }

  toolbar (): ReactComponent {
    const { rc, root, state } = this
    return rc(
      'div',
      { style: STYLES.toolbar.container },
      rc(
        'button',
        {
          title: state.active as boolean ? 'Minimize' : 'Maximize',
          style: STYLES.button.embedded,
          onClick: () => root.onActivate()
        },
        state.active as boolean ? rc('span', minimizeIcon) : rc('span', maximizeIcon)
      ),
      state.active as boolean && rc(
        'div',
        { style: { ...STYLES.toolbar.container, justifyContent: 'start' } },
        rc(
          'button',
          {
            title: 'Download',
            style: STYLES.button.embedded,
            onClick: () => root.onDownload()
          },
          rc('span', downloadIcon)
        ),
        rc(
          'button',
          {
            title: 'Upload',
            style: STYLES.button.embedded,
            onClick: () => {
              const triggerUploadInput = (document.getElementById('trigger-file-upload') as HTMLInputElement)
              triggerUploadInput.value = ''
              triggerUploadInput.click()
            }
          },
          rc('span', uploadIcon),
          rc(
            'input',
            {
              id: 'trigger-file-upload',
              style: { display: 'none' },
              type: 'file',
              accept: '.json',
              onChange: (e: any) => root.onLoadFile(e.target.files[0])
            }
          )
        ),
        rc(
          'button',
          {
            title: 'Load From Script',
            style: STYLES.button.embedded,
            onClick: () => root.onLoadScript()
          },
          rc('span', upRightArrowIcon)
        ),
        rc(
          'button',
          {
            title: 'Run',
            style: STYLES.button.embedded,
            onClick: () => root.onTest()
          },
          rc('span', playIcon)
        ),
        rc(
          'button',
          {
            title: 'Print to Console',
            style: STYLES.button.embedded,
            onClick: () => root.onPrint()
          },
          rc('span', printIcon)
        )
      ),
      state.active as boolean && rc(
        'div',
        { style: { ...STYLES.toolbar.container, justifyContent: 'end' } },
        rc(
          'button',
          {
            title: 'Undo',
            style: STYLES.button.embedded,
            disabled: root.computed.undoStack.length === 0,
            onClick: () => root.onUndo()
          },
          rc(
            'span',
            {
              ...leftArrowIcon,
              style: { color: root.computed.undoStack.length === 0 ? GLOBAL_STYLES.gray : GLOBAL_STYLES.black }
            }
          )
        ),
        rc(
          'button',
          {
            title: 'Redo',
            style: STYLES.button.embedded,
            disabled: root.computed.redoStack.length === 0,
            onClick: () => root.onRedo()
          },
          rc(
            'span',
            {
              ...rightArrowIcon,
              style: { color: root.computed.redoStack.length === 0 ? GLOBAL_STYLES.gray : GLOBAL_STYLES.black }
            }
          )
        ),
        rc(
          'button',
          {
            title: 'Settings',
            style: STYLES.button.embedded,
            onClick: () => root.onToggleSettings(!(state.settingsActive as boolean))
          },
          rc('span', settingsIcon)
        ),
        rc(
          'button',
          {
            title: 'Report Issue',
            style: STYLES.button.embedded,
            onClick: () => window.open(LINKS.REPORT)
          },
          rc('span', flagIcon)
        ),
        rc(
          'button',
          {
            title: 'Help',
            style: STYLES.button.embedded,
            onClick: () => window.open(LINKS.HELP)
          },
          rc('span', helpIcon)
        )
      )
    )
  }

  settingsContainer (): ReactComponent {
    const { rc } = this
    return rc(
      'div',
      { style: STYLES.settings.window },
      this.settingsHeader(),
      this.settings()
    )
  }

  settingsHeader (): ReactComponent {
    const { rc, root, state } = this
    return rc(
      'div',
      { style: STYLES.settings.header },
      rc(
        'button',
        {
          style: {
            ...STYLES.button.embedded,
            position: 'absolute',
            fontSize: '32px',
            right: '0px'
          },
          onClick: () => root.onToggleSettings(false)
        },
        rc('span', xIcon)
      ),
      rc('text', {
        style: {
          fontSize: GLOBAL_STYLES.textSizes.L[state.settings.fontSize]
        }
      }, 'Settings'),
      rc('button', {
        style: {
          ...STYLES.button.settings,
          position: 'absolute',
          fontSize: GLOBAL_STYLES.textSizes.M[state.settings.fontSize],
          left: '0px',
          background: state.settingsDirty as boolean
            ? GLOBAL_STYLES.light_gray3
            : GLOBAL_STYLES.dark_gray1
        },
        disabled: !(state.settingsDirty as boolean),
        onClick: () => root.onApplySettings()
      }, 'Apply')
    )
  }

  settings (): ReactComponent {
    const { rc, root, state } = this
    return rc(
      window.React.Fragment,
      { style: { fontSize: GLOBAL_STYLES.textSizes.M[state.settings.fontSize] } },
      rc(
        'div',
        { style: STYLES.settings.row },
        rc('text', {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize]
          }
        }, 'Font Sizes'),
        rc(
          'div',
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize]
            }
          },
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === SETTINGS.FONT_SIZES.SMALL
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS.FONT_SIZES.SMALL)
          }, rc('text', null, 'Small')),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === SETTINGS.FONT_SIZES.MEDIUM
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS.FONT_SIZES.MEDIUM)
          }, rc('text', null, 'Medium')),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === SETTINGS.FONT_SIZES.LARGE
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS.FONT_SIZES.LARGE)
          }, rc('text', null, 'Large'))
        )
      ),
      rc(
        'div',
        { style: STYLES.settings.row },
        rc('text', {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize]
          }
        }, 'Viewport'),
        rc(
          'div',
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize]
            }
          },
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.resolution === SETTINGS.VIEWPORT.HD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS.VIEWPORT.HD.ID)
          }, rc('text', null, SETTINGS.VIEWPORT.HD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.resolution === SETTINGS.VIEWPORT.FHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS.VIEWPORT.FHD.ID)
          }, rc('text', null, SETTINGS.VIEWPORT.FHD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.resolution === SETTINGS.VIEWPORT.QHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS.VIEWPORT.QHD.ID)
          }, rc('text', null, SETTINGS.VIEWPORT.QHD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.unsavedSettings.resolution === SETTINGS.VIEWPORT.UHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS.VIEWPORT.UHD.ID)
          }, rc('text', null, SETTINGS.VIEWPORT.UHD.NAME))
        )
      )
    )
  }

  tabContainer (): ReactComponent {
    const { rc } = this
    return rc(
      'div',
      { style: STYLES.tabs.container },
      Object.keys(
        TRIGGER_PROPS
      ).map((command: string) => rc(
        'div',
        null,
        this.tab(command as TRIGGER_TYPES)
      ))
    )
  }

  tab (tabID: TRIGGER_TYPES): ReactComponent {
    const { rc, root, state } = this
    return rc('button', {
      style: {
        ...STYLES.tabs.button,
        backgroundColor:
          state.activeTab === tabID
            ? GLOBAL_STYLES.light_gray1
            : GLOBAL_STYLES.dark_gray1
      },
      onClick: () => root.onChangeTab(tabID)
    }, rc(
      'text',
      { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize] } },
      TRIGGER_PROPS[tabID].DISPLAY_NAME
    ))
  }

  windowContainer (): ReactComponent {
    const { state } = this
    return this.window(state.triggerData[state.activeTab])
  }

  window (data: any): ReactComponent {
    const { rc, state } = this
    if (data.id === TRIGGER_TYPES.SKIN) {
      return rc(
        'div',
        { style: STYLES.window },
        this.skinEditorToolbar(data.triggers, state.skinEditorState.ddIndex),
        this.skinEditor(data)
      )
    }

    return rc(
      'div',
      { style: STYLES.window },
      this.smoothTab(state.triggerData[state.activeTab]),
      Object.keys(data.triggers).map((i) => this.trigger(data, parseInt(i, 10)))
    )
  }

  smoothTab (data: any): ReactComponent {
    const { rc, root, state } = this
    return rc(
      'div',
      { style: STYLES.smooth.container },
      rc('label', {
        for: 'smoothTextInput',
        style: { fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize] }
      }, 'Smoothing'),
      data.id !== TRIGGER_TYPES.TIME && rc('input', {
        id: 'smoothTextInput',
        style: {
          ...STYLES.smooth.input,
          fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize],
          marginLeft: '5px'
        },
        value: data.smoothing,
        onChange: (e: any) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value
          },
          ['smoothing'],
          CONSTRAINTS.SMOOTH
        ),
        onBlur: (e: any) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value
          },
          ['smoothing'],
          CONSTRAINTS.SMOOTH,
          true
        )
      }),
      data.id === TRIGGER_TYPES.TIME && rc(
        'div',
        { style: STYLES.checkbox.container },
        rc('input', {
          id: 'smoothTextInput',
          style: STYLES.checkbox.primary,
          type: 'checkbox',
          onChange: () => root.onUpdateTrigger(
            {
              prev: state.triggerData[state.activeTab].interpolate,
              new: !(state.triggerData[state.activeTab].interpolate as boolean)
            },
            ['interpolate'],
            CONSTRAINTS.INTERPOLATE
          )
        }),
        data.interpolate as boolean && rc('square', { style: STYLES.checkbox.fill })
      )
    )
  }

  trigger (data: any, index: number): ReactComponent {
    const { rc, root, state } = this
    const triggerData = data.triggers[index]

    return rc(
      'div',
      {
        style: {
          ...STYLES.trigger.container,
          fontSize: GLOBAL_STYLES.textSizes.M[state.settings.fontSize],
          backgroundColor: index === 0 ? GLOBAL_STYLES.gray : GLOBAL_STYLES.white
        }
      },
      rc(
        'button',
        {
          style: {
            ...STYLES.button.embedded,
            fontSize: '22px',
            position: 'absolute',
            right: '0px'
          },
          disabled: index === 0,
          onClick: () => root.onDeleteTrigger(index)
        },
        rc('span', {
          ...xIcon,
          style: {
            color: index === 0 ? GLOBAL_STYLES.dark_gray2 : GLOBAL_STYLES.black
          }
        })
      ),
      this.timeStamp(triggerData[0], index),
      data.id === TRIGGER_TYPES.ZOOM && this.zoomTrigger(triggerData, index),
      data.id === TRIGGER_TYPES.PAN && this.cameraPanTrigger(triggerData, index),
      data.id === TRIGGER_TYPES.FOCUS && this.cameraFocusTrigger(triggerData, index),
      data.id === TRIGGER_TYPES.TIME && this.timeRemapTrigger(triggerData, index),
      data.id === TRIGGER_TYPES.SKIN && false,
      rc(
        'button',
        {
          style: STYLES.trigger.createButton,
          onClick: () => root.onCreateTrigger(index)
        },
        rc('span', plusIcon)
      )
    )
  }

  timeStamp (data: any, index: number): ReactComponent {
    const { rc, root, computed } = this
    const tProps = [
      CONSTRAINTS.MINUTE,
      CONSTRAINTS.SECOND,
      CONSTRAINTS.FRAME
    ]

    if (!Array.isArray(data)) {
      return false
    }

    return rc(
      'div',
      { style: STYLES.trigger.property },
      data.map((timeValue, timeIndex) => rc(
        'div',
        null,
        rc(
          'text',
          { style: STYLES.trigger.text },
          ['Time', ':', ':'][timeIndex]
        ),
        rc('input', {
          style: {
            ...STYLES.trigger.input,
            color: computed.invalidTimes[index] as boolean ? 'red' : 'black'
          },
          value: timeValue,
          onChange: (e: any) => root.onUpdateTrigger(
            {
              prev: timeValue,
              new: e.target.value
            },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex]
          ),
          onBlur: (e: any) => root.onUpdateTrigger(
            {
              prev: timeValue,
              new: e.target.value
            },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex],
            true
          )
        })
      ))
    )
  }

  zoomTrigger (data: any, index: number): ReactComponent {
    const { rc, root } = this
    const labels = ['Zoom To']

    return rc(
      'div',
      { style: STYLES.trigger.property },
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.input,
        value: data[1],
        onChange: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value
          },
          ['triggers', index, 1],
          CONSTRAINTS.ZOOM
        ),
        onBlur: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value
          },
          ['triggers', index, 1],
          CONSTRAINTS.ZOOM,
          true
        )
      })
    )
  }

  cameraPanTrigger (data: any, index: number): ReactComponent {
    const { rc, root } = this
    const cProps = [
      CONSTRAINTS.PAN_WIDTH,
      CONSTRAINTS.PAN_HEIGHT,
      CONSTRAINTS.PAN_X,
      CONSTRAINTS.PAN_Y
    ]
    const labels = ['Width', 'Height', 'Offset X', 'Offset Y']

    return rc(
      window.React.Fragment,
      null,
      [['w', 'h'], ['x', 'y']].map((pair, pairIndex) => rc(
        'div',
        { style: { display: 'flex', flexDirection: 'row' } },
        pair.map((prop, propIndex) => rc(
          'div',
          { style: STYLES.trigger.property },
          rc('label', {
            for: `triggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: STYLES.trigger.text
          }, labels[propIndex + 2 * pairIndex]),
          rc('input', {
            id: `triggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: STYLES.trigger.input,
            value: data[1][prop],
            onChange: (e: any) => root.onUpdateTrigger(
              { prev: data[1][prop], new: e.target.value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex]
            ),
            onBlur: (e: any) => root.onUpdateTrigger(
              { prev: data[1][prop], new: e.target.value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex],
              true
            )
          })
        ))
      ))
    )
  }

  cameraFocusTrigger (data: any, index: number): ReactComponent {
    const { rc, root, state } = this
    const ddIndex = state.focusDDIndices[index] as number
    const labels = ['Weight']

    return rc(
      'div',
      { style: STYLES.trigger.property },
      rc(
        'select',
        {
          style: STYLES.dropdown.head,
          value: ddIndex,
          onChange: (e: any) => root.onChangeFocusDD(index, e.target.value)
        },
        Object.keys(data[1]).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10)

          return rc('option', {
            style: STYLES.dropdown.option,
            value: parseInt(riderIndex, 10)
          }, rc('text', null, `Rider ${riderNum}`))
        })
      ),
      rc('label', {
        for: `triggerText_${labels[0]}_${ddIndex}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${ddIndex}_${index}`,
        style: STYLES.trigger.input,
        value: data[1][ddIndex],
        onChange: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1][ddIndex],
            new: e.target.value
          },
          ['triggers', index, 1, ddIndex],
          CONSTRAINTS.FOCUS_WEIGHT
        ),
        onBlur: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1][ddIndex],
            new: e.target.value
          },
          ['triggers', index, 1, ddIndex],
          CONSTRAINTS.FOCUS_WEIGHT,
          true
        )
      })
    )
  }

  timeRemapTrigger (data: any, index: number): ReactComponent {
    const { rc, root } = this
    const labels = ['Speed']

    return rc(
      'div',
      { style: STYLES.trigger.property },
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.input,
        value: data[1],
        onChange: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value
          },
          ['triggers', index, 1],
          CONSTRAINTS.TIME_SPEED
        ),
        onBlur: (e: any) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value
          },
          ['triggers', index, 1],
          CONSTRAINTS.TIME_SPEED,
          true
        )
      })
    )
  }

  skinEditor (data: any): ReactComponent {
    const { rc, root, state } = this
    const { ddIndex } = state.skinEditorState

    return rc(
      'div',
      { style: STYLES.skinEditor.container },
      rc('div', { style: STYLES.skinEditor.background }),
      rc(
        'div',
        {
          id: 'skinElementContainer',
          style: {
            ...STYLES.skinEditor.canvas,
            transform: `scale(${state.skinEditorState.zoom.scale as number})`,
            transformOrigin: `${
              state.skinEditorState.zoom.xOffset as number
            }px ${
              state.skinEditorState.zoom.yOffset as number
            }px`
          },
          onWheel: (e: any) => root.onZoomSkinEditor(e, true)
        },
        this.flagSvg(data.triggers[ddIndex], ddIndex),
        rc('svg', { width: '10vw' }),
        this.riderSvg(data.triggers[ddIndex], ddIndex)
      ),
      rc(
        'div',
        { style: STYLES.skinEditor.zoomContainer },
        rc('input', {
          style: { height: '10px' },
          type: 'range',
          orient: 'vertical',
          min: CONSTRAINTS.SKIN_ZOOM.MIN,
          max: CONSTRAINTS.SKIN_ZOOM.MAX,
          step: 0.1,
          value: state.skinEditorState.zoom.scale,
          onChange: (e: any) => root.onZoomSkinEditor(e, false)
        }),
        rc(
          'text',
          { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize] } },
          `x${Math.round(state.skinEditorState.zoom.scale * 10) / 10}`
        )
      ),
      rc(
        'div',
        { style: STYLES.skinEditor.outlineColor.container },
        rc('text', { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize] } }, 'Outline'),
        rc('div', {
          style: {
            ...STYLES.skinEditor.outlineColor.input,
            backgroundColor: data.triggers[ddIndex].outline.stroke
          },
          onClick: () => root.onUpdateTrigger(
            { new: state.skinEditorState.color },
            ['triggers', ddIndex, 'outline', 'stroke']
          )
        })
      )
    )
  }

  skinEditorToolbar (data: any, index: number): ReactComponent {
    const { rc, root, state } = this
    const colorValue = state.skinEditorState.color.substring(0, 7)
    const alphaValue = parseInt(state.skinEditorState.color.substring(7), 16) / 255

    return rc(
      'div',
      { style: STYLES.skinEditor.toolbar },
      rc(
        'button',
        {
          style: {
            ...STYLES.button.embedded,
            fontSize: '32px',
            position: 'absolute',
            right: '10px'
          },
          onClick: () => root.onResetSkin(index)
        },
        rc('span', trashIcon)
      ),
      rc(
        'div',
        {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            ...STYLES.alpha.container,
            fontSize: GLOBAL_STYLES.textSizes.S[state.settings.fontSize]
          }
        },
        rc('label', { for: 'alphaSlider' }, 'Transparency'),
        rc(
          'div',
          { style: STYLES.alpha.sliderContainer },
          rc('input', {
            id: 'alphaSlider',
            style: STYLES.alpha.slider,
            type: 'range',
            min: CONSTRAINTS.ALPHA_SLIDER.MIN,
            max: CONSTRAINTS.ALPHA_SLIDER.MAX,
            step: 0.01,
            value: alphaValue,
            onChange: (e: any) => root.onChangeColor(null, e.target.value)
          })
        )
      ),
      rc('input', {
        style: {
          ...STYLES.skinEditor.toolbarItem,
          height: '40px',
          width: '40px'
        },
        type: 'color',
        value: colorValue,
        onChange: (e: any) => root.onChangeColor(e.target.value, null)
      }),
      rc(
        'select',
        {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            ...STYLES.dropdown.head,
            fontSize: GLOBAL_STYLES.textSizes.M[state.settings.fontSize]
          },
          value: index,
          onChange: (e: any) => root.onChangeSkinDD(e.target.value)
        },
        Object.keys(data).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10)

          return rc('option', {
            style: STYLES.dropdown.option,
            value: parseInt(riderIndex, 10)
          }, rc('text', null, `Rider ${riderNum}`))
        })
      )
    )
  }

  flagSvg (data: any, index: any): ReactComponent {
    const { rc, root, state } = this
    const { color } = state.skinEditorState
    return rc(
      'svg',
      { style: STYLES.skinEditor.flagSvg },
      rc('path', {
        ...STYLES.riderProps.flag,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'flag', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.flagOutline,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'flag', 'fill'])
      })
    )
  }

  riderSvg (data: any, index: any): ReactComponent {
    const { rc, root, state } = this
    const { color } = state.skinEditorState
    return rc(
      'svg',
      { style: STYLES.skinEditor.riderSvg },
      rc('rect', {
        ...STYLES.riderProps.skin,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'skin', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.nose,
        stroke: data.outline.stroke,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'skin', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.hair,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hair', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.faceOutline,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hair', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.hairFill,
        fill: data.fill.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'fill', 'fill'])
      }),
      rc('polygon', {
        ...STYLES.riderProps.eye,
        fill: data.eye.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'eye', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.sled,
        stroke: data.outline.stroke,
        fill: data.sled.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'sled', 'fill'])
      }),
      rc('line', {
        ...STYLES.riderProps.string,
        stroke: data.string.stroke,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'string', 'stroke'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.armHand,
        stroke: data.outline.stroke,
        fill: data.armHand.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'armHand', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.legPants,
        stroke: data.outline.stroke,
        fill: data.legPants.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'legPants', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.legFoot,
        stroke: data.outline.stroke,
        fill: data.legFoot.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'legFoot', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfEven,
        ...STYLES.riderProps.id_scarf0a,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf0', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfEven,
        ...STYLES.riderProps.id_scarf0b,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf0', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf1,
        fill: data.id_scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf1', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf2,
        fill: data.id_scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf2', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf3,
        fill: data.id_scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf3', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf4,
        fill: data.id_scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf4', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf5,
        fill: data.id_scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf5', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.torso,
        stroke: data.outline.stroke,
        fill: data.torso.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'torso', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf1,
        fill: data.scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf1', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf2,
        fill: data.scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf2', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf3,
        fill: data.scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf3', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf4,
        fill: data.scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf4', 'fill'])
      }),
      rc('rect', {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf5,
        fill: data.scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf5', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.hatTop,
        stroke: data.outline.stroke,
        fill: data.hatTop.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatTop', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.hatBottom,
        stroke: data.hatBottom.stroke,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatBottom', 'stroke'])
      }),
      rc('circle', {
        ...STYLES.riderProps.hatBall,
        fill: data.hatBall.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatBall', 'fill'])
      }),
      rc('path', {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.armSleeve,
        stroke: data.outline.stroke,
        fill: data.armSleeve.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'armSleeve', 'fill'])
      })
    )
  }
}
