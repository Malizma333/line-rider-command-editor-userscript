function main () {
  window.V2 = window.V2 || getWindowStart(window.store.getState())

  const {
    React,
    ReactDOM,
    store
  } = window

  let playerRunning = getPlayerRunning(store.getState())
  let windowFocused = getWindowFocused(store.getState())

  store.subscribe(() => {
    playerRunning = getPlayerRunning(store.getState())
    windowFocused = getWindowFocused(store.getState())

    const shouldBeVisible = DEBUG || (!playerRunning && windowFocused)

    commandEditorParent.style.opacity = shouldBeVisible ? 1 : 0
    commandEditorParent.style.pointerEvents = shouldBeVisible ? null : 'none'
  })

  class CommandEditorComponent extends React.Component {
    constructor () {
      super()

      this.state = {
        active: DEBUG,
        activeTab: null,
        message: '',
        hasError: false,
        initialized: false,
        triggerData: {},
        focuserDropdownIndices: [],
        skinDropdownIndex: 0,
        selectedColor: '#000000ff'
      }

      this.commandEditor = new CommandEditor(store, this.state)

      store.subscribeImmediate(() => {
        if (this.state.initialized) {
          this.onAdjustFocuserDropdown()
          this.onAdjustSkinDropdown()
        }
      })
    }

    /* Trigger Events */

    createTrigger () {
      const data = { ...this.state.triggerData }
      const commandData = data[this.state.activeTab]

      console.log(commandData[-1])
      const newTrigger = JSON.parse(JSON.stringify(
        commandDataTypes[this.state.activeTab].template
      ))

      commandData.triggers = [...commandData.triggers, newTrigger]

      validateTimeStamps(data)

      this.setState({ triggerData: data })

      if (this.state.activeTab === Triggers.CameraFocus) {
        this.setState({
          focuserDropdownIndices: [...this.state.focuserDropdownIndices, 0]
        })

        this.onAdjustFocuserDropdown()
      }
    }

    updateTrigger (valueChange, path, constraints, bounded = false) {
      const data = { ...this.state.triggerData }
      let pathPointer = data[this.state.activeTab]

      for (let i = 0; i < path.length - 1; i++) {
        pathPointer = pathPointer[path[i]]
      }

      pathPointer[path[path.length - 1]] = validateData(
        valueChange, constraints, bounded
      )

      if (bounded) {
        validateTimeStamps(data)
      }

      this.setState({ triggerData: data })
    }

    deleteTrigger (index) {
      const data = { ...this.state.triggerData }

      data[this.state.activeTab].triggers = data[this.state.activeTab].triggers.filter(
        (e, i) => { return index !== i }
      )

      this.setState({ triggerData: data })
    }

    /* Interaction Events */

    async onInitializeState () {
      const commands = Object.keys(commandDataTypes)

      if (commands.length === 0) {
        return
      }

      this.onChangeTab(commands[0])

      const data = {}

      commands.forEach(command => {
        data[command] = {
          id: command,
          triggers: [
            JSON.parse(JSON.stringify(
              commandDataTypes[command].template
            ))
          ]
        }

        switch (command) {
          case Triggers.CameraFocus:
          case Triggers.CameraPan:
          case Triggers.Zoom:
            data[command].smoothing = constraintProps.smoothProps.default
            break
          case Triggers.TimeRemap:
            data[command].interpolate = constraintProps.interpolateProps.default
            break
          default:
            break
        }
      })

      this.setState({ triggerData: data })

      this.setState({ focuserDropdownIndices: [0] })
    }

    onRead () {
      try {
        if (this.state.hasError) {
          this.setState({ message: '' })
        }

        const readInformation = this.commandEditor.read()
        this.setState({ triggerData: readInformation })
        this.setState({ hasError: false })
      } catch (error) {
        this.setState({ message: 'Error: ' + error.message })
        this.setState({ hasError: true })
      }
    }

    onTest () {
      try {
        this.commandEditor.test(this.state.activeTab)
        this.setState({ hasError: false })
      } catch (error) {
        this.setState({ message: 'Error: ' + error.message })
        this.setState({ hasError: true })
      }
    }

    onPrint () {
      try {
        const printInformation = this.commandEditor.print(this.state.activeTab)
        this.setState({ message: printInformation })
        this.setState({ hasError: false })
      } catch (error) {
        this.setState({ message: 'Error: ' + error.message })
        this.setState({ hasError: true })
      }
    }

    onResetSkin (index) {
      const confirmReset = confirm('Are you sure you want to reset the current rider\'s skin?')

      if (confirmReset) {
        const triggerData = this.state.triggerData

        triggerData.CustomSkin.triggers[index] = JSON.parse(JSON.stringify(
          commandDataTypes.CustomSkin.template
        ))

        this.setState({ triggerData })
      }
    }

    onChangeColor (color, alpha) {
      const hexAlpha = alpha
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : this.state.selectedColor.substring(7)

      const hexColor = color
        ? color + hexAlpha
        : this.state.selectedColor.substring(0, 7) + hexAlpha

      this.setState({ selectedColor: hexColor })
    }

    onCopyClipboard (text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          console.log('Text copied to clipboard successfully')
        })
        .catch((error) => {
          console.error('Error copying text to clipboard: ', error)
        })
    }

    onActivate () {
      if (this.state.active) {
        this.setState({ active: false })
      } else {
        this.setState({ active: true })
      }
    }

    onChangeTab (tabName) {
      this.setState({ activeTab: tabName })
    }

    onChangeFocuserDropdown (index, value) {
      const dropdownData = [...this.state.focuserDropdownIndices]

      dropdownData[index] = parseInt(value)

      this.setState({ focuserDropdownIndices: dropdownData })
    }

    onChangeSkinDropdown (value) {
      this.setState({ skinDropdownIndex: parseInt(value) })
    }

    onAdjustFocuserDropdown () {
      const triggerData = { ...this.state.triggerData }
      const focusTriggers = triggerData[Triggers.CameraFocus].triggers
      const clamp = this.commandEditor.RiderCount

      focusTriggers.forEach((e, i) => {
        for (let j = focusTriggers[i][1].length; j < clamp; j++) {
          focusTriggers[i][1] = [...focusTriggers[i][1], 0]
        }

        for (let j = focusTriggers[i][1].length; j > clamp; j--) {
          focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1)
        }
      })

      triggerData[Triggers.CameraFocus].triggers = focusTriggers
      this.setState({ triggerData })

      const focuserDropdownIndices = this.state.focuserDropdownIndices

      focuserDropdownIndices.forEach((e, i) => {
        if (focuserDropdownIndices[i] >= clamp) {
          focuserDropdownIndices[i] = clamp - 1
        }
      })

      this.setState({ focuserDropdownIndices })
    }

    onAdjustSkinDropdown () {
      const triggerData = { ...this.state.triggerData }
      let skinTriggers = triggerData[Triggers.CustomSkin].triggers
      const clamp = this.commandEditor.RiderCount

      for (let j = skinTriggers.length; j < clamp; j++) {
        skinTriggers = [...skinTriggers, JSON.parse(JSON.stringify(
          commandDataTypes.CustomSkin.template
        ))]
      }

      for (let j = skinTriggers.length; j > clamp; j--) {
        skinTriggers = skinTriggers.slice(0, -1)
      }

      triggerData[Triggers.CustomSkin].triggers = skinTriggers
      this.setState({ triggerData })

      let skinDropdownIndex = this.state.skinDropdownIndex

      if (skinDropdownIndex >= clamp) {
        skinDropdownIndex = clamp - 1
      }

      this.setState({ skinDropdownIndex })
    }

    /* Render Events */

    componentDidMount () {
      Object.assign(commandEditorParent.style, parentStyle)
      this.onInitializeState().then(() => {
        this.setState({ initialized: true })
      })
    }

    componentWillUpdate (nextProps, nextState) {
      this.commandEditor.onUpdate(nextState)
    }

    render () {
      return this.state.initialized && mainComp(React.createElement, this)
    }
  }

  const commandEditorParent = document.createElement('div')

  document.getElementById('content').appendChild(commandEditorParent)

  ReactDOM.render(
    React.createElement(CommandEditorComponent),
    commandEditorParent
  )
}

if (window.store) {
  main()
} else {
  window.onAppReady = main
}
