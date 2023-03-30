function main () {
    window.V2 = window.V2 || window.store.getState().simulator.engine.engine.state.startPoint.constructor

    const {
        React,
        ReactDOM,
        store
    } = window

    const e = React.createElement

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

        /* Trigger Management */

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

        readTrigger (index) {
            return { ...this.state.triggerData[this.state.activeTab].triggers[index] }
        }

        updateTrigger (index, prop, propPath, constraints) {
            console.log(constraints)
            const data = { ...this.state.triggerData }
            let pointer = data[this.state.activeTab].triggers[index]

            for (let i = 0; i < propPath.length - 1; i++) {
                pointer = pointer[propPath[i]]
            }

            pointer[propPath[propPath.length - 1]] = prop

            this.setState({ triggerData: data })
        }

        deleteTrigger (index) {
            const data = { ...this.state.triggerData }

            data[this.state.activeTab].triggers = data[this.state.activeTab].triggers.filter(
                (e, i) => { return index !== i }
            )

            this.setState({ triggerData: data })
        }

        /* Events */

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
                    data[command].interpolate = interpolate.default
                } else {
                    data[command].smoothing = smooth.default
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

            focusTriggers.forEach((e, i) => {
                for (let j = focusTriggers[i][1].length; j < this.commandEditor.RiderCount; j++) {
                    focusTriggers[i][1] = [...focusTriggers[i][1], 0]
                }

                for (let j = focusTriggers[i][1].length; j > this.commandEditor.RiderCount; j--) {
                    focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1)
                }
            })

            data[Triggers.CameraFocus].triggers = focusTriggers
            this.setState({ triggerData: data })
        }

        onChangeSmooth (value) {
            const targetValue = parseInt(value)

            if (isNaN(targetValue)) {
                const smoothing = { ...this.state.triggerData }
                smoothing[this.state.activeTab].smoothing = smooth.default
                this.setState({ triggerData: smoothing })
                return
            }

            if (targetValue < smooth.min || targetValue > smooth.max) {
                return
            }

            const smoothing = { ...this.state.triggerData }
            smoothing[this.state.activeTab].smoothing = targetValue
            this.setState({ triggerData: smoothing })
        }

        onChangeInterpolate () {
            const interpolateState = { ...this.state.triggerData }
            interpolateState[this.state.activeTab].interpolate =
                !interpolateState[this.state.activeTab].interpolate
            this.setState({ triggerData: interpolateState })
        }

        /* Renders */

        componentDidMount () {
            Object.assign(commandEditorParent.style, parentStyle)
            this.onInitializeState().then(() => {
                this.setState({ initialized: true })
            })
        }

        componentWillUpdate (nextProps, nextState) {
            this.commandEditor.onUpdate(nextState)
        }

        renderZoomLayout (data, index) {
            const label = 'ZOOM TO'

            return e('div', null,
                e('text', { style: triggerTextStyle }, label),
                e('input', {
                    style: triggerTextStyle,
                    value: data[1],
                    onChange: (e) => this.updateTrigger(
                        index, e.target.value, [1], constraintProps.zoomProps
                    )
                })
            )
        }

        renderCameraPanLayout (data, index) {
            const cProps = [constraintProps.wProps, constraintProps.hProps, constraintProps.xProps, constraintProps.yProps]
            const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET']

            return e('div', null,
                Object.keys(data[1]).map((prop, propIndex) => {
                    return e('div', {
                        style: {
                            alignItems: 'center',
                            display: 'inline-block'
                        }
                    },
                    e('text', { style: triggerTextStyle }, labels[propIndex]),
                    e('input', {
                        style: triggerTextStyle,
                        value: data[1][prop],
                        onChange: (e) => this.updateTrigger(
                            index, e.target.value, [1, prop], cProps[propIndex]
                        )
                    })
                    )
                })
            )
        }

        renderCameraFocusLayout (data, index) {
            const dropdownIndex = this.state.focuserDropdowns[index]

            return e('div', null,
                e('select', {
                    style: dropdownHeaderStyle,
                    value: dropdownIndex,
                    onChange: e => this.onChangeDropdown(
                        index, e.target.value
                    )
                },
                Object.keys(data[1]).map(riderIndex => {
                    const riderNum = 1 + parseInt(riderIndex)

                    return e('option', {
                        style: dropdownOptionStyle,
                        value: parseInt(riderIndex)
                    }, e('text', null, `Rider ${riderNum}`))
                })),
                e('text', { style: triggerTextStyle }, 'WEIGHT'),
                e('input', {
                    style: triggerTextStyle,
                    value: data[1][dropdownIndex],
                    onChange: (e) => this.updateTrigger(
                        index, e.target.value, [1, dropdownIndex], constraintProps.fWeightProps
                    )
                })
            )
        }

        renderTimeRemapLayout (data, index) {
            const label = 'TIME SCALE'

            return e('div', null,
                e('text', { style: triggerTextStyle }, label),
                e('input', {
                    style: triggerTextStyle,
                    value: data[1],
                    onChange: (e) => this.updateTrigger(
                        index, e.target.value, [1], constraintProps.timeProps
                    )
                })
            )
        }

        renderTrigger (type, index, data) {
            const tProps = [constraintProps.minuteProps, constraintProps.secondProps, constraintProps.frameProps]
            return e('div', {
                style: {
                    ...triggerStyle,
                    backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white
                }
            },
            e('div', { style: triggerDivStyle },
                e('text', {
                    style: {
                        ...textStyle.L,
                        paddingRight: '10px'
                    }
                }, parseInt(index) + 1),
                data[0].map((timeValue, timeIndex) => {
                    return e('div', null,
                        e('text', { style: triggerTextStyle },
                            ['TIME', ':', ':'][timeIndex]
                        ),
                        e('input', {
                            style: {
                                ...triggerTextStyle,
                                backgroundColor: index === 0 ? colorTheme.darkgray2 : colorTheme.white
                            },
                            disabled: index === 0,
                            value: timeValue,
                            onChange: (e) => this.updateTrigger(
                                index, e.target.value, [0, timeIndex], tProps[timeIndex]
                            )
                        })
                    )
                }),
                e('button', {
                    style: {
                        ...squareButtonStyle,
                        position: 'absolute',
                        right: '10px'
                    },
                    disabled: index === 0,
                    onClick: () => this.deleteTrigger(index)
                },
                e('text', {
                    style: {
                        ...textStyle.M,
                        color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
                        fontWeight: 900
                    }
                }, 'X'))
            ),
            type === Triggers.Zoom && this.renderZoomLayout(data, index),
            type === Triggers.CameraPan && this.renderCameraPanLayout(data, index),
            type === Triggers.CameraFocus && this.renderCameraFocusLayout(data, index),
            type === Triggers.TimeRemap && this.renderTimeRemapLayout(data, index)
            )
        }

        renderTab (tab) {
            return e('button', {
                style: {
                    ...tabButtonStyle,
                    backgroundColor:
                        this.state.activeTab === tab
                            ? colorTheme.lightgray1
                            : colorTheme.darkgray1
                },
                onClick: () => {
                    this.onChangeTab(tab)
                }
            },
            e('text', { style: textStyle.S }, commandDataTypes[tab].displayName)
            )
        }

        renderSmoothTab (data) {
            return e('div', { style: smoothTabStyle },
                e('text', { style: textStyle.S }, 'Smoothing'),
                data.id !== Triggers.TimeRemap && e('input', {
                    style: {
                        ...smoothTextInputStyle,
                        marginLeft: '5px'
                    },
                    type: 'number',
                    min: smooth.min,
                    max: smooth.max,
                    placeholder: smooth.default,
                    value: data.smoothing,
                    onChange: e => {
                        this.onChangeSmooth(e.target.value)
                    }
                }),
                data.id === Triggers.TimeRemap && e('div', { style: checkboxDivStyle },
                    e('input', {
                        style: checkboxStyle,
                        type: 'checkbox',
                        onChange: () => {
                            this.onChangeInterpolate()
                        }
                    }),
                    data.interpolate && e('square', { style: checkboxFillStyle })
                )
            )
        }

        renderWindow (data) {
            return e('div', null,
                this.renderSmoothTab(data),
                e('div', { style: triggerWindowStyle },
                    Object.keys(data.triggers).map(i => {
                        return this.renderTrigger(data.id, parseInt(i), data.triggers[i])
                    }),
                    e('button', {
                        style: {
                            ...squareButtonStyle,
                            position: 'relative',
                            right: '10px',
                            bottom: '4.5px'
                        },
                        onClick: () => this.createTrigger()
                    },
                    e('text', {
                        style: {
                            ...textStyle.L,
                            fontWeight: 900
                        }
                    }, '+')
                    )
                )
            )
        }

        renderTabComponents () {
            return e('div', { style: tabHeaderStyle },
                Object.keys(
                    commandDataTypes
                ).map(command => {
                    return e('div', null,
                        this.renderTab(command)
                    )
                })
            )
        }

        renderWindowComponents () {
            return this.renderWindow(
                this.state.triggerData[this.state.activeTab]
            )
        }

        renderReadWriteComponents () {
            return e('div', null,
                e('button', {
                    style: {
                        ...readWriteButtonStyle,
                        left: '18px'
                    },
                    onClick: this.onRead.bind(this)
                },
                e('text', { style: textStyle.M }, 'Read')
                ),
                e('button', {
                    style: {
                        ...readWriteButtonStyle,
                        right: '18px'
                    },
                    onClick: () => this.onCommit()
                },
                e('text', { style: textStyle.M }, 'Commit')
                ),
                e('div', { style: errorContainerStyle },
                    e('text', {
                        style: {
                            ...textStyle.M,
                            color: this.state.hasError ? 'Red' : 'Black'
                        }
                    }, this.state.errorMessage)
                )
            )
        }

        render () {
            return this.state.initialized &&
            e('div', this.state.active && { style: expandedWindow },
                e('button', {
                    style: squareButtonStyle,
                    onClick: this.onActivate.bind(this)
                },
                e('text', { style: textStyle.L },
                    this.state.active ? '-' : '+'
                )
                ),
                e('div', !this.state.active && { style: { display: 'none' } },
                    this.renderTabComponents(),
                    this.renderWindowComponents(),
                    this.renderReadWriteComponents()
                )
            )
        }
    }

    const commandEditorParent = document.createElement('div')

    document.getElementById('content').appendChild(commandEditorParent)

    ReactDOM.render(
        e(CommandEditorComponent),
        commandEditorParent
    )
}

if (window.store) {
    main()
} else {
    window.onAppReady = main
}
