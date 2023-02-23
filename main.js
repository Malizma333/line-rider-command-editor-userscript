//Test

const setTool = (tool) => ({
  type: 'SET_TOOL',
  payload: tool
})

const getActiveTool = state => state.selectedTool
const getWindowFocused = state => state.views.Main
const getPlayerRunning = state => state.player.running

function main () {
  window.V2 = window.V2 || window.store.getState().simulator.engine.engine.state.startPoint.constructor

  const {
    React,
    ReactDOM,
    store
  } = window

  const e = React.createElement
  var playerRunning = getPlayerRunning(store.getState());
  var windowFocused = getWindowFocused(store.getState());

  const rootStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      textAlign: 'left',
      transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      width: '100%'
  }

  const boxStyle = {
      display: 'flex',
      flexDirection: 'column-reverse',
      padding: 8,
      width: '100%'
  }

  store.subscribe(() => {
      playerRunning = getPlayerRunning(store.getState());
      windowFocused = getWindowFocused(store.getState());

      let shouldBeVisible = !playerRunning && windowFocused;

      toolContainer.style.opacity = shouldBeVisible ? 1 : 0;
      toolContainer.style.pointerEvents = shouldBeVisible ? null : 'none';

      settingsContainer.style.opacity = shouldBeVisible ? 1 : 0;
      settingsContainer.style.pointerEvents = shouldBeVisible ? null : 'none';
  })

  class CustomToolsContainer extends React.Component {
    constructor () {
      super()

      this.state = {
        activeTool: getActiveTool(store.getState()),
        customTools: {}
      }

      store.subscribe(() => {
        const activeTool = getActiveTool(store.getState())
        if (this.state.activeTool !== activeTool) {
          let activeCustomTool = this.state.customTools[this.state.activeTool]
          if (activeCustomTool && activeCustomTool.onDetach) {
            activeCustomTool.onDetach()
          }
          this.setState({ activeTool })
        }
      })
    }

    componentDidMount () {
      let containerAssigned = false;
      window.registerCustomTool = (toolName, tool, component, onDetach) => {
        console.info('Registering custom tool', toolName)

        window.Tools[toolName] = tool

        this.setState((prevState) => ({
          customTools: {
            ...prevState.customTools,
            [toolName]: { component, onDetach }
          }
        }))

        if (onDetach) {
          this.customToolsDestructors[toolName] = onDetach
        }

        if(!containerAssigned) {
            containerAssigned = true;
            Object.assign(toolContainer.style, {
                position: 'fixed',
                width : '200px',
                height: '16%',
                overflowY: 'auto',
                overflowX: 'hidden',
                top: '50%',
                right: '8px',
                border: '1px solid black',
                backgroundColor: '#ffffff',
                opacity: 0,
                pointerEvents: 'none'
            })
        }
      }
    }

    render () {
      const activeCustomTool = this.state.customTools[this.state.activeTool]

      return e('div', { style: rootStyle },
        Object.keys(this.state.customTools).length > 0 && e('div', null,
            e('select', {
            style: {textAlign: 'center', width : '200px'},
            maxMenuHeight : 100,
            value: this.state.activeTool,
            onChange: e => {
                store.dispatch(setTool(e.target.value))
            }},
             e('option', {value: 'PENCIL_TOOL'}, '- Select Tool -'),
             ...Object.keys(this.state.customTools).map(toolName =>
              e('option', {value: toolName}, toolName)
             ))
        ),
        activeCustomTool && activeCustomTool.component && e('div', { style: boxStyle }, e(activeCustomTool.component)),
      )
    }
  }

    const toolContainer = document.createElement('div');

    document.getElementById('content').appendChild(toolContainer)

    ReactDOM.render(
        e(CustomToolsContainer),
        toolContainer
    )

  class CustomSettingsContainer extends React.Component {
    constructor () {
      super()

      this.state = {
        activeSetting: null,
        customSettings: []
      }
    }

    componentDidMount () {
        let containerAssigned = false;

        window.registerCustomSetting = (component) => {
            console.info('Registering custom setting', component.name)
            this.setState((prevState) => ({
                customSettings: [...prevState.customSettings, component]
            }))

            if(!containerAssigned) {
                containerAssigned = true;
                Object.assign(settingsContainer.style, {
                    position: 'fixed',
                    width : '200px',
                    height: '150px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    bottom: '15%',
                    right: '8px',
                    border: '1px solid black',
                    backgroundColor: '#ffffff',
                    opacity: 0,
                    pointerEvents: 'none'
                })
            }
        }

        if (typeof window.onCustomToolsApiReady === 'function') {
            window.onCustomToolsApiReady()
        }
    }

    render() {
        const activeSetting = this.state.customSettings[this.state.activeSetting];

        return e('div', { style: rootStyle },
        this.state.customSettings.length > 1 && e('div', {style: {width: '100%'}},
            e('select', {
            style: {textAlign: 'center', width: '100%'},
            value: this.state.activeSetting,
            onChange: e => this.setState({ activeSetting : e.target.value })},
             e('option', {value: null}, '- Select Mod -'),
             this.state.customSettings.map((option, index) => (
              e('option', {value: index}, option.name)
             ))
            )
        ),
        activeSetting && e('div', { style: boxStyle }, e(activeSetting)),
      )
    }
  }

  const settingsContainer = document.createElement('div')

    document.getElementById('content').appendChild(settingsContainer)

    ReactDOM.render(
        e(CustomSettingsContainer),
        settingsContainer
    )

  class Settings extends React.Component {
      constructor (props) {
          super(props)

          let windowPreferences = localStorage.getItem("windowPreferences")

          if(windowPreferences) {
              this.state = JSON.parse(windowPreferences)
          } else {
              this.state = {
                  divWidth: 200,
                  divHeight: 150
              }
          }
      }

      componentWillUpdate (nextProps, nextState) {
          Object.assign(settingsContainer.style, {
              width: nextState.divWidth + 'px',
              height: nextState.divHeight + 'px'
          })
      }

      render () {
          return e('div', null,
                   e('div', null,
                     'Window Width ',
                     e('input', { style: { width: '3.3em' }, type: 'number',
                                 min: 200, max: 300, step: 1,
                                 value: this.state.divWidth,
                                 onChange: e => {
                                     let w = parseFloat(e.target.value);
                                     if(200 <= w && w <= 300) {
                                         this.setState({ divWidth: w })
                                         localStorage.setItem("windowPreferences", JSON.stringify(this.state))
                                     }
                                 }
                                })
                    ),
                   e('div', null,
                     'Window Height ',
                     e('input', { style: { width: '3.3em' }, type: 'number',
                                 min: 150, max: 250, step: 1,
                                 value: this.state.divHeight,
                                 onChange: e => {
                                     let h = parseFloat(e.target.value);
                                     if(150 <= h && h <= 250) {
                                         this.setState({ divHeight: h })
                                         localStorage.setItem("windowPreferences", JSON.stringify(this.state))
                                     }
                                 }
                                })))
      }
    }

    window.registerCustomSetting(Settings)

    let windowPreferences = localStorage.getItem("windowPreferences")

    if(windowPreferences) {
        let parsedPreferences = JSON.parse(windowPreferences);
        Object.assign(settingsContainer.style, {
            width: parsedPreferences.divWidth + 'px',
            height: parsedPreferences.divHeight + 'px'
        })
    }
}

if (window.store) {
  main()
} else {
  window.onAppReady = main
}


/*
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
            console.log("Rendering");
            return this.mainComponent;
        }
    }

    const commandEditorParent = document.createElement('div');

    document.getElementById('content').appendChild(commandEditorParent);

    ReactDOM.render(
        e(CommandEditorContainer),
        commandEditorParent
    )

    console.log("Test");
}

if(window.store) {
  main();
} else {
  window.onAppReady = main;
}
*/