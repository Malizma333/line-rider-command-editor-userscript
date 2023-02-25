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

    class CommandEditorContainer extends React.Component {
        constructor () {
            super();

            this.state = {
                active: true,
                currentTab: "Zoom",
                errorMessage: "...",
                hasError: false,
                smoothingValues: {}
            }

            store.subscribeImmediate(() => {
                this.switchTab(this.state.currentTab);
            })

            this.commandList = ["Zoom", "Camera Pan", "Camera Focus", "Time Remap"]
            this.commandEditors = []

            this.commandList.forEach(command => {
                let commandEditor = new CommandEditor(
                    command,
                    [[0,0,0], 2],
                    this.createTab(command)
                )
                this.commandEditors.push(commandEditor)
            });
        }

        componentDidMount() {
            Object.assign(commandEditorParent.style, parentStyle);
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
                    e('div', {style: tabHeaderStyle},
                        this.commandEditors.map((command) => (
                            command.tabComponent
                        ))
                    ),
                    /*this.commandEditors.map((command) => (
                        command.windowComponent
                    )),*/
                    this.commandEditors[0].windowComponent,
                    this.readWriteComponents
                )
            )
        }

        get readWriteComponents() {
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

        onRead() {
            console.log("Read");
        }
        
        onCommit() {
            console.log("Commit");
        }

        createTab(tabName) {
            let {smoothingValues} = this.state;
            smoothingValues[tabName] = 10;
            this.setState({smoothingValues});

            return {
                tab: e('button', {
                    style: {
                        ...tabButtonStyle,
                        backgroundColor: colorTheme.darkgray1
                    },
                    id: tabName,
                    onClick: () => {this.switchTab(tabName)}
                    },
                    e('text', {style: textStyle.S}, tabName)
                ),
                window: e('div', {
                        style: {display: 'none'},
                        id: (tabName + "W")
                    },
                    e('div', {style: smoothTabStyle},
                        e('text', {style: textStyle.S}, "Smoothing"),
                        e('input', {
                            style: {...textInputStyle, marginLeft: '5px'},
                            type: 'number',
                            min: smooth.min,
                            max: smooth.max,
                            placeholder: smooth.default,
                            onChange: e => this.changeSmooth.bind(this)
                        })
                    ),
                    e('div', {style: triggerWindowStyle})
                )
            }
        }

        switchTab(tabName) {
            this.setState({currentTab: tabName});
            this.commandList.forEach(tab => {
                document.getElementById(tab).style.backgroundColor = colorTheme.darkgray1
                console.log(document.getElementById(tab + "W"))
            });

            document.getElementById(tabName).style.backgroundColor = colorTheme.lightgray1
            //document.getElementById(tabName + "Window").style.display = 'inline'
        }

        changeSmooth(value) {
            let {smoothingValues} = this.state;
            let targetValue = parseInt(value);

            if(isNaN(targetValue)) {
                smoothingValues[this.state.currentTab] = smooth.default;
                this.setState({smoothingValues});
                return;
            }

            if(targetValue < smooth.min || targetValue > smooth.max) {
                return;
            }
            
            smoothingValues[this.state.currentTab] = targetValue;
            this.setState({smoothingValues});
        }

        onActivate() {
            if(this.state.active) {
                this.setState({active: false});
            } else {
                this.setState({active: true});
            }
        }
    }

    const commandEditorParent = document.createElement('div');

    document.getElementById('content').appendChild(commandEditorParent);

    ReactDOM.render(
        e(CommandEditorContainer),
        commandEditorParent
    )
}

if(window.store) {
  main();
} else {
  window.onAppReady = main;
}