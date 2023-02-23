/* React Style Constants */

const colorTheme = {
    black: '#000000',
    darkgray1: '#b7b7b7',
    darkgray2: '#999999',
    darkgray3: '#666666',
    darkgray4: '#434343',
    gray: '#cccccc',
    lightgray1: '#d9d9d9',
    lightgray2: '#efefef',
    lightgray3: '#f3f3f3',
    white: '#ffffff'
}

const parentStyle = {
    backgroundColor: colorTheme.lightgray3,
    border: '1px solid black',
    left: '55px',
    opacity: 0,
    overflowX: 'hidden',
    overflowY: 'hidden',
    pointerEvents: 'none',
    position: 'fixed',
    top: '20px'
}

const expandedWindow = {
    height: '400px',
    width: '575px'
}

const expandCollapseButtonStyle = {
    backgroundColor: '#ffffff00',
    border: 'none',
    height: '35px',
    width: '35px'
}

const readWriteButtonStyle = {
    backgroundColor: colorTheme.lightgray1,
    border: '2px solid black',
    borderRadius: '10px',
    bottom: '35px',
    height: '50px',
    position: 'absolute',
    width: '24%'
}

const tabHeaderStyle = {
    left: '5%',
    position: 'absolute',
    top: '25px'
}

const tabButtonStyle = {
    border: '2px solid black',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    height: '30px'
}

const smoothTabStyle = {
    alignItems: 'center',
    backgroundColor: colorTheme.lightgray1,
    border: '2px solid black',
    display: 'flex',
    height: '30px',
    justifyContent: 'center',
    right: '5%',
    position: 'absolute',
    top: '25px',
    width: '130px'
}

const triggerWindowStyle = {
    backgroundColor: colorTheme.white,
    border: '2px solid black',
    direction: 'rtl',
    height: '60%',
    left: '5%',
    overflowY: 'scroll',
    position: 'absolute',
    top: '55px',
    width: '90%'
}

const errorContainerStyle = {
    alignItems: 'center',
    backgroundColor: colorTheme.white,
    border: '2px solid black',
    bottom: '20px',
    display: 'flex',
    height: '80px',
    justifyContent: 'center',
    left: '30%',
    position: 'absolute',
    width: '40%'
}

const textStyle = {
    S: {
        fontSize: '14px',
        fontWeight: 'bold'
    },
    M: {
        fontSize: '24px',
        fontWeight: 'bold'
    },
    L: {
        fontSize: '32px',
        fontWeight: 'bold'
    }
}

const textInputStyle = {
    backgroundColor: colorTheme.white,
    fontSize: '14px',
    fontWeight: 'bold',
    height: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    width: '40px'
}

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
                active: true,
                currentTab: "Zoom",
                errorMessage: "...",
                hasError: false,
                smoothingValues: {}
            }

            store.subscribeImmediate(() => {
                this.switchTab(this.state.currentTab);
            })

            this.tabNameList = []

            this.mainComponent =
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
                    this.commandTabs,
                    this.smoothTab,
                    this.readWriteComponents
                )
            )
            
            this.readWriteComponents =
            e('div', null,
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

            this.commandTabs =
            e('div', {style: tabHeaderStyle},
                this.createTab("Zoom"),
                this.createTab("Camera Pan"),
                this.createTab("Camera Focus"),
                this.createTab("Time Remap")
            )

            this.smoothTab =
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
            )

            this.triggerWindow =
            e('div', {style: triggerWindowStyle},
                
            )
        }

        componentDidMount() {
            console.log("Registered Command Editor");
            Object.assign(commandEditorParent.style, parentStyle);
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

        render() {
            return this.mainComponent;
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