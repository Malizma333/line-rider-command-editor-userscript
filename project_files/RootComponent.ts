interface RootState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerData: TriggerData
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
}

function InitRoot (): ReactComponent { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { store, React } = window
  const rootElement = document.getElementById(ROOT_NODE_ID) as HTMLElement

  return class RootComponent extends React.Component {
    readonly componentManager = new ComponentManager(React.createElement, this)
    readonly parser = new ScriptParser()
    readonly state: RootState
    readonly setState: SetState
    lastRiderCount: number | undefined

    constructor () {
      super()

      this.state = {
        active: false,
        activeTab: TRIGGER_ID.ZOOM,
        triggerData: {
          [TRIGGER_ID.ZOOM]: {
            id: TRIGGER_ID.ZOOM,
            triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.ZOOM].TEMPLATE)],
            smoothing: CONSTRAINTS.SMOOTH.DEFAULT
          },
          [TRIGGER_ID.PAN]: {
            id: TRIGGER_ID.PAN,
            triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.PAN].TEMPLATE)],
            smoothing: CONSTRAINTS.SMOOTH.DEFAULT
          },
          [TRIGGER_ID.FOCUS]: {
            id: TRIGGER_ID.FOCUS,
            triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.FOCUS].TEMPLATE)],
            smoothing: CONSTRAINTS.SMOOTH.DEFAULT
          },
          [TRIGGER_ID.TIME]: {
            id: TRIGGER_ID.TIME,
            triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.TIME].TEMPLATE)],
            interpolate: CONSTRAINTS.INTERPOLATE.DEFAULT
          },
          [TRIGGER_ID.SKIN]: {
            id: TRIGGER_ID.SKIN,
            triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE)]
          }
        },
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
        invalidTimes: []
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
        const { triggerData, skinEditorSelectedRider: selectedSkinEditorRider, focusDDIndices } = this.state

        if (selectedSkinEditorRider >= riderCount) {
          this.setState({ selectedSkinEditorRider: riderCount - 1 })
        }

        let nextTriggerData = resizedFocusWeightArrays(riderCount, triggerData)
        nextTriggerData = resizedSkinArray(riderCount, nextTriggerData)

        this.setState({ triggerData: nextTriggerData })
        this.setState({ focusDDIndices: clampedFocusDDs(riderCount, focusDDIndices) })
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

    onCreateTrigger (index: number): void {
      const { triggerData, activeTab, focusDDIndices } = this.state

      if (activeTab === TRIGGER_ID.SKIN) return

      const commandData = triggerData[activeTab]
      const newTrigger = structuredClone(commandData.triggers[index] as TimedTrigger)

      const currentPlayerIndex = getPlayerIndex(store.getState())
      newTrigger[0] = [
        Math.floor(currentPlayerIndex / 2400),
        Math.floor((currentPlayerIndex % 2400) / 40),
        Math.floor(currentPlayerIndex % 40)
      ]

      const triggerStart = triggerData[activeTab].triggers.slice(0, index + 1)
      const triggerEnd = triggerData[activeTab].triggers.slice(index + 1)
      const newTriggers = [...triggerStart, newTrigger, ...triggerEnd]

      triggerData[activeTab].triggers = newTriggers

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({
          focusDDIndices:
          resizedFocusDDIndexArray(
            newTriggers.length,
            focusDDIndices
          )
        })
      }

      this.setState({ invalidTimes: validateTimes(newTriggers as TimedTrigger[]) })
      this.setState({ triggerData })
    }

    onUpdateTrigger (valueChange: ValueChange, path: any[], constraints?: Constraint, bounded = false): void {
      const { triggerData, activeTab } = this.state
      let pathPointer: any = triggerData[activeTab]

      for (let i = 0; i < path.length - 1; i += 1) {
        pathPointer = pathPointer[path[i]]
      }

      pathPointer[path[path.length - 1]] = validateData(
        valueChange,
        bounded,
        constraints
      )

      if (activeTab !== TRIGGER_ID.SKIN) {
        const triggers = triggerData[activeTab].triggers as TimedTrigger[]
        this.setState({ invalidTimes: validateTimes(triggers) })
      }

      this.setState({ triggerData })
    }

    onDeleteTrigger (index: number): void {
      const { triggerData, activeTab, focusDDIndices } = this.state

      if (activeTab === TRIGGER_ID.SKIN) return

      const newTriggers: Trigger[] = []
      for (let i = 0; i < triggerData[activeTab].triggers.length; i++) {
        if (i !== index) {
          newTriggers.push(structuredClone(triggerData[activeTab].triggers[i]) as Trigger)
        }
      }

      triggerData[activeTab].triggers = newTriggers

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({
          focusDDIndices: resizedFocusDDIndexArray(
            newTriggers.length,
            focusDDIndices
          )
        })
      }

      this.setState({ invalidTimes: validateTimes(newTriggers as TimedTrigger[]) })
      this.setState({ triggerData })
    }

    onDownload (): void {
      const { triggerData } = this.state
      const a = document.createElement('a')
      const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(triggerData))
      a.setAttribute('href', data)
      a.setAttribute('download', getTrackTitle(store.getState()) + '.scriptData.json')
      a.click()
      a.remove()
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
      const { triggerData } = this.state
      this.onLoad(
        this.parser.parseScript(
          getCurrentScript(store.getState()),
          triggerData
        )
      )
    }

    onLoad (nextTriggerData: TriggerData): void {
      const { focusDDIndices, activeTab } = this.state
      try {
        Object.keys(TRIGGER_PROPS).forEach((command: string) => {
          if (command === TRIGGER_ID.FOCUS) {
            let nextFocusDDIndices = [...focusDDIndices]
            nextFocusDDIndices = resizedFocusDDIndexArray(
              nextTriggerData[command].triggers.length,
              nextFocusDDIndices
            )
            nextFocusDDIndices = chosenFocusDDIndices(
              nextTriggerData,
              nextFocusDDIndices
            )
            this.setState({ focusDDIndices: nextFocusDDIndices })
          }
        })

        if (activeTab !== TRIGGER_ID.SKIN) {
          const triggers = nextTriggerData[activeTab].triggers as TimedTrigger[]
          this.setState({ invalidTimes: validateTimes(triggers) })
        }

        this.setState({ triggerData: nextTriggerData })
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onTest (): void {
      const { activeTab, triggerData } = this.state
      try {
        const script = generateScript(activeTab, triggerData)
        // HACK: Already evaluated script, execute it directly
        eval.call(window, script) // eslint-disable-line no-eval
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onPrint (): void {
      const { activeTab, triggerData } = this.state
      try {
        console.info(generateScript(activeTab, triggerData))
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onUndo (): void {
      const { activeTab, triggerData } = this.state
      console.log('Undo')

      if (activeTab !== TRIGGER_ID.SKIN) {
        const triggers = triggerData[activeTab].triggers as TimedTrigger[]
        this.setState({ invalidTimes: validateTimes(triggers) })
      }
    }

    onRedo (): void {
      const { activeTab, triggerData } = this.state
      console.log('Redo')

      if (activeTab !== TRIGGER_ID.SKIN) {
        const triggers = triggerData[activeTab].triggers as TimedTrigger[]
        this.setState({ invalidTimes: validateTimes(triggers) })
      }
    }

    onResetSkin (index: number): void {
      const { triggerData } = this.state
      if (!window.confirm('Are you sure you want to reset the current rider\'s skin?')) return

      const defaultSkin = structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE)
      const skinCssArray = [...triggerData[TRIGGER_ID.SKIN].triggers]
      skinCssArray[index] = defaultSkin

      this.setState({
        triggerData: {
          ...triggerData,
          [TRIGGER_ID.SKIN]: {
            ...triggerData[TRIGGER_ID.SKIN],
            triggers: skinCssArray
          }
        }
      })
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
      const { triggerData } = this.state

      this.setState({ activeTab: tabName })
      if (tabName !== TRIGGER_ID.SKIN) {
        const triggers = triggerData[tabName].triggers as TimedTrigger[]
        this.setState({ invalidTimes: validateTimes(triggers) })
      }
    }

    onToggleSettings (active: boolean): void {
      const { settingsDirty, fontSize, resolution } = this.state

      if (!active && settingsDirty) {
        if (!window.confirm('Discard changes?')) return
        this.setState({ fontSizeSetting: fontSize })
        this.setState({ resolutionSetting: resolution })
        this.setState({ settingsDirty: false })
      }

      this.setState({ settingsActive: active })
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
      const { triggerData, resolutionSetting, resolution, fontSizeSetting } = this.state

      const factor = Math.log2(
        SETTINGS[SETTINGS_KEY.VIEWPORT][resolutionSetting].SIZE[0] /
        SETTINGS[SETTINGS_KEY.VIEWPORT][resolution].SIZE[0]
      )

      const size = SETTINGS[SETTINGS_KEY.VIEWPORT][resolutionSetting].SIZE
      store.dispatch(setPlaybackDimensions({ width: size[0], height: size[1] }))

      const zoomTriggers = triggerData[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[]

      for (let i = 0; i < zoomTriggers.length; i++) {
        zoomTriggers[i][1] = Math.round((
          zoomTriggers[i][1] + factor + Number.EPSILON
        ) * 10e6) / 10e6
      }

      this.setState({
        triggerData: {
          ...triggerData,
          [TRIGGER_ID.ZOOM]: {
            ...triggerData[TRIGGER_ID.ZOOM],
            triggers: zoomTriggers
          }
        }
      })

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
      this.setState({ selectedSkinEditorRider: parseInt(value, 10) })
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
}
