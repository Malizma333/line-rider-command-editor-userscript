interface RootState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerData: TriggerData
  focusDDIndices: number[]
  skinEditorState: SkinEditorState
  settingsActive: boolean
  settingsDirty: boolean
  settings: SettingsState
  unsavedSettings: SettingsState
  invalidTimes: boolean[]
}

interface SkinEditorState {
  ddIndex: number
  zoom: { scale: number, xOffset: number, yOffset: number }
  color: string
}

interface SettingsState {
  fontSize: number
  resolution: VIEWPORT_OPTION
}

interface RootComputed {
  riderCount: number
}

function InitRoot (): ReactComponent { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { store, React } = window
  const rootElement = document.getElementById(ROOT_NODE_ID) as HTMLElement

  return class RootComponent extends React.Component {
    readonly componentManager = new ComponentManager(React.createElement, this)
    readonly parser = new ScriptParser()
    readonly state: RootState
    readonly setState: SetState
    computed: RootComputed

    /**
     * Clamps the skin editor dropdown index to be less than the number of riders
     */
    static clampedSkinDD (riderCount: number, skinEditorState: SkinEditorState): SkinEditorState {
      let { ddIndex } = skinEditorState

      if (skinEditorState.ddIndex >= riderCount) {
        ddIndex = riderCount - 1
      }

      return { ...skinEditorState, ddIndex }
    }

    /**
     * Resizes the skin array to match the number of riders
     */
    static resizedSkinArray (riderCount: number, triggerData: TriggerData): TriggerData {
      const nextTriggerData = triggerData
      const skinTriggers = nextTriggerData[TRIGGER_ID.SKIN].triggers
      const oldLength = skinTriggers.length

      if (oldLength < riderCount) {
        skinTriggers.push(...Array(riderCount - oldLength).fill(structuredClone(
          TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
        )))
      }

      if (oldLength > riderCount) {
        skinTriggers.splice(riderCount, oldLength - riderCount)
      }

      nextTriggerData[TRIGGER_ID.SKIN].triggers = skinTriggers
      return nextTriggerData
    }

    /**
     * Resizes the focuser trigger weight arrays to match the number of riders
     */
    static resizedFocusWeightArrays (riderCount: number, triggerData: TriggerData): TriggerData {
      const nextTriggerData = triggerData
      const focusTriggers = nextTriggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[]

      for (let i = 0; i < focusTriggers.length; i++) {
        const oldLength = focusTriggers[i][1].length

        if (oldLength < riderCount) {
          focusTriggers[i][1].push(...Array(riderCount - oldLength).fill(0))
        }
        if (oldLength > riderCount) {
          focusTriggers[i][1].splice(riderCount, oldLength - riderCount)
        }
      }

      nextTriggerData[TRIGGER_ID.FOCUS].triggers = focusTriggers
      return nextTriggerData
    }

    /**
     * Clamps the focuser dropdown indices to be less than the number of riders
     */
    static clampedFocusDDs (riderCount: number, focusDDIndices: number[]): number[] {
      const nextFocusDDIndices: number[] = []

      focusDDIndices.forEach((ddIndex: number) => {
        nextFocusDDIndices.push(Math.min(riderCount - 1, ddIndex))
      })

      return nextFocusDDIndices
    }

    /**
     * Resizes the focuser dropdown indices array to match the focus triggers length
     */
    static resizedFocusDDIndexArray (triggerLength: number, focusDDIndices: number[]): number[] {
      const nextFocusDDIndices = [...focusDDIndices]

      const oldLength = focusDDIndices.length

      if (oldLength < triggerLength) {
        nextFocusDDIndices.push(...Array(triggerLength - oldLength).fill(0))
      }

      if (oldLength > triggerLength) {
        nextFocusDDIndices.splice(triggerLength, oldLength - triggerLength)
      }

      return nextFocusDDIndices
    }

    /**
     * Chooses first nonzero weight to be the index of the rider dropdown when loading triggers
     */
    static chosenFocusDDIndices (triggerData: TriggerData, focusDDIndices: number[]): number[] {
      const nextFocusDDIndices = [...focusDDIndices]
      const focusTriggers = triggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[]

      focusTriggers.forEach((trigger: CameraFocusTrigger, triggerIndex: number) => {
        let newIndex = 0
        for (let i = 0; i < trigger[1].length; i += 1) {
          if (trigger[1][i] !== 0) {
            newIndex = i
            break
          }
        }
        nextFocusDDIndices[triggerIndex] = newIndex
      })

      return nextFocusDDIndices
    }

    /**
     * Applies new resolution by converting zoom triggers and saving to playback dimensions
     */
    static savedViewport (oldResolution: VIEWPORT_OPTION, newResolution: VIEWPORT_OPTION, triggerData: TriggerData): TriggerData {
      const nextTriggerData = triggerData

      const factor = Math.log2(
        SETTINGS.VIEWPORT[newResolution].SIZE[0] /
        SETTINGS.VIEWPORT[oldResolution].SIZE[0]
      )

      const size = SETTINGS.VIEWPORT[newResolution].SIZE
      store.dispatch(setPlaybackDimensions({ width: size[0], height: size[1] }))

      const zoomTriggers = nextTriggerData[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[]

      for (let i = 0; i < zoomTriggers.length; i++) {
        zoomTriggers[i][1] = Math.round((
          zoomTriggers[i][1] + factor + Number.EPSILON
        ) * 10e6) / 10e6
      }

      nextTriggerData[TRIGGER_ID.ZOOM].triggers = zoomTriggers

      return nextTriggerData
    }

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
        skinEditorState: {
          ddIndex: 0,
          zoom: { scale: 1, xOffset: 0, yOffset: 0 },
          color: '#000000ff'
        },
        settingsActive: false,
        settingsDirty: false,
        settings: {
          fontSize: SETTINGS.FONT_SIZES.MEDIUM,
          resolution: SETTINGS.VIEWPORT.HD.ID
        },
        unsavedSettings: {
          fontSize: SETTINGS.FONT_SIZES.MEDIUM,
          resolution: SETTINGS.VIEWPORT.HD.ID
        },
        invalidTimes: []
      }

      this.computed = {
        riderCount: 1
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

      if (this.computed.riderCount !== riderCount) {
        this.computed.riderCount = riderCount
        const { triggerData, skinEditorState, focusDDIndices } = this.state

        let nextTriggerData = RootComponent.resizedFocusWeightArrays(riderCount, triggerData)
        nextTriggerData = RootComponent.resizedSkinArray(riderCount, nextTriggerData)
        const nextSkinEditorState = RootComponent.clampedSkinDD(riderCount, skinEditorState)
        const nextFocusDDIndices = RootComponent.clampedFocusDDs(riderCount, focusDDIndices)

        this.setState({ triggerData: nextTriggerData })
        this.setState({ skinEditorState: nextSkinEditorState })
        this.setState({ focusDDIndices: nextFocusDDIndices })
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

      const currentIndex = getPlayerIndex(store.getState())
      newTrigger[0] = [
        Math.floor(currentIndex / 2400),
        Math.floor((currentIndex % 2400) / 40),
        Math.floor(currentIndex % 40)
      ]

      triggerData[activeTab].triggers.splice(index + 1, 0, newTrigger)

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({
          focusDDIndices:
          RootComponent.resizedFocusDDIndexArray(
            triggerData[activeTab].triggers.length,
            focusDDIndices
          )
        })
      }

      this.setState({ triggerData })
    }

    onUpdateTrigger (valueChange: ValueChange, path: Array<string | number>, constraints?: Constraint, bounded = false): void {
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

      this.setState({ triggerData })
    }

    onDeleteTrigger (index: number): void {
      const { triggerData, activeTab, focusDDIndices } = this.state

      triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
        (_: Trigger, i: number) => index !== i
      )

      if (activeTab === TRIGGER_ID.FOCUS) {
        this.setState({
          focusDDIndices: RootComponent.resizedFocusDDIndexArray(
            triggerData[activeTab].triggers.length,
            focusDDIndices
          )
        })
      }

      this.setState({ triggerData })
    }

    onDownload (): void {
      const a = document.createElement('a')
      const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.triggerData))
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
      this.onLoad(
        this.parser.parseScript(
          getCurrentScript(store.getState()),
          this.state.triggerData
        )
      )
    }

    onLoad (nextTriggerData: TriggerData): void {
      try {
        Object.keys(TRIGGER_PROPS).forEach((command: string) => {
          if (command === TRIGGER_ID.FOCUS) {
            let nextFocusDDIndices = [...this.state.focusDDIndices]
            nextFocusDDIndices = RootComponent.resizedFocusDDIndexArray(
              nextTriggerData[command].triggers.length,
              nextFocusDDIndices
            )
            nextFocusDDIndices = RootComponent.chosenFocusDDIndices(
              nextTriggerData,
              nextFocusDDIndices
            )
            this.setState({ focusDDIndices: nextFocusDDIndices })
          }
        })

        this.setState({ triggerData: nextTriggerData })
      } catch (error: any) {
        console.error(error.message)
      }
    }

    onTest (): void {
      const { activeTab, triggerData } = this.state
      try {
        const script = generateScript(activeTab, triggerData)
        // eslint-disable-next-line no-eval
        eval.call(window, script) // HACK: Already evaluated script, execute it directly
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
      console.log('Undo')
    }

    onRedo (): void {
      console.log('Redo')
    }

    onResetSkin (index: number): void {
      const { triggerData } = this.state
      if (!window.confirm('Are you sure you want to reset the current rider\'s skin?')) return

      triggerData[TRIGGER_ID.SKIN].triggers[index] = structuredClone(
        TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
      )

      this.setState({ triggerData })
    }

    onChangeColor (color?: string, alpha?: string): void {
      const hexAlpha: string = alpha != null
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : this.state.skinEditorState.color.substring(7)

      const hexColor = color != null
        ? color + hexAlpha
        : this.state.skinEditorState.color.substring(0, 7) + hexAlpha

      this.setState({
        skinEditorState: {
          ...this.state.skinEditorState,
          color: hexColor
        }
      })
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
    }

    onToggleSettings (active: boolean): void {
      const { settingsDirty, settings } = this.state

      if (!active && settingsDirty) {
        if (!window.confirm('Discard changes?')) return
        this.setState({ unsavedSettings: settings })
        this.setState({ settingsDirty: false })
      }

      this.setState({ settingsActive: active })
    }

    onChangeFontSize (fontSize: number): void {
      const { unsavedSettings, settings } = this.state

      if (fontSize !== settings.fontSize) {
        this.setState({ settingsDirty: true })
      }

      this.setState({
        unsavedSettings: {
          ...unsavedSettings,
          fontSize
        }
      })
    }

    onChangeViewport (resolution: VIEWPORT_OPTION): void {
      const { unsavedSettings, settings } = this.state

      if (resolution !== settings.resolution) {
        this.setState({ settingsDirty: true })
      }

      this.setState({
        unsavedSettings: {
          ...unsavedSettings,
          resolution
        }
      })
    }

    onApplySettings (): void {
      const { triggerData, settings, unsavedSettings } = this.state

      const nextTriggerData = RootComponent.savedViewport(
        settings.resolution,
        unsavedSettings.resolution,
        triggerData
      )

      this.setState({ triggerData: nextTriggerData })

      this.setState({ settingsDirty: false })
      this.setState({
        settings: {
          ...unsavedSettings
        }
      })
    }

    onChangeFocusDD (index: number, value: string): void {
      const nextFocusDDIndices = [...this.state.focusDDIndices]
      nextFocusDDIndices[index] = parseInt(value, 10)
      this.setState({ focusDDIndices: nextFocusDDIndices })
    }

    onChangeSkinDD (value: string): void {
      this.setState({
        skinEditorState: {
          ...this.state.skinEditorState,
          ddIndex: parseInt(value, 10)
        }
      })
    }

    onZoomSkinEditor (e: Event | WheelEvent, isMouseAction: boolean): void {
      const { skinEditorState } = this.state
      const rect = (document.getElementById('skinElementContainer') as HTMLElement).getBoundingClientRect()
      let { scale, xOffset, yOffset } = skinEditorState.zoom

      if (isMouseAction) {
        const eWheel = e as WheelEvent
        if (skinEditorState.zoom.scale < CONSTRAINTS.SKIN_ZOOM.MAX) {
          xOffset = (eWheel.clientX - rect.x) / skinEditorState.zoom.scale
          yOffset = (eWheel.clientY - rect.y) / skinEditorState.zoom.scale
        }
        scale = Math.max(Math.min(
          skinEditorState.zoom.scale - eWheel.deltaY * 1e-3,
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      } else {
        scale = Math.max(Math.min(
          parseInt((e.target as HTMLInputElement).value),
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      }

      this.setState({
        skinEditorState: {
          ...this.state.skinEditorState,
          zoom: {
            xOffset,
            yOffset,
            scale
          }
        }
      })
    }

    render (): ReactComponent {
      // if (this.state.activeTab !== TRIGGER_ID.SKIN) {
      //   const triggers = this.state.triggerData[this.state.activeTab].triggers as TimedTrigger[]
      //   this.setState({ invalidTimes: validateTimes(triggers) })
      // }

      this.componentManager.updateState(this.state)
      return this.componentManager.main()
    }
  }
}
