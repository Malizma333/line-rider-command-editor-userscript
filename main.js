const getWindowFocused = state => state.views.Main;
const getPlayerRunning = state => state.player.running;

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
                errorMessage: "...",
                hasError: false,
                activeTab: null,
                smoothValues: {}
            }

            this.commandEditor = new CommandEditor(store, this.state)

            store.subscribeImmediate(() => {
                const commands = Object.keys(commandDataTypes);

                if(commands.length == 0) {
                    return;
                }

                this.onSwitchTab(commands[0]);

                commands.forEach(command => {
                    const smoothing = {...this.state.smoothValues};
                    smoothing[command] = smooth.default;
                    this.setState({smoothValues: smoothing});
                });
            })
        }

        componentDidMount() {
            Object.assign(commandEditorParent.style, parentStyle);
        }

        componentWillUpdate (nextProps, nextState) {
            this.commandEditor.onUpdate(nextState)
        }

        onRead() {
            console.log("Read");
        }
        
        onCommit() {
            console.log("Commit");
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
                const smoothing = {...this.state.smoothValues};
                smoothing[this.state.activeTab] = smooth.default;
                this.setState({smoothValues: smoothing});
                return;
            }
    
            if(targetValue < smooth.min || targetValue > smooth.max) {
                return;
            }
    
            const smoothing = {...this.state.smoothValues};
            smoothing[this.state.activeTab] = targetValue;
            this.setState({smoothValues: smoothing});
        }

        renderTab(tabName) {
            return e('button', {
                style: {
                    ...tabButtonStyle,
                    backgroundColor:
                        this.state.activeTab === tabName ? 
                        colorTheme.lightgray1 :
                        colorTheme.darkgray1
                },
                onClick: () => {
                    this.onSwitchTab(tabName)
                }
                },
                e('text', {style: textStyle.S}, tabName)
            )
        }

        renderWindow(tabName) {
            return e('div', {
                style: {
                    /*display:
                        this.state.activeTab === tabName ?
                        'none' :
                        'inline'
                        */
                    },
                },
                e('div', {style: smoothTabStyle},
                    e('text', {style: textStyle.S}, "Smoothing"),
                    e('input', {
                        style: {...textInputStyle, marginLeft: '5px'},
                        type: 'number',
                        min: smooth.min,
                        max: smooth.max,
                        placeholder: smooth.default,
                        value: this.state.smoothValues[this.state.activeTab],
                        onChange: e => {
                            this.onChangeSmooth(e.target.value)
                        }
                    })
                ),
                e('div', {style: triggerWindowStyle})
            )
        }

        renderTabComponents() {
            return e('div', {style: tabHeaderStyle},
                Object.keys(
                    commandDataTypes
                ).map(commandName => {
                    return e('div', null,
                        this.renderTab(commandName)
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
            return e('div', this.state.active && {style: expandedWindow},
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