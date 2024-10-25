class ComponentManager { // eslint-disable-line @typescript-eslint/no-unused-vars
  rc: Function
  root: ReactComponent
  state: RootState

  constructor (rc: Function, root: ReactComponent) {
    this.rc = rc
    this.root = root
    this.state = root.state
  }

  updateState (nextState: RootState): void {
    this.state = nextState
  }

  main (): ReactComponent {
    const { rc, state } = this
    return rc(
      'div',
      { style: GLOBAL_STYLES.text },
      this.toolbar(),
      state.active && rc(
        'div',
        { style: STYLES.content },
        state.settingsActive && this.settingsContainer(),
        !(state.settingsActive) && this.tabContainer(),
        !(state.settingsActive) && this.windowContainer()
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
          title: state.active ? 'Minimize' : 'Maximize',
          style: STYLES.button.embedded,
          onClick: () => root.onActivate()
        },
        state.active ? rc('span', minimizeIcon) : rc('span', maximizeIcon)
      ),
      state.active && rc(
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
              onChange: (e: Event) => root.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])
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
      state.active && rc(
        'div',
        { style: { ...STYLES.toolbar.container, justifyContent: 'end' } },
        rc(
          'button',
          {
            title: 'Undo',
            style: STYLES.button.embedded,
            disabled: true,
            onClick: () => root.onUndo()
          },
          rc(
            'span',
            {
              ...leftArrowIcon,
              style: { color: GLOBAL_STYLES.gray }
            }
          )
        ),
        rc(
          'button',
          {
            title: 'Redo',
            style: STYLES.button.embedded,
            disabled: true,
            onClick: () => root.onRedo()
          },
          rc(
            'span',
            {
              ...rightArrowIcon,
              style: { color: GLOBAL_STYLES.gray }
            }
          )
        ),
        rc(
          'button',
          {
            title: 'Settings',
            style: STYLES.button.embedded,
            onClick: () => root.onToggleSettings(!(state.settingsActive))
          },
          rc('span', settingsIcon)
        ),
        rc(
          'button',
          {
            title: 'Report Issue',
            style: STYLES.button.embedded,
            onClick: () => window.open(REPORT_LINK)
          },
          rc('span', flagIcon)
        ),
        rc(
          'button',
          {
            title: 'Help',
            style: STYLES.button.embedded,
            onClick: () => window.open(HELP_LINK)
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
          fontSize: GLOBAL_STYLES.textSizes.L[state.fontSizeSetting]
        }
      }, 'Settings'),
      rc('button', {
        style: {
          ...STYLES.button.settings,
          position: 'absolute',
          fontSize: GLOBAL_STYLES.textSizes.M[state.fontSizeSetting],
          left: '0px',
          background: state.settingsDirty
            ? GLOBAL_STYLES.light_gray3
            : GLOBAL_STYLES.dark_gray1
        },
        disabled: !(state.settingsDirty),
        onClick: () => root.onApplySettings()
      }, 'Apply')
    )
  }

  settings (): ReactComponent {
    const { rc, root, state } = this
    return rc(
      window.React.Fragment,
      { style: { fontSize: GLOBAL_STYLES.textSizes.M[state.fontSizeSetting] } },
      rc(
        'div',
        { style: STYLES.settings.row },
        rc('text', {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting]
          }
        }, 'Font Sizes'),
        rc(
          'div',
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting]
            }
          },
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL)
          }, rc('text', null, 'Small')),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM)
          }, rc('text', null, 'Medium')),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE)
          }, rc('text', null, 'Large'))
        )
      ),
      rc(
        'div',
        { style: STYLES.settings.row },
        rc('text', {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting]
          }
        }, 'Viewport'),
        rc(
          'div',
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting]
            }
          },
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID)
          }, rc('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].HD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID)
          }, rc('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID)
          }, rc('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.NAME)),
          rc('button', {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID)
          }, rc('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.NAME))
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
        this.tab(command as TRIGGER_ID)
      ))
    )
  }

  tab (tabID: TRIGGER_ID): ReactComponent {
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
      { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting] } },
      TRIGGER_PROPS[tabID].DISPLAY_NAME
    ))
  }

  windowContainer (): ReactComponent {
    const { state } = this
    return this.window(state.triggerData[state.activeTab])
  }

  window (data: TriggerDataItem): ReactComponent {
    const { rc, state } = this
    if (data.id === TRIGGER_ID.SKIN) {
      return rc(
        'div',
        { style: STYLES.window },
        this.skinEditorToolbar(data.triggers, state.skinEditorSelectedRider),
        this.skinEditor(data.triggers as SkinCssTrigger[])
      )
    }

    return rc(
      'div',
      { style: STYLES.window },
      this.smoothTab(state.triggerData[state.activeTab]),
      Object.keys(data.triggers).map((i) => this.trigger(data, parseInt(i, 10)))
    )
  }

  smoothTab (data: TriggerDataItem): ReactComponent {
    const { rc, root, state } = this
    return rc(
      'div',
      { style: STYLES.smooth.container },
      rc('label', {
        for: 'smoothTextInput',
        style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting] }
      }, 'Smoothing'),
      data.id !== TRIGGER_ID.TIME && rc('input', {
        id: 'smoothTextInput',
        style: {
          ...STYLES.smooth.input,
          fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting],
          marginLeft: '5px'
        },
        value: data.smoothing,
        onChange: (e: Event) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: (e.target as HTMLInputElement).value
          },
          ['smoothing'],
          CONSTRAINTS.SMOOTH
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: (e.target as HTMLInputElement).value
          },
          ['smoothing'],
          CONSTRAINTS.SMOOTH,
          true
        )
      }),
      data.id === TRIGGER_ID.TIME && rc(
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

  trigger (data: TriggerDataItem, index: number): ReactComponent {
    const { rc, root, state } = this
    const triggerData = data.triggers[index]

    return rc(
      'div',
      {
        style: {
          ...STYLES.trigger.container,
          fontSize: GLOBAL_STYLES.textSizes.M[state.fontSizeSetting],
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
      data.id !== TRIGGER_ID.SKIN && this.timeStamp((triggerData as TimedTrigger)[0], index),
      data.id === TRIGGER_ID.ZOOM && this.zoomTrigger((triggerData as ZoomTrigger), index),
      data.id === TRIGGER_ID.PAN && this.cameraPanTrigger((triggerData as CameraPanTrigger), index),
      data.id === TRIGGER_ID.FOCUS && this.cameraFocusTrigger((triggerData as CameraFocusTrigger), index),
      data.id === TRIGGER_ID.TIME && this.timeRemapTrigger((triggerData as TimeRemapTrigger), index),
      data.id === TRIGGER_ID.SKIN && false,
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

  timeStamp (data: TriggerTime, index: number): ReactComponent {
    const { rc, root, state } = this
    const tProps = [
      CONSTRAINTS.MINUTE,
      CONSTRAINTS.SECOND,
      CONSTRAINTS.FRAME
    ]

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
            color: state.invalidTimes[index] ? 'red' : 'black'
          },
          value: timeValue,
          onChange: (e: Event) => root.onUpdateTrigger(
            { prev: timeValue, new: (e.target as HTMLInputElement).value },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex]
          ),
          onBlur: (e: Event) => root.onUpdateTrigger(
            { prev: timeValue, new: (e.target as HTMLInputElement).value },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex],
            true
          )
        })
      ))
    )
  }

  zoomTrigger (data: ZoomTrigger, index: number): ReactComponent {
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
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1],
          CONSTRAINTS.ZOOM
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1],
          CONSTRAINTS.ZOOM,
          true
        )
      })
    )
  }

  cameraPanTrigger (data: CameraPanTrigger, index: number): ReactComponent {
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
      [['width', 'height'], ['x', 'y']].map((pair, pairIndex) => rc(
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
            value: data[1][prop as 'width' | 'height' | 'x' | 'y'],
            onChange: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as 'width' | 'height' | 'x' | 'y'], new: (e.target as HTMLInputElement).value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex]
            ),
            onBlur: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as 'width' | 'height' | 'x' | 'y'], new: (e.target as HTMLInputElement).value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex],
              true
            )
          })
        ))
      ))
    )
  }

  cameraFocusTrigger (data: CameraFocusTrigger, index: number): ReactComponent {
    const { rc, root, state } = this
    const dropdownIndex = state.focusDDIndices[index]
    const labels = ['Weight']

    return rc(
      'div',
      { style: STYLES.trigger.property },
      rc(
        'select',
        {
          style: STYLES.dropdown.head,
          value: dropdownIndex,
          onChange: (e: Event) => root.onChangeFocusDD(index, (e.target as HTMLInputElement).value)
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
        for: `triggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: STYLES.trigger.input,
        value: data[1][dropdownIndex],
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1][dropdownIndex], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1, dropdownIndex],
          CONSTRAINTS.FOCUS_WEIGHT
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1][dropdownIndex], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1, dropdownIndex],
          CONSTRAINTS.FOCUS_WEIGHT,
          true
        )
      })
    )
  }

  timeRemapTrigger (data: TimeRemapTrigger, index: number): ReactComponent {
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
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1],
          CONSTRAINTS.TIME_SPEED
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ['triggers', index, 1],
          CONSTRAINTS.TIME_SPEED,
          true
        )
      })
    )
  }

  skinEditor (data: SkinCssTrigger[]): ReactComponent {
    const { rc, root, state } = this
    const dropdownIndex = state.skinEditorSelectedRider

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
            transform: `scale(${state.skinEditorZoom[0]})`,
            transformOrigin: `${state.skinEditorZoom[1]}px ${state.skinEditorZoom[2]}px`
          },
          onWheel: (e: Event) => root.onZoomSkinEditor(e, true)
        },
        this.flagSvg(data[dropdownIndex], dropdownIndex),
        rc('svg', { width: '10vw' }),
        this.riderSvg(data[dropdownIndex], dropdownIndex)
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
          value: state.skinEditorZoom[0],
          onChange: (e: Event) => root.onZoomSkinEditor(e, false)
        }),
        rc(
          'text',
          { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting] } },
          `x${Math.round(state.skinEditorZoom[0] * 10) / 10}`
        )
      ),
      rc(
        'div',
        { style: STYLES.skinEditor.outlineColor.container },
        rc('text', { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting] } }, 'Outline'),
        rc('div', {
          style: {
            ...STYLES.skinEditor.outlineColor.input,
            backgroundColor: data[dropdownIndex].outline.stroke
          },
          onClick: () => root.onUpdateTrigger(
            { new: state.skinEditorSelectedColor },
            ['triggers', dropdownIndex, 'outline', 'stroke']
          )
        })
      )
    )
  }

  skinEditorToolbar (data: Trigger[], index: number): ReactComponent {
    const { rc, root, state } = this
    const colorValue = state.skinEditorSelectedColor.substring(0, 7)
    const alphaValue = parseInt(state.skinEditorSelectedColor.substring(7), 16) / 255

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
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSizeSetting]
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
            onChange: (e: Event) => root.onChangeColor(null, (e.target as HTMLInputElement).value)
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
        onChange: (e: Event) => root.onChangeColor((e.target as HTMLInputElement).value, null)
      }),
      rc(
        'select',
        {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            ...STYLES.dropdown.head,
            fontSize: GLOBAL_STYLES.textSizes.M[state.fontSizeSetting]
          },
          value: index,
          onChange: (e: Event) => root.onChangeSkinDD((e.target as HTMLInputElement).value)
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

  flagSvg (data: SkinCssTrigger, index: number): ReactComponent {
    const { rc, root, state } = this
    const color = state.skinEditorSelectedColor
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

  riderSvg (data: SkinCssTrigger, index: number): ReactComponent {
    const { rc, root, state } = this
    const color = state.skinEditorSelectedColor
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
