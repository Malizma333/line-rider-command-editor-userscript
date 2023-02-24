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
                /*let zoomCommandEditor = new commandEditor(
                    "Zoom",
                    [[0,0,0], 2],
                    e('div', null)
                )*/

                this.switchTab(this.state.currentTab);
            })

            this.tabNameList = []
            
            this.readWriteComponents = this.getReadWriteComponents()
            this.zoomCommandWindow = this.createTab("Zoom")
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
                    this.zoomCommandWindow,
                    this.readWriteComponents
                )
            )
        }

        getReadWriteComponents() {
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
            this.tabNameList.push(tabName);

            let {smoothingValues} = this.state;
            smoothingValues[tabName] = 10;
            this.setState({smoothingValues});

            return e('div', null, 
                e('div', {style: tabHeaderStyle},
                    e('button', {
                        style: {
                            ...tabButtonStyle,
                            backgroundColor: colorTheme.darkgray1
                        },
                        id: tabName,
                        onClick: () => {this.switchTab(tabName)}
                        },
                        e('text', {style: textStyle.S}, tabName)
                    )
                ),
                e('div', this.currentTab != tabName && {style: {display: 'none'}},
                    e('div', {style: smoothTabStyle},
                        e('text', {style: textStyle.S}, "Smoothing"),
                        e('input', {
                            style: {...textInputStyle, marginLeft: '5px'},
                            type: 'number',
                            min: 0,
                            max: 20,
                            placeholder: 10,
                            onChange: e => this.changeSmooth(e.target.value)
                        })
                    ),
                    e('div', {style: triggerWindowStyle},
                    )
                )
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