// eslint-disable-next-line no-unused-vars
function InitRoot () {
  const { store, React } = window

  return class RootComponent extends React.Component {
    /**
     * Clamps the skin editor dropdown index to be less than the number of riders
     */
    static clampedSkinDD (riderCount, skinEditorState) {
      const nextSkinEditorState = skinEditorState

      if (skinEditorState.ddIndex >= riderCount) {
        nextSkinEditorState.ddIndex = riderCount - 1
      }

      return nextSkinEditorState
    }

    /**
     * Resizes the skin array to match the number of riders
     */
    static resizedSkinArray (riderCount, triggerData) {
      const nextTriggerData = triggerData
      const skinTriggers = nextTriggerData[Constants.TRIGGER_TYPES.SKIN].triggers
      const oldLength = skinTriggers.length

      if (oldLength < riderCount) {
        skinTriggers.push(...Array(riderCount - oldLength).fill(structuredClone(
          Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE
        )))
      }

      if (oldLength > riderCount) {
        skinTriggers.splice(riderCount, oldLength - riderCount)
      }

      nextTriggerData[Constants.TRIGGER_TYPES.SKIN].triggers = skinTriggers
      return nextTriggerData
    }

    /**
     * Resizes the focuser trigger weight arrays to match the number of riders
     */
    static resizedFocusWeightArrays (riderCount, triggerData) {
      const nextTriggerData = triggerData
      const focusTriggers = nextTriggerData[Constants.TRIGGER_TYPES.FOCUS].triggers

      focusTriggers.forEach((_, i) => {
        const oldLength = focusTriggers[i][1].length

        if (oldLength < riderCount) {
          focusTriggers[i][1].push(...Array(riderCount - oldLength).fill(0))
        }
        if (oldLength > riderCount) {
          focusTriggers[i][1].splice(riderCount, oldLength - riderCount)
        }
      })

      nextTriggerData[Constants.TRIGGER_TYPES.FOCUS].triggers = focusTriggers
      return nextTriggerData
    }

    /**
     * Clamps the focuser dropdown indices to be less than the number of riders
     */
    static clampedFocusDDs (riderCount, focusDDIndices) {
      const nextFocusDDIndices = focusDDIndices

      nextFocusDDIndices.forEach((_, i) => {
        if (nextFocusDDIndices[i] >= riderCount) {
          nextFocusDDIndices[i] = riderCount - 1
        }
      })

      return nextFocusDDIndices
    }

    /**
     * Resizes the focuser dropdown indices array to match the focus triggers length
     */
    static resizedFocusDDIndexArray (triggerLength, focusDDIndices) {
      const nextFocusDDIndices = focusDDIndices
      const oldLength = nextFocusDDIndices.length

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
    static chosenFocusDDIndices (triggerData, focusDDIndices) {
      const nextFocusDDIndices = focusDDIndices
      const focusTriggers = triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers

      focusTriggers.forEach((trigger, triggerIndex) => {
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

    static savedViewport (oldResolution, newResolution, triggerData) {
      const nextTriggerData = triggerData

      const factor = Math.log2(
        Constants.SETTINGS.VIEWPORT[newResolution].SIZE[0] /
        Constants.SETTINGS.VIEWPORT[oldResolution].SIZE[0]
      )

      const size = Constants.SETTINGS.VIEWPORT[newResolution].SIZE
      store.dispatch(Actions.setPlaybackDimensions({ width: size[0], height: size[1] }))

      nextTriggerData[Constants.TRIGGER_TYPES.ZOOM].triggers.forEach((_, i) => {
        nextTriggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] = Math.round((
          nextTriggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] + factor + Number.EPSILON
        ) * 10e6) / 10e6
      })

      return nextTriggerData
    }

    constructor () {
      super()

      this.state = {
        active: false,
        initialized: false,
        actionPanelState: {
          hasError: false,
          message: '',
          copiedNotify: false
        },
        activeTab: Constants.TRIGGER_TYPES.ZOOM,
        triggerData: {},
        focusDDIndices: [0],
        skinEditorState: {
          ddIndex: 0,
          zoom: { scale: 1 },
          color: '#000000ff'
        },
        settings: {
          fontSize: Constants.SETTINGS.FONT_SIZES.MEDIUM,
          resolution: Constants.SETTINGS.VIEWPORT.HD.ID,
          active: false
        },
        unsavedSettings: {
          fontSize: Constants.SETTINGS.FONT_SIZES.MEDIUM,
          resolution: Constants.SETTINGS.VIEWPORT.HD.ID,
          dirty: false
        }
      }

      this.computed = {
        invalidTimes: [],
        riderCount: 1,
        script: ''
      }

      this.componentManager = new ComponentManager(React.createElement, this)

      store.subscribe(() => this.updateStore(store.getState()))
    }

    componentDidMount () {
      Object.assign(document.getElementById(Constants.ROOT_NODE_ID).style, Styles.root)

      window.save_commands = () => {
        const { triggerData } = this.state
        const r = document.createElement('a')
        let script = ''
        Object.keys(Constants.TRIGGER_PROPS).forEach((command) => {
          script += `${ScriptGenerator.generateScript(command, triggerData)}\n\n`
        })
        const blob = new Blob([script], { type: 'text/javascript' })
        r.setAttribute('href', URL.createObjectURL(blob))
        r.setAttribute('target', '_blank')
        r.setAttribute('download', 'my-commands.js')
        r.click()
        r.remove()
        return 'Downloaded commands!'
      }

      this.onInit().then(() => {
        this.setState({ initialized: true })
      })
    }

    async onInit () {
      const triggerData = {}

      Object.keys(Constants.TRIGGER_PROPS).forEach((command) => {
        triggerData[command] = {
          id: command,
          triggers: [structuredClone(Constants.TRIGGER_PROPS[command].TEMPLATE)]
        }

        switch (command) {
          case Constants.TRIGGER_TYPES.FOCUS:
          case Constants.TRIGGER_TYPES.PAN:
          case Constants.TRIGGER_TYPES.ZOOM:
            triggerData[command].smoothing = Constants.CONSTRAINTS.SMOOTH.DEFAULT
            break
          case Constants.TRIGGER_TYPES.TIME:
            triggerData[command].interpolate = Constants.CONSTRAINTS.INTERPOLATE.DEFAULT
            break
          default:
            break
        }
      })

      this.setState({ triggerData })
    }

    onCreateTrigger (index) {
      const { triggerData, activeTab, focusDDIndices } = this.state
      const commandData = triggerData[activeTab]
      const newTrigger = structuredClone(commandData.triggers[index])
      let nextFocusDDIndices = focusDDIndices

      const currentIndex = Selectors.getPlayerIndex(store.getState())
      newTrigger[0] = [
        Math.floor(currentIndex / 2400),
        Math.floor((currentIndex % 2400) / 40),
        Math.floor(currentIndex % 40)
      ]

      triggerData[activeTab].triggers.splice(index + 1, 0, newTrigger)

      if (activeTab === Constants.TRIGGER_TYPES.FOCUS) {
        nextFocusDDIndices = RootComponent.resizedFocusDDIndexArray(
          triggerData[activeTab].triggers.length,
          nextFocusDDIndices
        )
      }

      this.setState({ triggerData })
      this.setState({ focusDDIndices: nextFocusDDIndices })
    }

    onUpdateTrigger (valueChange, path, constraints, bounded = false) {
      const { triggerData, activeTab } = this.state
      let pathPointer = triggerData[activeTab]

      for (let i = 0; i < path.length - 1; i += 1) {
        pathPointer = pathPointer[path[i]]
      }

      pathPointer[path[path.length - 1]] = Validator.validateData(
        valueChange,
        constraints,
        bounded
      )

      this.setState({ triggerData })
    }

    onDeleteTrigger (index) {
      const { triggerData, activeTab, focusDDIndices } = this.state
      let nextFocusDDIndices = focusDDIndices

      triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
        (_, i) => index !== i
      )

      if (activeTab === Constants.TRIGGER_TYPES.FOCUS) {
        nextFocusDDIndices = RootComponent.resizedFocusDDIndexArray(
          triggerData[activeTab].triggers.length,
          nextFocusDDIndices
        )
      }

      this.setState({ triggerData })
      this.setState({ focusDDIndices: nextFocusDDIndices })
    }

    onLoad () {
      const { actionPanelState, triggerData, focusDDIndices } = this.state
      let nextFocusDDIndices = focusDDIndices
      let nextTriggerData = triggerData

      try {
        if (actionPanelState.hasError) {
          actionPanelState.message = ''
        }

        nextTriggerData = ScriptParser.parseScript(this.computed.script)

        Object.keys(triggerData).forEach((command) => {
          if (nextTriggerData[command] === undefined) {
            nextTriggerData[command] = triggerData[command]
            return
          }

          if (command === Constants.TRIGGER_TYPES.FOCUS) {
            nextFocusDDIndices = RootComponent.resizedFocusDDIndexArray(
              nextTriggerData[command].triggers.length,
              nextFocusDDIndices
            )
            nextFocusDDIndices = RootComponent.chosenFocusDDIndices(
              nextTriggerData,
              nextFocusDDIndices
            )
          }
        })

        this.setState({ triggerData: nextTriggerData })
        actionPanelState.hasError = false
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`
        actionPanelState.hasError = true
      }

      this.setState({ focusDDIndices: nextFocusDDIndices })
      this.setState({ triggerData: nextTriggerData })
      this.setState({ actionPanelState })
    }

    onTest () {
      const { activeTab, triggerData, actionPanelState } = this.state
      try {
        const script = ScriptGenerator.generateScript(activeTab, triggerData)
        // eslint-disable-next-line no-eval
        eval.call(window, script) // HACK: Already evaluated script, execute it directly
        actionPanelState.hasError = false
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`
        actionPanelState.hasError = true
      }

      this.setState({ actionPanelState })
    }

    onPrint () {
      const { activeTab, triggerData, actionPanelState } = this.state
      try {
        actionPanelState.message = ScriptGenerator.generateScript(activeTab, triggerData)
        actionPanelState.hasError = false
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`
        actionPanelState.hasError = true
      }

      this.setState({ actionPanelState })
    }

    onResetSkin (index) {
      const { triggerData } = this.state
      if (!window.confirm('Are you sure you want to reset the current rider\'s skin?')) return

      triggerData[Constants.TRIGGER_TYPES.SKIN].triggers[index] = structuredClone(
        Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE
      )

      this.setState({ triggerData })
    }

    onChangeColor (color, alpha) {
      const { skinEditorState } = this.state

      const hexAlpha = alpha
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : skinEditorState.color.substring(7)

      const hexColor = color
        ? color + hexAlpha
        : skinEditorState.color.substring(0, 7) + hexAlpha

      skinEditorState.color = hexColor

      this.setState({ skinEditorState })
    }

    onCopyClipboard () {
      const { actionPanelState } = this.state

      if (actionPanelState.hasError) {
        return
      }

      window.navigator.clipboard.writeText(actionPanelState.message)

      actionPanelState.copiedNotify = true

      if (this.computed.timer) {
        clearTimeout(this.computed.timer)
      }

      this.computed.timer = window.setTimeout(() => this.onDisableCopyNotify(), 1000)

      this.setState({ actionPanelState })
    }

    onDisableCopyNotify () {
      const { actionPanelState } = this.state
      actionPanelState.copiedNotify = false
      this.setState({ actionPanelState })
    }

    onActivate () {
      const { active } = this.state
      const sidebarOpen = Selectors.getSidebarOpen(store.getState())

      if (!active && sidebarOpen) {
        store.dispatch(Actions.closeSidebar())
      }

      this.setState({ active: !active })
    }

    onChangeTab (tabName) {
      this.setState({ activeTab: tabName })
    }

    onToggleSettings (active) {
      const { unsavedSettings, settings } = this.state

      if (!active && unsavedSettings.dirty) {
        if (!window.confirm('Discard changes?')) return
        Object.assign(unsavedSettings, settings)
        unsavedSettings.dirty = false
      }

      settings.active = active

      this.setState({ unsavedSettings })
      this.setState({ settings })
    }

    onChangeFontSize (fontSize) {
      const { unsavedSettings, settings } = this.state

      if (fontSize !== settings.fontSize) {
        unsavedSettings.dirty = true
      }

      unsavedSettings.fontSize = fontSize
      this.setState({ unsavedSettings })
    }

    onChangeViewport (resolution) {
      const { unsavedSettings, settings } = this.state

      if (resolution !== settings.resolution) {
        unsavedSettings.dirty = true
      }

      unsavedSettings.resolution = resolution

      this.setState({ unsavedSettings })
    }

    onApplySettings () {
      const { triggerData, settings, unsavedSettings } = this.state

      const nextTriggerData = RootComponent.savedViewport(
        settings.resolution,
        unsavedSettings.resolution,
        triggerData
      )

      settings.fontSize = unsavedSettings.fontSize
      settings.resolution = unsavedSettings.resolution
      unsavedSettings.dirty = false

      this.setState({ triggerData: nextTriggerData })
      this.setState({ settings })
      this.setState({ unsavedSettings })
    }

    onChangeFocusDD (index, value) {
      const { focusDDIndices } = this.state
      focusDDIndices[index] = parseInt(value, 10)
      this.setState({ focusDDIndices })
    }

    onChangeSkinDD (value) {
      const { skinEditorState } = this.state
      skinEditorState.ddIndex = parseInt(value, 10)
      this.setState({ skinEditorState })
    }

    onZoomSkinEditor (event, isMouseAction) {
      const { skinEditorState } = this.state
      const rect = document.getElementById('skinElementContainer').getBoundingClientRect()

      if (isMouseAction) {
        if (skinEditorState.zoom.scale < Constants.CONSTRAINTS.SKIN_ZOOM.MAX) {
          skinEditorState.zoom.xOffset = (event.clientX - rect.x) / skinEditorState.zoom.scale
          skinEditorState.zoom.yOffset = (event.clientY - rect.y) / skinEditorState.zoom.scale
        }
        skinEditorState.zoom.scale = Math.max(Math.min(
          skinEditorState.zoom.scale - event.deltaY * Constants.SCROLL_DELTA,
          Constants.CONSTRAINTS.SKIN_ZOOM.MAX
        ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN)
      } else {
        skinEditorState.zoom.scale = Math.max(Math.min(
          event.target.value,
          Constants.CONSTRAINTS.SKIN_ZOOM.MAX
        ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN)
      }

      this.setState({ skinEditorState })
    }

    updateComputed () {
      const { triggerData, activeTab } = this.state
      if (activeTab !== Constants.TRIGGER_TYPES.SKIN) {
        this.computed.invalidTimes = Validator.validateTimes(triggerData[activeTab])
      }
    }

    updateStore (nextState) {
      const riderCount = Selectors.getNumRiders(nextState)

      if (this.computed.riderCount !== riderCount) {
        this.computed.riderCount = riderCount
        const { triggerData, skinEditorState, focusDDIndices } = this.state
        let nextTriggerData = triggerData
        let nextSkinEditorState = skinEditorState
        let nextFocusDDIndices = focusDDIndices

        nextTriggerData = RootComponent.resizedFocusWeightArrays(riderCount, nextTriggerData)
        nextTriggerData = RootComponent.resizedSkinArray(riderCount, nextTriggerData)
        nextSkinEditorState = RootComponent.clampedSkinDD(riderCount, nextSkinEditorState)
        nextFocusDDIndices = RootComponent.clampedFocusDDs(riderCount, nextFocusDDIndices)

        this.setState({ triggerData: nextTriggerData })
        this.setState({ skinEditorState: nextSkinEditorState })
        this.setState({ focusDDIndices: nextFocusDDIndices })
      }

      const script = Selectors.getCurrentScript(nextState)

      if (this.computed.script !== script) {
        this.computed.script = script
      }

      const sidebarOpen = Selectors.getSidebarOpen(nextState)

      if (sidebarOpen) {
        this.setState({ active: false })
      }

      const playerRunning = Selectors.getPlayerRunning(nextState)
      const windowFocused = Selectors.getWindowFocused(nextState)

      const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused)

      document.getElementById(Constants.ROOT_NODE_ID).style.opacity = shouldBeVisible ? 1 : 0
      document.getElementById(Constants.ROOT_NODE_ID).style.pointerEvents = shouldBeVisible ? null : 'none'
    }

    render () {
      const { initialized } = this.state
      if (!initialized) return false

      this.updateComputed()

      this.componentManager.updateState(this.state)
      this.componentManager.updateComputed(this.computed)

      return this.componentManager.main()
    }
  }
}
