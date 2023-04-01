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
                errorMessage: '...',
                hasError: false,
                initialized: false,
                triggerData: {},
                focuserDropdowns: []
            }

            this.commandEditor = new CommandEditor(store, this.state)

            store.subscribeImmediate(() => {
                if (this.state.initialized) {
                    this.onAdjustDropdown()
                }
            })
        }

        /* Trigger Events */

        createTrigger () {
            const data = { ...this.state.triggerData }

            data[this.state.activeTab].triggers = [
                ...data[this.state.activeTab].triggers,
                JSON.parse(JSON.stringify(
                    commandDataTypes[this.state.activeTab].template
                ))
            ]

            this.setState({ triggerData: data })

            if (this.state.activeTab === Triggers.CameraFocus) {
                this.setState({
                    focuserDropdowns: [...this.state.focuserDropdowns, 0]
                })

                this.onAdjustDropdown()
            }
        }

        updateTrigger (prevValue, newValue, path, constraints) {
            const data = { ...this.state.triggerData }
            let pathPointer = data[this.state.activeTab]

            for (let i = 0; i < path.length - 1; i++) {
                pathPointer = pathPointer[path[i]]
            }

            pathPointer[path[path.length - 1]] = this.validateData(
                prevValue, newValue, constraints
            )

            this.setState({ triggerData: data })
        }

        deleteTrigger (index) {
            const data = { ...this.state.triggerData }

            data[this.state.activeTab].triggers = data[this.state.activeTab].triggers.filter(
                (el, i) => { return index !== i }
            )

            this.setState({ triggerData: data })
        }

        validateData (prevValue, newValue, constraints) {
            switch (constraints.type) {
                case constraintTypes.bool: {
                    return newValue
                }

                case constraintTypes.int: {
                    if (newValue.trim() === '') {
                        return 0
                    }

                    const parsedValue = parseInt(newValue)

                    if (isNaN(parsedValue)) {
                        return prevValue
                    }

                    if (newValue.includes('.')) {
                        return prevValue
                    }

                    if (parsedValue < constraints.min || parsedValue > constraints.max) {
                        return prevValue
                    }

                    return parsedValue
                }

                case constraintTypes.float: {
                    if (newValue.trim() === '') {
                        return 0.0
                    }

                    const parsedValue = parseFloat(newValue)

                    if (isNaN(parsedValue)) {
                        return prevValue
                    }

                    if (parsedValue < constraints.min || parsedValue > constraints.max) {
                        return prevValue
                    }

                    return parsedValue
                }

                default: return prevValue
            }
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

                if (command === Triggers.TimeRemap) {
                    data[command].interpolate = constraintProps.interpolateProps.default
                } else {
                    data[command].smoothing = constraintProps.smoothProps.default
                }
            })

            this.setState({ triggerData: data })

            this.setState({ focuserDropdowns: [0] })
        }

        onRead () {
            const read = this.commandEditor.read()
            if (read) {
                this.setState({ errorMessage: 'Success' })
                this.setState({ hasError: false })
            } else {
                this.setState({ errorMessage: 'Error' })
                this.setState({ hasError: true })
            }
        }

        onCommit () {
            const committed = this.commandEditor.commit()
            if (committed) {
                this.setState({ errorMessage: 'Success' })
                this.setState({ hasError: false })
            } else {
                this.setState({ errorMessage: 'Error' })
                this.setState({ hasError: true })
            }
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

        onChangeDropdown (index, value) {
            const dropdownData = [...this.state.focuserDropdowns]

            dropdownData[index] = value

            this.setState({ focuserDropdowns: dropdownData })
        }

        onAdjustDropdown () {
            const data = { ...this.state.triggerData }
            const focusTriggers = data[Triggers.CameraFocus].triggers
            const clamp = this.commandEditor.RiderCount

            focusTriggers.forEach((e, i) => {
                for (let j = focusTriggers[i][1].length; j < clamp; j++) {
                    focusTriggers[i][1] = [...focusTriggers[i][1], 0]
                }

                for (let j = focusTriggers[i][1].length; j > clamp; j--) {
                    focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1)
                }
            })

            data[Triggers.CameraFocus].triggers = focusTriggers
            this.setState({ triggerData: data })
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
