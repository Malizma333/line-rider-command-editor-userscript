function InitRoot (): ReactComponent { // eslint-disable-line @typescript-eslint/no-unused-vars
  const { store, React } = window
  const rootElement = document.getElementById(ROOT_NODE_ID) as HTMLElement

  return class RootComponent extends React.Component {
    computed: any
    componentManager: any
    state: any
    setState: any
    parser: ScriptParser

    /**
     * Clamps the skin editor dropdown index to be less than the number of riders
     */
    static clampedSkinDD (riderCount: any, skinEditorState: any): any {
      let { ddIndex } = skinEditorState

      if (skinEditorState.ddIndex >= riderCount) {
        ddIndex = riderCount - 1
      }

      return { ...skinEditorState, ddIndex }
    }

    /**
     * Resizes the skin array to match the number of riders
     */
    static resizedSkinArray (riderCount: any, triggerData: any): any {
      const nextTriggerData = triggerData
      const skinTriggers = nextTriggerData[TRIGGER_TYPES.SKIN].triggers
      const oldLength = skinTriggers.length

      if (oldLength < riderCount) {
        skinTriggers.push(...Array(riderCount - oldLength).fill(structuredClone(
          TRIGGER_PROPS[TRIGGER_TYPES.SKIN].TEMPLATE
        )))
      }

      if (oldLength > riderCount) {
        skinTriggers.splice(riderCount, oldLength - riderCount)
      }

      nextTriggerData[TRIGGER_TYPES.SKIN].triggers = skinTriggers
      return nextTriggerData
    }

    /**
     * Resizes the focuser trigger weight arrays to match the number of riders
     */
    static resizedFocusWeightArrays (riderCount: any, triggerData: any): any {
      const nextTriggerData = triggerData
      const focusTriggers = nextTriggerData[TRIGGER_TYPES.FOCUS].triggers

      focusTriggers.forEach((_: any, i: number) => {
        const oldLength = focusTriggers[i][1].length

        if (oldLength < riderCount) {
          focusTriggers[i][1].push(...Array(riderCount - oldLength).fill(0))
        }
        if (oldLength > riderCount) {
          focusTriggers[i][1].splice(riderCount, oldLength - riderCount)
        }
      })

      nextTriggerData[TRIGGER_TYPES.FOCUS].triggers = focusTriggers
      return nextTriggerData
    }

    /**
     * Clamps the focuser dropdown indices to be less than the number of riders
     */
    static clampedFocusDDs (riderCount: any, focusDDIndices: any): any {
      const nextFocusDDIndices = [] as number[]

      focusDDIndices.forEach((ddIndex: number) => {
        nextFocusDDIndices.push(Math.min(riderCount - 1, ddIndex))
      })

      return nextFocusDDIndices
    }

    /**
     * Resizes the focuser dropdown indices array to match the focus triggers length
     */
    static resizedFocusDDIndexArray (triggerLength: any, focusDDIndices: any): any {
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
    static chosenFocusDDIndices (triggerData: any, focusDDIndices: any): any {
      const nextFocusDDIndices = [...focusDDIndices]
      const focusTriggers = triggerData[TRIGGER_TYPES.FOCUS].triggers

      focusTriggers.forEach((trigger: any, triggerIndex: any) => {
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
    static savedViewport (oldResolution: VIEWPORT_OPTION, newResolution: VIEWPORT_OPTION, triggerData: any): any {
      const nextTriggerData = triggerData

      const factor = Math.log2(
        SETTINGS.VIEWPORT[newResolution].SIZE[0] /
        SETTINGS.VIEWPORT[oldResolution].SIZE[0]
      )

      const size = SETTINGS.VIEWPORT[newResolution].SIZE
      store.dispatch(setPlaybackDimensions({ width: size[0], height: size[1] }))

      nextTriggerData[TRIGGER_TYPES.ZOOM].triggers.forEach((_: any, i: number) => {
        nextTriggerData[TRIGGER_TYPES.ZOOM].triggers[i][1] = Math.round((
          nextTriggerData[TRIGGER_TYPES.ZOOM].triggers[i][1] as number + factor + Number.EPSILON
        ) * 10e6) / 10e6
      })

      return nextTriggerData
    }

    constructor () {
      super()

      this.state = {
        active: false,
        initialized: false,
        activeTab: TRIGGER_TYPES.ZOOM,
        triggerData: {},
        focusDDIndices: [0],
        skinEditorState: {
          ddIndex: 0,
          zoom: { scale: 1 },
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
        }
      }

      this.computed = {
        invalidTimes: [],
        riderCount: 1,
        undoStack: [],
        redoStack: []
      }

      this.componentManager = new ComponentManager(React.createElement, this)
      this.parser = new ScriptParser()

      store.subscribe(() => this.updateStore(store.getState()))
    }

    componentDidMount (): void {
      Object.assign(rootElement.style, STYLES.root)

      window.save_commands = () => {
        this.onDownload()
        return 'Downloaded commands!'
      }

      this.onInit().then(() => {
        this.setState({ initialized: true })
      }).catch((error: any) => {
        console.error(error.message)
      })
    }

    pushAction (oldData: any, newData: any): void {
      this.computed.undoStack.push(oldData)
      this.computed.redoStack.length = 0
    }

    async onInit (): Promise<void> {
      const triggerData = {} as any

      Object.keys(TRIGGER_PROPS).forEach((command: string) => {
        triggerData[command as TRIGGER_TYPES] = {
          id: command,
          triggers: [structuredClone(TRIGGER_PROPS[command as TRIGGER_TYPES].TEMPLATE)]
        }

        switch (command) {
          case TRIGGER_TYPES.FOCUS:
          case TRIGGER_TYPES.PAN:
          case TRIGGER_TYPES.ZOOM:
            triggerData[command as TRIGGER_TYPES].smoothing = CONSTRAINTS.SMOOTH.DEFAULT
            break
          case TRIGGER_TYPES.TIME:
            triggerData[command as TRIGGER_TYPES].interpolate = CONSTRAINTS.INTERPOLATE.DEFAULT
            break
          default:
            break
        }
      })

      this.setState({ triggerData })
    }

    onCreateTrigger (index: number): void {
      const { triggerData, activeTab, focusDDIndices } = this.state
      const commandData = triggerData[activeTab]
      const newTrigger = structuredClone(commandData.triggers[index])

      const currentIndex = getPlayerIndex(store.getState())
      newTrigger[0] = [
        Math.floor(currentIndex / 2400),
        Math.floor((currentIndex % 2400) / 40),
        Math.floor(currentIndex % 40)
      ]

      triggerData[activeTab].triggers.splice(index + 1, 0, newTrigger)

      if (activeTab === TRIGGER_TYPES.FOCUS) {
        this.setState({
          focusDDIndices:
          RootComponent.resizedFocusDDIndexArray(
            triggerData[activeTab].triggers.length,
            focusDDIndices
          )
        })
      }

      this.pushAction(this.state.triggerData, triggerData)
      this.setState({ triggerData })
    }

    onUpdateTrigger (valueChange: ValueChange, path: any, constraints: Constraint, bounded = false): void {
      const { triggerData, activeTab } = this.state
      let pathPointer = triggerData[activeTab]

      for (let i = 0; i < path.length - 1; i += 1) {
        pathPointer = pathPointer[path[i]]
      }

      pathPointer[path[path.length - 1]] = validateData(
        valueChange,
        constraints,
        bounded
      )

      this.pushAction(this.state.triggerData, triggerData)
      this.setState({ triggerData })
    }

    onDeleteTrigger (index: number): void {
      const { triggerData, activeTab, focusDDIndices } = this.state

      triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
        (_: any, i: number) => index !== i
      )

      if (activeTab === TRIGGER_TYPES.FOCUS) {
        this.setState({
          focusDDIndices: RootComponent.resizedFocusDDIndexArray(
            triggerData[activeTab].triggers.length,
            focusDDIndices
          )
        })
      }

      this.pushAction(this.state.triggerData, triggerData)
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

    onLoadFile (file: any): void {
      const reader = new window.FileReader()
      reader.onload = () => {
        const triggerData = JSON.parse(reader.result as string)
        this.onLoad(triggerData)
      }
      reader.readAsText(file)
    }

    onLoadScript (): void {
      this.onLoad(
        this.parser.parseScript(getCurrentScript(store.getState()))
      )
    }

    onLoad (data: any): void {
      try {
        const nextTriggerData = data

        Object.keys(TRIGGER_PROPS).forEach((command) => {
          if (nextTriggerData[command] === undefined) {
            nextTriggerData[command] = this.state.triggerData[command]
            return
          }

          if (command === TRIGGER_TYPES.FOCUS) {
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

        this.pushAction(this.state.triggerData, nextTriggerData)
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
      const difference = this.computed.undoStack.pop()
      this.computed.redoStack.push(difference)
      this.setState({ triggerData: difference })
    }

    onRedo (): void {
      const difference = this.computed.redoStack.pop()
      this.computed.undoStack.push(difference)
      this.setState({ triggerData: difference })
    }

    onResetSkin (index: number): void {
      const { triggerData } = this.state
      if (!window.confirm('Are you sure you want to reset the current rider\'s skin?')) return

      triggerData[TRIGGER_TYPES.SKIN].triggers[index] = structuredClone(
        TRIGGER_PROPS[TRIGGER_TYPES.SKIN].TEMPLATE
      )

      this.pushAction(this.state.triggerData, triggerData)
      this.setState({ triggerData })
    }

    onChangeColor (color?: string, alpha?: string): void {
      const hexAlpha: string = alpha != null
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : this.state.skinEditorState.color.substring(7)

      const hexColor = color != null
        ? color + hexAlpha
        : this.state.skinEditorState.color.substring(0, 7) as string + hexAlpha

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

      if (!(active as boolean) && sidebarOpen) {
        store.dispatch(closeSidebar())
      }

      this.setState({ active: !(active as boolean) })
    }

    onChangeTab (tabName: TRIGGER_TYPES): void {
      this.setState({ activeTab: tabName })
    }

    onToggleSettings (active: boolean): void {
      const { settingsDirty, settings } = this.state

      if (!active && settingsDirty as boolean) {
        if (!window.confirm('Discard changes?')) return
        this.setState({ unsavedSettings: settings })
        this.setState({ settingsDirty: false })
      }

      this.setState({ settingsActive: active })
    }

    onChangeFontSize (fontSize: any): void {
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

    onChangeViewport (resolution: any): void {
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

      this.pushAction(this.state.triggerData, nextTriggerData)
      this.setState({ triggerData: nextTriggerData })

      this.setState({ settingsDirty: false })
      this.setState({
        settings: {
          ...unsavedSettings
        }
      })
    }

    onChangeFocusDD (index: any, value: any): void {
      const nextFocusDDIndices = [...this.state.focusDDIndices]
      nextFocusDDIndices[index] = parseInt(value, 10)
      this.setState({ focusDDIndices: nextFocusDDIndices })
    }

    onChangeSkinDD (value: any): void {
      this.setState({
        skinEditorState: {
          ...this.state.skinEditorState,
          ddIndex: parseInt(value, 10)
        }
      })
    }

    onZoomSkinEditor (event: any, isMouseAction: boolean): void {
      const { skinEditorState } = this.state
      const rect = (document.getElementById('skinElementContainer') as HTMLElement).getBoundingClientRect()
      let { scale, xOffset, yOffset } = skinEditorState.zoom

      if (isMouseAction) {
        if (skinEditorState.zoom.scale < CONSTRAINTS.SKIN_ZOOM.MAX) {
          xOffset = (event.clientX - rect.x) / skinEditorState.zoom.scale
          yOffset = (event.clientY - rect.y) / skinEditorState.zoom.scale
        }
        scale = Math.max(Math.min(
          skinEditorState.zoom.scale - event.deltaY * 1e-3,
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      } else {
        scale = Math.max(Math.min(
          event.target.value,
          CONSTRAINTS.SKIN_ZOOM.MAX
        ), CONSTRAINTS.SKIN_ZOOM.MIN)
      }

      this.setState({
        skinEditorState: {
          ...this.state.skinEditorState,
          zoom: {
            ...this.state.skinEditorState.zoom,
            xOffset,
            yOffset,
            scale
          }
        }
      })
    }

    updateComputed (): void {
      const { triggerData, activeTab } = this.state
      if (activeTab !== TRIGGER_TYPES.SKIN) {
        this.computed.invalidTimes = validateTimes(triggerData[activeTab])
      }
    }

    updateStore (nextState: any): void {
      const riderCount = getNumRiders(nextState)

      if (this.computed.riderCount !== riderCount) {
        this.computed.riderCount = riderCount
        const { triggerData, skinEditorState, focusDDIndices } = this.state

        let nextTriggerData = RootComponent.resizedFocusWeightArrays(riderCount, triggerData)
        nextTriggerData = RootComponent.resizedSkinArray(riderCount, nextTriggerData)
        const nextSkinEditorState = RootComponent.clampedSkinDD(riderCount, skinEditorState)
        const nextFocusDDIndices = RootComponent.clampedFocusDDs(riderCount, focusDDIndices)

        this.pushAction(this.state.triggerData, nextTriggerData)
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

    render (): ReactComponent {
      const { initialized } = this.state
      if (!(initialized as boolean)) return false

      this.updateComputed()

      this.componentManager.updateState(this.state)
      this.componentManager.updateComputed(this.computed)

      return this.componentManager.main()
    }
  }
}
