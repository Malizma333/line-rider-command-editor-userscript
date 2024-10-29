function InitRoot (): ReactComponent { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { store, React } = window
  const rootElement = document.getElementById(ROOT_NODE_ID) as HTMLElement
  const e = React.createElement

  interface RootState {
    active: boolean
    activeTab: TRIGGER_ID
    triggerUpdateFlag: boolean
    focusDDIndices: number[]
    skinEditorSelectedRider: number
    skinEditorSelectedColor: string
    skinEditorZoom: [number, number, number]
    settingsActive: boolean
    settingsDirty: boolean
    fontSize: number
    resolution: ViewportOption
    fontSizeSetting: number
    resolutionSetting: ViewportOption
    invalidTimes: boolean[]
    toolbarColors: TOOLBAR_COLOR[]
  }

  class RootComponent extends React.Component {
    readonly componentManager = new ComponentManager(this)
    readonly parser = new ScriptParser()
    readonly triggerManager = new TriggerDataManager()
    readonly state: RootState
    readonly setState: SetState
    lastRiderCount: number | undefined

    constructor () {
      super()

      this.state = {
        active: false,
        activeTab: TRIGGER_ID.ZOOM,
        triggerUpdateFlag: false,
        focusDDIndices: [0],
        skinEditorSelectedRider: 0,
        skinEditorSelectedColor: '#000000ff',
        skinEditorZoom: [1, 0, 0],
        settingsActive: false,
        settingsDirty: false,
        fontSize: parseInt(getSetting(SETTINGS_KEY.FONT_SIZE), 10),
        resolution: getSetting(SETTINGS_KEY.VIEWPORT) as ViewportOption,
        fontSizeSetting: parseInt(getSetting(SETTINGS_KEY.FONT_SIZE), 10),
        resolutionSetting: getSetting(SETTINGS_KEY.VIEWPORT) as ViewportOption,
        invalidTimes: [],
        toolbarColors: Array(16).fill(TOOLBAR_COLOR.NONE)
      }

      store.subscribe(() => this.updateStore(store.getState()))
    }

    componentDidMount (): void {
      Object.assign(rootElement.style, STYLES.root)

      window.save_commands = () => {
        this.onDownload()
        return 'Downloaded commands!'
      }
    }

    updateStore (nextState: ReduxState): void {
      const riderCount = getNumRiders(nextState)

      if (this.lastRiderCount !== riderCount) {
        this.lastRiderCount = riderCount
        const { skinEditorSelectedRider, focusDDIndices } = this.state

        if (skinEditorSelectedRider >= riderCount) {
          this.setState({ skinEditorSelectedRider: riderCount - 1 })
        }

        this.triggerManager.updateRiderCount(riderCount)
        this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })
        this.setState({ focusDDIndices: focusDDIndices.map((ddIndex) => Math.min(riderCount - 1, ddIndex)) })
      }

      const sidebarOpen = getSidebarOpen(nextState)

      if (sidebarOpen) {
        this.setState({ active: false })
      }

      const playerRunning = getPlayerRunning(nextState)
      const windowFocused = getWindowFocused(nextState)

      const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused)

      rootElement.style.opacity = shouldBeVisible ? '1' : '0'
      rootElement.style.pointerEvents = shouldBeVisible ? 'auto' : 'none'
    }

    onUpdateToolbarColor (index: number, state: TOOLBAR_COLOR): void {
      this.setState({ toolbarColors: this.state.toolbarColors.map((e,i) => i == index ? state : e) })
    }

    onCreateTrigger (index: number): void {
      const { activeTab, focusDDIndices } = this.state

      if (activeTab === TRIGGER_ID.SKIN) return

      const currentPlayerIndex = getPlayerIndex(store.getState())
      const triggerTime: TriggerTime = [
        Math.floor(currentPlayerIndex / 2400),
        Math.floor((currentPlayerIndex % 2400) / 40),
        Math.floor(currentPlayerIndex % 40)
      ]

      const currentTriggers = this.triggerManager.data[activeTab].triggers
      const newTriggerData = structuredClone((currentTriggers[index] as TimedTrigger)[1])
      const newTrigger = [triggerTime, newTriggerData] as TimedTrigger
      const newTriggers = currentTriggers.slice(0, index + 1).concat([newTrigger]).concat(currentTriggers.slice(index + 1))
      this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab)
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      const newTriggerArray = this.triggerManager.data[activeTab].triggers

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({ focusDDIndices: focusDDIndices.slice(0, index + 1).concat([0]).concat(focusDDIndices.slice(index + 1)) })
      }

      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
    }

    onUpdateTrigger (valueChange: ValueChange, path: any[], constraints?: Constraint, bounded = false): void {
      const { activeTab } = this.state

      const newValue = validateData(valueChange, bounded, constraints)

      this.triggerManager.updateFromPath([activeTab, ...path], newValue, activeTab)
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      const newTriggerArray = this.triggerManager.data[activeTab].triggers

      if (activeTab !== TRIGGER_ID.SKIN) {
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
      }
    }

    onDeleteTrigger (index: number): void {
      const { activeTab, focusDDIndices } = this.state

      if (activeTab === TRIGGER_ID.SKIN) return

      const currentTriggers = this.triggerManager.data[activeTab].triggers
      const newTriggers = currentTriggers.slice(0, index).concat(currentTriggers.slice(index + 1))
      this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab)
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      const newTriggerArray = this.triggerManager.data[activeTab].triggers

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({ focusDDIndices: focusDDIndices.slice(0, index).concat(focusDDIndices.slice(index + 1)) })
      }

      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
    }

    onDownload (): void {
      const jsonString = JSON.stringify(this.triggerManager.data)
      const a = document.createElement('a')
      const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString)
      a.setAttribute('href', data)
      a.setAttribute('download', getTrackTitle(store.getState()) + '.scriptData.json')
      a.click()
      a.remove()
    }

    onClickFile () {
      const triggerUploadInput = (document.getElementById('trigger-file-upload') as HTMLInputElement)
      triggerUploadInput.value = ''
      triggerUploadInput.click()
    }

    onLoadFile (file: File): void {
      const reader = new window.FileReader()
      reader.onload = () => {
        const triggerData = JSON.parse(reader.result as string)
        this.onLoad(triggerData)
      }
      reader.readAsText(file)
    }

    onLoadScript (): void {
      this.onLoad(
        this.parser.parseScript(
          getCurrentScript(store.getState()),
          this.triggerManager.data as TriggerData
        )
      )
    }

    onLoad (nextTriggerData: TriggerData): void {
      const { activeTab } = this.state
      try {
        const focusTriggers = nextTriggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[]
        const focusDDIndices = Array(focusTriggers.length).fill(0) as number[]

        for (let i = 0; i < focusTriggers.length; i++) {
          for (let j = 0; j < focusTriggers[i][1].length; j++) {
            if (focusTriggers[i][1][j] > 0) {
              focusDDIndices[i] = j
              break
            }
          }
        }

        this.setState({ focusDDIndices })

        if (activeTab !== TRIGGER_ID.SKIN) {
          const newTriggerArray = nextTriggerData[activeTab].triggers
          this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
        }

        this.triggerManager.updateFromPath([], nextTriggerData, TRIGGER_ID.ZOOM)
        this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onTest (): void {
      const { activeTab, invalidTimes } = this.state
      try {
        if (!invalidTimes.every((invalid) => !invalid)) {
          throw new Error('Triggers contain invalid times!')
        }

        const script = generateScript(activeTab, this.triggerManager.data as TriggerData)
        // HACK: Already evaluated script, execute it directly
        eval.call(window, script) // eslint-disable-line no-eval
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onPrint (): void {
      const { activeTab, invalidTimes } = this.state
      try {
        if (!invalidTimes.every((invalid) => !invalid)) {
          throw new Error('Triggers contain invalid times!')
        }

        console.info(generateScript(activeTab, this.triggerManager.data as TriggerData))
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onUndo (): void {
      const { activeTab } = this.state

      const tabChange = this.triggerManager.undo()
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      if (activeTab !== tabChange) {
        this.setState({ activeTab: tabChange })
      }

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggerArray = this.triggerManager.data[activeTab].triggers
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
      }
    }

    onRedo (): void {
      const { activeTab } = this.state

      const tabChange = this.triggerManager.redo()
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      if (activeTab !== tabChange) {
        this.setState({ activeTab: tabChange })
      }

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggerArray = this.triggerManager.data[activeTab].triggers
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
      }
    }

    onResetSkin (index: number): void {
      this.triggerManager.updateFromPath(
        [TRIGGER_ID.SKIN, 'triggers', index],
        structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE),
        TRIGGER_ID.SKIN
      )

      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })
    }

    onChangeColor (color?: string, alpha?: string): void {
      const { skinEditorSelectedColor } = this.state

      const hexAlpha: string = alpha != null
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : skinEditorSelectedColor.substring(7)

      const hexColor = color != null
        ? color + hexAlpha
        : skinEditorSelectedColor.substring(0, 7) + hexAlpha

      this.setState({ skinEditorSelectedColor: hexColor })
    }

    onActivate (): void {
      const { active } = this.state
      const sidebarOpen = getSidebarOpen(store.getState())

      if (!active && sidebarOpen) {
        store.dispatch(closeSidebar())
      }

      this.setState({ active: !active })
    }

    onChangeTab (tabName: TRIGGER_ID): void {
      this.setState({ activeTab: tabName })

      if (tabName !== TRIGGER_ID.SKIN) {
        const newTriggerArray = this.triggerManager.data[tabName].triggers
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) })
      }
    }

    onToggleSettings (): void {
      const { settingsActive, settingsDirty, fontSize, resolution } = this.state

      if (settingsActive && settingsDirty) {
        this.setState({ fontSizeSetting: fontSize })
        this.setState({ resolutionSetting: resolution })
        this.setState({ settingsDirty: false })
      }

      this.setState({ settingsActive: !settingsActive })
    }

    onReport (): void {
      window.open(REPORT_LINK)
    }

    onHelp (): void {
      window.open(HELP_LINK)
    }

    onChangeFontSize (newFontSize: number): void {
      const { fontSize } = this.state

      if (newFontSize !== fontSize) {
        this.setState({ settingsDirty: true })
      }

      this.setState({ fontSizeSetting: newFontSize })
    }

    onChangeViewport (newResolution: ViewportOption): void {
      const { resolution } = this.state

      if (resolution !== newResolution) {
        this.setState({ settingsDirty: true })
      }

      this.setState({ resolutionSetting: newResolution })
    }

    onApplySettings (): void {
      const { resolutionSetting, resolution, fontSizeSetting } = this.state

      const factor = Math.log2(
        SETTINGS[SETTINGS_KEY.VIEWPORT][resolutionSetting].SIZE[0] /
        SETTINGS[SETTINGS_KEY.VIEWPORT][resolution].SIZE[0]
      )

      const size = SETTINGS[SETTINGS_KEY.VIEWPORT][resolutionSetting].SIZE
      store.dispatch(setPlaybackDimensions({ width: size[0], height: size[1] }))

      const zoomTriggers = this.triggerManager.data[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[]
      const newZoomTriggers = zoomTriggers.map(trigger => [trigger[0], Math.round((trigger[1] + factor + Number.EPSILON) * 1e7) / 1e7])
      this.triggerManager.updateFromPath([TRIGGER_ID.ZOOM, 'triggers'], newZoomTriggers, TRIGGER_ID.ZOOM)
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag })

      saveSetting(SETTINGS_KEY.FONT_SIZE, String(fontSizeSetting))
      saveSetting(SETTINGS_KEY.VIEWPORT, resolutionSetting)

      this.setState({ settingsDirty: false })
      this.setState({ fontSize: fontSizeSetting })
      this.setState({ resolution: resolutionSetting })
    }

    onChangeFocusDD (index: number, value: string): void {
      const { focusDDIndices } = this.state
      const nextFocusDDIndices = [...focusDDIndices]
      nextFocusDDIndices[index] = parseInt(value, 10)
      this.setState({ focusDDIndices: nextFocusDDIndices })
    }

    onChangeSkinDD (value: string): void {
      this.setState({ skinEditorSelectedRider: parseInt(value, 10) })
    }

    onZoomSkinEditor (e: Event | WheelEvent, isMouseAction: boolean): void {
      const { skinEditorZoom } = this.state
      const rect = (document.getElementById('skinElementContainer') as HTMLElement).getBoundingClientRect()
      const [scale, xOffset, yOffset] = skinEditorZoom
      let newScale = scale
      let newXOffset = xOffset
      let newYOffset = yOffset

      if (isMouseAction) {
        const eWheel = e as WheelEvent
        if (scale < CONSTRAINTS.SKIN_ZOOM.MAX) {
          newXOffset = (eWheel.clientX - rect.x) / scale
          newYOffset = (eWheel.clientY - rect.y) / scale
        }
        newScale = Math.max(Math.min(
          scale - eWheel.deltaY * 1e-3,
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      } else {
        newScale = Math.max(Math.min(
          parseInt((e.target as HTMLInputElement).value),
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      }

      this.setState({ skinEditorZoom: [newScale, newXOffset, newYOffset] })
    }

    render (): ReactComponent {
      this.componentManager.updateState(this.state)
      return this.componentManager.main()
    }
  }

  class ComponentManager { // eslint-disable-line @typescript-eslint/no-unused-vars
    root: RootComponent
    state: RootState

    constructor (root: RootComponent) {
      this.root = root
      this.state = root.state
    }

    updateState (nextState: RootState): void {
      this.state = nextState
    }

    main (): ReactComponent {
      const { state } = this
      return e(
        'div',
        { style: GLOBAL_STYLES.text },
        this.toolbar(),
        state.active && e(
          'div',
          { style: STYLES.content },
          state.settingsActive && this.settingsContainer(),
          !(state.settingsActive) && this.tabContainer(),
          !(state.settingsActive) && this.window()
        )
      )
    }

    toolbar (): ReactComponent {
      const { root, state } = this
      return e(
        'div',
        { style: STYLES.toolbar.container },
        !state.active && this.toolbarButton('Maximize', 0, false, () => root.onActivate(), maximizeIcon),
        state.active && e(
          'div',
          { style: { ...STYLES.toolbar.container, justifyContent: 'start' } },
          this.toolbarButton('Minimize', 0, false, () => root.onActivate(), minimizeIcon),
          this.toolbarButton('Download', 1, false, () => root.onDownload(), downloadIcon),
          this.toolbarButton('Upload', 2, false, () => root.onClickFile(), uploadIcon),
          this.toolbarButton('Load From Script', 3, false, () => root.onLoadScript(), upRightArrowIcon),
          this.toolbarButton('Load From Script', 4, false, () => root.onLoadScript(), upRightArrowIcon),
          this.toolbarButton('Run', 5, state.invalidTimes.some(i => i), () => root.onTest(), playIcon),
          this.toolbarButton('Print To Console', 6, false, () => root.onPrint(), printIcon),
        ),
        state.active && e(
          'div',
          { style: { ...STYLES.toolbar.container, justifyContent: 'end' } },
          this.toolbarButton('Undo', 7, root.triggerManager.undoLen === 0, () => root.onUndo(), leftArrowIcon),
          this.toolbarButton('Redo', 8, root.triggerManager.redoLen === 0, () => root.onRedo(), rightArrowIcon),
          this.toolbarButton('Settings', 9, false, () => root.onToggleSettings(), settingsIcon),
          this.toolbarButton('Report Issue', 10, false, () => root.onReport(), flagIcon),
          this.toolbarButton('Help', 11, false, () => root.onHelp(), helpIcon)
        ),
        e(
          'input',
          {
            id: 'trigger-file-upload',
            style: { display: 'none' },
            type: 'file',
            accept: '.json',
            onChange: (e: Event) => root.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])
          }
        )
      )
    }

    toolbarButton (
      title: string,
      index: number,
      disabled: boolean,
      onClick: Function,
      icon: InlineIcon
    ): ReactComponent {
      const { root, state } = this
      return e(
        'button',
        {
          title,
          style: {
            ...STYLES.button.embedded,
            backgroundColor: STYLES.button.embedded.bgColor[state.toolbarColors[index]]
          },
          onMouseOver: () => !disabled && root.onUpdateToolbarColor(index, TOOLBAR_COLOR.HOVER),
          onMouseOut: () => !disabled && root.onUpdateToolbarColor(index, TOOLBAR_COLOR.NONE),
          onMouseDown: () => !disabled && root.onUpdateToolbarColor(index, TOOLBAR_COLOR.ACTIVE),
          onMouseUp: () => !disabled && root.onUpdateToolbarColor(index, TOOLBAR_COLOR.HOVER),
          onClick,
          disabled
        },
        e('span', {
          ...icon, style: { color: disabled ? GLOBAL_STYLES.gray : GLOBAL_STYLES.black }
        })
      )
    }

    settingsContainer (): ReactComponent {
      return e(
        'div',
        { style: STYLES.settings.window },
        this.settingsHeader(),
        this.settings()
      )
    }

    settingsHeader (): ReactComponent {
      const { root, state } = this
      return e(
        'div',
        { style: STYLES.settings.header },
        e(
          'button',
          {
            style: {
              ...STYLES.button.embedded,
              position: 'absolute',
              fontSize: '32px',
              right: '0px'
            },
            onClick: () => root.onToggleSettings()
          },
          e('span', xIcon)
        ),
        e('text', {
          style: {
            fontSize: GLOBAL_STYLES.textSizes.L[state.fontSize]
          }
        }, 'Settings'),
        e('button', {
          style: {
            ...STYLES.button.settings,
            position: 'absolute',
            fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
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
      const { root, state } = this
      return e(
        window.React.Fragment,
        { style: { fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize] } },
        e(
          'div',
          { style: STYLES.settings.row },
          e('text', {
            style: {
              ...STYLES.settings.label,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
            }
          }, 'Font Sizes'),
          e(
            'div',
            {
              style: {
                ...STYLES.settings.parameter,
                fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
              }
            },
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL)
            }, e('text', null, 'Small')),
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM)
            }, e('text', null, 'Medium')),
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE)
            }, e('text', null, 'Large'))
          )
        ),
        e(
          'div',
          { style: STYLES.settings.row },
          e('text', {
            style: {
              ...STYLES.settings.label,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
            }
          }, 'Viewport'),
          e(
            'div',
            {
              style: {
                ...STYLES.settings.parameter,
                fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
              }
            },
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID)
            }, e('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].HD.NAME)),
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID)
            }, e('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.NAME)),
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID)
            }, e('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.NAME)),
            e('button', {
              style: {
                ...STYLES.button.settings,
                backgroundColor:
                  state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID
                    ? GLOBAL_STYLES.light_gray1
                    : GLOBAL_STYLES.dark_gray1
              },
              onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID)
            }, e('text', null, SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.NAME))
          )
        )
      )
    }

    tabContainer (): ReactComponent {
      return e(
        'div',
        { style: STYLES.tabs.container },
        Object.keys(
          TRIGGER_PROPS
        ).map((command: string) => e(
          'div',
          null,
          this.tab(command as TRIGGER_ID)
        ))
      )
    }

    tab (tabID: TRIGGER_ID): ReactComponent {
      const { root, state } = this
      return e('button', {
        style: {
          ...STYLES.tabs.button,
          backgroundColor:
            state.activeTab === tabID
              ? GLOBAL_STYLES.light_gray1
              : GLOBAL_STYLES.dark_gray1
        },
        onClick: () => root.onChangeTab(tabID)
      }, e(
        'text',
        { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } },
        TRIGGER_PROPS[tabID].DISPLAY_NAME
      ))
    }

    window (): ReactComponent {
      const { state, root } = this
      const data = root.triggerManager.data[state.activeTab]

      if (data.id === TRIGGER_ID.SKIN) {
        return e(
          'div',
          { style: STYLES.window },
          this.skinEditorToolbar(state.skinEditorSelectedRider),
          this.skinEditor(data.triggers as SkinCssTrigger[])
        )
      }

      if (data.id === TRIGGER_ID.GRAVITY) {
        return e(
          'div',
          { style: STYLES.window },
          Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))
        )
      }

      return e(
        'div',
        { style: STYLES.window },
        this.smoothTab(),
        Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))
      )
    }

    smoothTab (): ReactComponent {
      const { root, state } = this
      const data = root.triggerManager.data[state.activeTab]
      return e(
        'div',
        { style: STYLES.smooth.container },
        e('label', {
          for: 'smoothTextInput',
          style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }
        }, 'Smoothing'),
        data.id !== TRIGGER_ID.TIME && e('input', {
          id: 'smoothTextInput',
          style: {
            ...STYLES.smooth.input,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize],
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
        data.id === TRIGGER_ID.TIME && e(
          'div',
          { style: STYLES.checkbox.container },
          e('input', {
            id: 'smoothTextInput',
            style: STYLES.checkbox.primary,
            type: 'checkbox',
            onChange: () => root.onUpdateTrigger(
              {
                prev: root.triggerManager.data[state.activeTab].interpolate,
                new: !(root.triggerManager.data[state.activeTab].interpolate as boolean)
              },
              ['interpolate'],
              CONSTRAINTS.INTERPOLATE
            )
          }),
          data.interpolate as boolean && e('square', { style: STYLES.checkbox.fill })
        )
      )
    }

    trigger (index: number): ReactComponent {
      const { root, state } = this
      const data = root.triggerManager.data[state.activeTab]
      const currentTrigger = data.triggers[index]

      return e(
        'div',
        {
          style: {
            ...STYLES.trigger.container,
            fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
            backgroundColor: index === 0 ? GLOBAL_STYLES.gray : GLOBAL_STYLES.white
          }
        },
        e(
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
          e('span', {
            ...xIcon,
            style: {
              color: index === 0 ? GLOBAL_STYLES.dark_gray2 : GLOBAL_STYLES.black
            }
          })
        ),
        data.id !== TRIGGER_ID.SKIN && this.timeStamp((currentTrigger as TimedTrigger)[0], index),
        data.id === TRIGGER_ID.ZOOM && this.zoomTrigger((currentTrigger as ZoomTrigger), index),
        data.id === TRIGGER_ID.PAN && this.cameraPanTrigger((currentTrigger as CameraPanTrigger), index),
        data.id === TRIGGER_ID.FOCUS && this.cameraFocusTrigger((currentTrigger as CameraFocusTrigger), index),
        data.id === TRIGGER_ID.TIME && this.timeRemapTrigger((currentTrigger as TimeRemapTrigger), index),
        data.id === TRIGGER_ID.SKIN && false,
        data.id === TRIGGER_ID.GRAVITY && this.gravityTrigger((currentTrigger as GravityTrigger), index),
        e(
          'button',
          {
            style: STYLES.trigger.createButton,
            onClick: () => root.onCreateTrigger(index)
          },
          e('span', plusIcon)
        )
      )
    }

    timeStamp (data: TriggerTime, index: number): ReactComponent {
      const { root, state } = this
      const tProps = [
        CONSTRAINTS.MINUTE,
        CONSTRAINTS.SECOND,
        CONSTRAINTS.FRAME
      ]

      return e(
        'div',
        { style: STYLES.trigger.property },
        data.map((timeValue, timeIndex) => e(
          'div',
          null,
          e(
            'text',
            { style: STYLES.trigger.text },
            ['Time', ':', ':'][timeIndex]
          ),
          e('input', {
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
      const { root } = this
      const labels = ['Zoom To']

      return e(
        'div',
        { style: STYLES.trigger.property },
        e('label', {
          for: `zoomTriggerText_${labels[0]}_${index}`,
          style: STYLES.trigger.text
        }, labels[0]),
        e('input', {
          id: `zoomTriggerText_${labels[0]}_${index}`,
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
      const { root } = this
      const cProps = [
        CONSTRAINTS.PAN_WIDTH,
        CONSTRAINTS.PAN_HEIGHT,
        CONSTRAINTS.PAN_X,
        CONSTRAINTS.PAN_Y
      ]
      const labels = ['Width', 'Height', 'Offset X', 'Offset Y']

      return e(
        window.React.Fragment,
        null,
        [['w', 'h'], ['x', 'y']].map((pair, pairIndex) => e(
          'div',
          { style: { display: 'flex', flexDirection: 'row' } },
          pair.map((prop, propIndex) => e(
            'div',
            { style: STYLES.trigger.property },
            e('label', {
              for: `camTriggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
              style: STYLES.trigger.text
            }, labels[propIndex + 2 * pairIndex]),
            e('input', {
              id: `camTriggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
              style: STYLES.trigger.input,
              value: data[1][prop as 'w' | 'h' | 'x' | 'y'],
              onChange: (e: Event) => root.onUpdateTrigger(
                { prev: data[1][prop as 'w' | 'h' | 'x' | 'y'], new: (e.target as HTMLInputElement).value },
                ['triggers', index, 1, prop],
                cProps[propIndex + 2 * pairIndex]
              ),
              onBlur: (e: Event) => root.onUpdateTrigger(
                { prev: data[1][prop as 'w' | 'h' | 'x' | 'y'], new: (e.target as HTMLInputElement).value },
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
      const { root, state } = this
      const dropdownIndex = state.focusDDIndices[index]
      const labels = ['Weight']

      return e(
        'div',
        { style: STYLES.trigger.property },
        e(
          'select',
          {
            style: STYLES.dropdown.head,
            value: dropdownIndex,
            onChange: (e: Event) => root.onChangeFocusDD(index, (e.target as HTMLInputElement).value)
          },
          Object.keys(data[1]).map((riderIndex) => {
            const riderNum = 1 + parseInt(riderIndex, 10)

            return e('option', {
              style: STYLES.dropdown.option,
              value: parseInt(riderIndex, 10)
            }, e('text', null, `Rider ${riderNum}`))
          })
        ),
        e('label', {
          for: `focusTriggerText_${labels[0]}_${dropdownIndex}_${index}`,
          style: STYLES.trigger.text
        }, labels[0]),
        e('input', {
          id: `focusTriggerText_${labels[0]}_${dropdownIndex}_${index}`,
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
      const { root } = this
      const labels = ['Speed']

      return e(
        'div',
        { style: STYLES.trigger.property },
        e('label', {
          for: `timeTriggerText_${labels[0]}_${index}`,
          style: STYLES.trigger.text
        }, labels[0]),
        e('input', {
          id: `timeTriggerText_${labels[0]}_${index}`,
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

    gravityTrigger (data: GravityTrigger, index: number): ReactComponent {
      const { root } = this
      const cProps = [CONSTRAINTS.GRAVITY_X, CONSTRAINTS.GRAVITY_Y]
      const labels = ['Gravity X', 'Y']
      const props = ['x', 'y']

      return e(
        'div',
        { style: { display: 'flex', flexDirection: 'row' } },
        props.map((prop, propIndex) => e(
          'div',
          { style: STYLES.trigger.property },
          e('label', {
            for: `gravityTriggerText_${labels[propIndex]}_${index}`,
            style: STYLES.trigger.text
          }, labels[propIndex]),
          e('input', {
            id: `gravityTriggerText_${labels[propIndex]}_${index}`,
            style: STYLES.trigger.input,
            value: data[1][prop as 'x' | 'y'],
            onChange: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as 'x' | 'y'], new: (e.target as HTMLInputElement).value },
              ['triggers', index, 1, prop],
              cProps[propIndex]
            ),
            onBlur: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as 'x' | 'y'], new: (e.target as HTMLInputElement).value },
              ['triggers', index, 1, prop],
              cProps[propIndex],
              true
            )
          })
        ))
      )
    }

    skinEditor (data: SkinCssTrigger[]): ReactComponent {
      const { root, state } = this
      const dropdownIndex = state.skinEditorSelectedRider

      return e(
        'div',
        { style: STYLES.skinEditor.container },
        e('div', { style: STYLES.skinEditor.background }),
        e(
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
          e('svg', { width: '10vw' }),
          this.riderSvg(data[dropdownIndex], dropdownIndex)
        ),
        e(
          'div',
          { style: STYLES.skinEditor.zoomContainer },
          e('input', {
            style: { height: '10px' },
            type: 'range',
            min: CONSTRAINTS.SKIN_ZOOM.MIN,
            max: CONSTRAINTS.SKIN_ZOOM.MAX,
            step: 0.1,
            value: state.skinEditorZoom[0],
            onChange: (e: Event) => root.onZoomSkinEditor(e, false)
          }),
          e(
            'text',
            { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } },
            `x${Math.round(state.skinEditorZoom[0] * 10) / 10}`
          )
        ),
        e(
          'div',
          { style: STYLES.skinEditor.outlineColor.container },
          e('text', { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } }, 'Outline'),
          e('div', {
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

    skinEditorToolbar (index: number): ReactComponent {
      const { root, state } = this
      const data = root.triggerManager.data[TRIGGER_ID.SKIN].triggers
      const colorValue = state.skinEditorSelectedColor.substring(0, 7)
      const alphaValue = parseInt(state.skinEditorSelectedColor.substring(7), 16) / 255

      return e(
        'div',
        { style: STYLES.skinEditor.toolbar },
        e(
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
          e('span', trashIcon)
        ),
        e(
          'div',
          {
            style: {
              ...STYLES.skinEditor.toolbarItem,
              ...STYLES.alpha.container,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
            }
          },
          e('label', { for: 'alphaSlider' }, 'Transparency'),
          e(
            'div',
            { style: STYLES.alpha.sliderContainer },
            e('input', {
              id: 'alphaSlider',
              style: STYLES.alpha.slider,
              type: 'range',
              min: CONSTRAINTS.ALPHA_SLIDER.MIN,
              max: CONSTRAINTS.ALPHA_SLIDER.MAX,
              step: 0.01,
              value: alphaValue,
              onChange: (e: Event) => root.onChangeColor(undefined, (e.target as HTMLInputElement).value)
            })
          )
        ),
        e('input', {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            height: '40px',
            width: '40px'
          },
          type: 'color',
          value: colorValue,
          onChange: (e: Event) => root.onChangeColor((e.target as HTMLInputElement).value, undefined)
        }),
        e(
          'select',
          {
            style: {
              ...STYLES.skinEditor.toolbarItem,
              ...STYLES.dropdown.head,
              fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize]
            },
            value: index,
            onChange: (e: Event) => root.onChangeSkinDD((e.target as HTMLInputElement).value)
          },
          Object.keys(data).map((riderIndex) => {
            const riderNum = 1 + parseInt(riderIndex, 10)

            return e('option', {
              style: STYLES.dropdown.option,
              value: parseInt(riderIndex, 10)
            }, e('text', null, `Rider ${riderNum}`))
          })
        )
      )
    }

    flagSvg (data: SkinCssTrigger, index: number): ReactComponent {
      const { root, state } = this
      const color = state.skinEditorSelectedColor
      return e(
        'svg',
        { height: '18', width: '15', style: { transform: 'scale(5)' } },
        e('path', {
          ...STYLES.riderProps.flag,
          fill: data.flag.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'flag', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.flagOutline,
          fill: data.flag.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'flag', 'fill'])
        })
      )
    }

    riderSvg (data: SkinCssTrigger, index: number): ReactComponent {
      const { root, state } = this
      const color = state.skinEditorSelectedColor
      return e(
        'svg',
        { height: '25', width: '31', style: { transform: 'scale(5)' } },
        e('rect', {
          ...STYLES.riderProps.skin,
          fill: data.skin.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'skin', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.nose,
          stroke: data.outline.stroke,
          fill: data.skin.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'skin', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.hair,
          fill: data.hair.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hair', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.faceOutline,
          fill: data.hair.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hair', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.hairFill,
          fill: data.fill.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'fill', 'fill'])
        }),
        e('polygon', {
          ...STYLES.riderProps.eye,
          fill: data.eye.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'eye', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.sled,
          stroke: data.outline.stroke,
          fill: data.sled.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'sled', 'fill'])
        }),
        e('line', {
          ...STYLES.riderProps.string,
          stroke: data.string.stroke,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'string', 'stroke'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.armHand,
          stroke: data.outline.stroke,
          fill: data.armHand.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'armHand', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.legPants,
          stroke: data.outline.stroke,
          fill: data.legPants.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'legPants', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.legFoot,
          stroke: data.outline.stroke,
          fill: data.legFoot.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'legFoot', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfEven,
          ...STYLES.riderProps.id_scarf0a,
          fill: data.id_scarf0.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf0', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfEven,
          ...STYLES.riderProps.id_scarf0b,
          fill: data.id_scarf0.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf0', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfOdd,
          ...STYLES.riderProps.id_scarf1,
          fill: data.id_scarf1.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf1', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfOdd,
          ...STYLES.riderProps.id_scarf2,
          fill: data.id_scarf2.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf2', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfOdd,
          ...STYLES.riderProps.id_scarf3,
          fill: data.id_scarf3.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf3', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfOdd,
          ...STYLES.riderProps.id_scarf4,
          fill: data.id_scarf4.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf4', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.id_scarfOdd,
          ...STYLES.riderProps.id_scarf5,
          fill: data.id_scarf5.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'id_scarf5', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.torso,
          stroke: data.outline.stroke,
          fill: data.torso.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'torso', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.scarfOdd,
          ...STYLES.riderProps.scarf1,
          fill: data.scarf1.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf1', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.scarfOdd,
          ...STYLES.riderProps.scarf2,
          fill: data.scarf2.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf2', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.scarfOdd,
          ...STYLES.riderProps.scarf3,
          fill: data.scarf3.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf3', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.scarfOdd,
          ...STYLES.riderProps.scarf4,
          fill: data.scarf4.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf4', 'fill'])
        }),
        e('rect', {
          ...STYLES.riderProps.scarfOdd,
          ...STYLES.riderProps.scarf5,
          fill: data.scarf5.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'scarf5', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.hatTop,
          stroke: data.outline.stroke,
          fill: data.hatTop.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatTop', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.hatBottom,
          stroke: data.hatBottom.stroke,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatBottom', 'stroke'])
        }),
        e('circle', {
          ...STYLES.riderProps.hatBall,
          fill: data.hatBall.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'hatBall', 'fill'])
        }),
        e('path', {
          ...STYLES.riderProps.outline,
          ...STYLES.riderProps.armSleeve,
          stroke: data.outline.stroke,
          fill: data.armSleeve.fill,
          onClick: () => root.onUpdateTrigger({ new: color }, ['triggers', index, 'armSleeve', 'fill'])
        })
      )
    }
  }

  return RootComponent
}
