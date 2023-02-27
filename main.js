function main() {
    window.V2 = window.V2 || window.store.getState().simulator.engine.engine.state.startPoint.constructor;
    
    const {
        React,
        ReactDOM,
        store
    } = window;
    
    const e = React.createElement;

    var playerRunning = getPlayerRunning(store.getState());
    var windowFocused = getWindowFocused(store.getState());

    store.subscribe(() => {
        playerRunning = getPlayerRunning(store.getState());
        windowFocused = getWindowFocused(store.getState());

        let shouldBeVisible = true;//!playerRunning && windowFocused;

        commandEditorParent.style.opacity = shouldBeVisible ? 1 : 0;
        commandEditorParent.style.pointerEvents = shouldBeVisible ? null : 'none';
    })

    class CommandEditorComponent extends React.Component {
        constructor () {
            super();

            this.state = {
                active: true, //false
                activeTab: null,
                errorMessage: "...",
                hasError: false,
                initialized: false,
                triggerData: {}
            }

            this.commandEditor = new CommandEditor(store, this.state)

            store.subscribeImmediate(() => {
                // setState is asynchronous, wait for all the initial states to finish for safety

                this.onInitializeState().then(() => {
                    this.setState({initialized: true})
                })
            })
        }

        componentDidMount() {
            Object.assign(commandEditorParent.style, parentStyle);
        }

        componentWillUpdate (nextProps, nextState) {
            this.commandEditor.onUpdate(nextState)
        }

        async onInitializeState() {
            const commands = Object.keys(commandDataTypes);

            if(commands.length == 0) {
                return;
            }

            this.onSwitchTab(commands[0]);

            commands.forEach(command => {
                const data = {...this.state.triggerData};
                data[command] = {};
                data[command].smoothing = smooth.default;
                data[command].triggers = [];
                this.setState({triggerData: data});
            });
        }

        onRead() {
            console.log("Read");
        }
        
        onCommit() {
            const committed = this.commandEditor.commit();
            if (committed) {
                this.setState({active: false})
            }
        }

        onActivate() {
            if(this.state.active) {
                this.setState({active: false});
            } else {
                this.setState({active: true});
            }
        }

        onSwitchTab(tabName) {
            this.setState({activeTab: tabName});
        }
        
        onChangeSmooth(value) {
            let targetValue = parseInt(value);
    
            if(isNaN(targetValue)) {
                const smoothing = {...this.state.triggerData};
                smoothing[this.state.activeTab].smoothing = smooth.default;
                this.setState({triggerData: smoothing});
                return;
            }
    
            if(targetValue < smooth.min || targetValue > smooth.max) {
                return;
            }
    
            const smoothing = {...this.state.triggerData};
            smoothing[this.state.activeTab].smoothing = targetValue;
            this.setState({triggerData: smoothing});
        }

        renderZoomTrigger(index, data) {
            return e('div', {style: triggerStyle},
                e('text', {style: textStyle.L}, (index + 1)),
                Object.keys(data).map(dataInput => {
                    return e('text', {
                        style: {
                            ...textStyle.S,
                            padding: '5px'
                        }}, 
                        dataInput.toUpperCase()
                    )
                })
            )
        }

        renderTab(tab) {
            return e('button', {
                style: {
                    ...tabButtonStyle,
                    backgroundColor:
                        this.state.activeTab === tab ? 
                        colorTheme.lightgray1 :
                        colorTheme.darkgray1
                },
                onClick: () => {
                    this.onSwitchTab(tab)
                }
                },
                e('text', {style: textStyle.S}, commandDataTypes[tab].name)
            )
        }

        renderWindow(tabName) {
            return e('div', null,
                e('div', {style: smoothTabStyle},
                    e('text', {style: textStyle.S}, "Smoothing"),
                    e('input', {
                        style: {...textInputStyle, marginLeft: '5px'},
                        type: 'number',
                        min: smooth.min,
                        max: smooth.max,
                        placeholder: smooth.default,
                        value: this.state.triggerData[this.state.activeTab].smoothing,
                        onChange: e => {
                            this.onChangeSmooth(e.target.value)
                        }
                    })
                ),
                e('div', {style: triggerWindowStyle}, 
                    tabName == "Zoom" && this.renderZoomTrigger(0, {})
                )
            )
        }

        renderTabComponents() {
            return e('div', {style: tabHeaderStyle},
                Object.keys(
                    commandDataTypes
                ).map(command => {
                    return e('div', null,
                        this.renderTab(command)
                    )
                })
            );
        }

        renderWindowComponents() {
            return this.renderWindow(this.state.activeTab);
        }

        renderReadWriteComponents() {
            return e('div', null,
                e('button', {
                    style: {...readWriteButtonStyle, left: '3%'},
                    onClick: this.onRead.bind(this)
                },
                e('text', {style: textStyle.M}, "Read"),
                ),
                e('button', {
                    style: {...readWriteButtonStyle, right: '3%'},
                    onClick: this.onCommit.bind(this)
                },
                e('text', {style: textStyle.M}, "Commit")
                ),
                e('div', {style: errorContainerStyle},
                    e('text', {
                        style: {
                            ...textStyle.M,
                            color: this.state.hasError ? "Red" : "Black"
                        }
                    }, this.state.errorMessage)
                )
            )
        }

        render() {
            return this.state.initialized && 
            e('div', this.state.active && {style: expandedWindow},
                e('button', {
                        style: expandCollapseButtonStyle,
                        onClick: this.onActivate.bind(this)
                    },
                    e('text', {style: textStyle.L},
                        this.state.active ? "-" : "+"
                    )
                ),
                e('div', !this.state.active && {style: {display: 'none'}},
                    this.renderTabComponents(),
                    this.renderWindowComponents(),
                    this.renderReadWriteComponents()
                )
            )
        }
    }

    const commandEditorParent = document.createElement('div');

    document.getElementById('content').appendChild(commandEditorParent);

    ReactDOM.render(
        e(CommandEditorComponent),
        commandEditorParent
    )
}

if(window.store) {
  main();
} else {
  window.onAppReady = main;
}