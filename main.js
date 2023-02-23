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

        let shouldBeVisible = !playerRunning && windowFocused;

        commandEditorParent.style.opacity = shouldBeVisible ? 1 : 0;
        commandEditorParent.style.pointerEvents = shouldBeVisible ? null : 'none';
    })

    class CommandEditorContainer extends React.Component {
        constructor () {
            super();

            this.state = {
                active: false,
                currentTab: "Zoom",
                errorMessage: "...",
                hasError: false,
                smoothingValues: {}
            }

            store.subscribeImmediate(() => {
                this.switchTab(this.state.currentTab);
            })

            mainComponent = e('div', this.state.active && {style: expandedWindow},
                e('button', {
                        style: expandCollapseButtonStyle,
                        onClick: this.onActivate.bind(this)
                    },
                    e('text', {style: textStyle.L},
                        this.state.active ? "-" : "+"
                    )
                ),
                e('div', !this.state.active && {style: {display: 'none'}},
                    this.commandTabs,
                    this.smoothTab,
                    this.readWriteComponents
                )
            )
            
            readWriteComponents = e('div', null,
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
            
            this.tabNameList = []

            this.commandTabs = e('div', {style: tabHeaderStyle},
                this.createTab("Zoom"),
                this.createTab("Camera Pan"),
                this.createTab("Camera Focus"),
                this.createTab("Time Remap")
            )

            this.smoothTab = e('div', {style: smoothTabStyle},
                e('text', {style: textStyle.S}, "Smoothing"),
                e('input', {
                    style: {...textInputStyle, marginLeft: '5px'},
                    type: 'number',
                    min: 0,
                    max: 20,
                    placeholder: 10,
                    onChange: e => this.changeSmooth(e.target.value)
                })
            )

            this.triggerWindow = e('div', {style: triggerWindowStyle},
                
            )
        }

        componentDidMount() {
            Object.assign(commandEditorParent.style, parentStyle);
        }

        render() {
            return this.mainComponent;
        }

        createTab(tabName) {
            this.tabNameList.push(tabName);

            let {smoothingValues} = this.state;
            smoothingValues[tabName] = 10;
            this.setState({smoothingValues});

            return e('button', {
                    style: {
                        ...tabButtonStyle,
                        backgroundColor: colorTheme.darkgray1
                    },
                    id: tabName,
                    onClick: () => {this.switchTab(tabName)}
                },
                e('text', {style: textStyle.S}, tabName)
            )
        }

        switchTab(tabName) {
            this.setState({currentTab: tabName});

            this.tabNameList.forEach(tab => {
                document.getElementById(tab).style.backgroundColor = colorTheme.darkgray1
            });

            document.getElementById(tabName).style.backgroundColor = colorTheme.lightgray1
        }

        changeSmooth(value) {
            let {smoothingValues} = this.state;
            let targetValue = parseInt(value);

            if(isNaN(targetValue)) {
                smoothingValues[this.state.currentTab] = 10;
                this.setState({smoothingValues});
                return;
            }

            if(targetValue < 0 || targetValue > 20) {
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

        onRead() {
            console.log("Read");
        }
        
        onCommit() {
            console.log("Commit");
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