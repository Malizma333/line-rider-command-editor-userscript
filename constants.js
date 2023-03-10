/* Window Constants */

const commitTrackChanges = () => ({
    type: 'COMMIT_TRACK_CHANGES'
})

const revertTrackChanges = () => ({
    type: 'REVERT_TRACK_CHANGES'
})

const setTrackScript = (script) => ({
    type: 'trackData/SET_TRACK_SCRIPT',
    payload: script
})

const getWindowFocused = state => state.views.Main;
const getPlayerRunning = state => state.player.running;

const getCurrentScript = state => state.trackData.script;

/* Value Constants */

const smooth = {
    min: 0,
    max: 20,
    default: 10
}

const interpolate = {
    default: true
}

const commandDataTypes = {
    Zoom: {
        name: "Zoom",
        template: [[0,0,0], 2],
        header: "getAutoZoom=createZoomer([{}],{})"
    },
    CameraPan: {
        name: "Camera Pan",
        template: [[0,0,0], {w: 0.4, h: 0.4, x: 0, y: 0}],
        header: "getCamBounds=createBoundsPanner([{}],{})"
    },
    CameraFocus: {
        name: "Camera Focus",
        template: [[0,0,0], [1]],
        header: "getCamFocus=createFocuser([{}],{})"
    },
    TimeRemap: {
        name: "Time Remap",
        template: [[0,0,0], 1],
        header: "timeRemapper=createTimeRemapper([{}],{})"
    }
}

/* Style Constants */

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

const textStyle = {
    S: {
        fontSize: '14px',
        fontWeight: 'bold'
    },
    M: {
        fontSize: '22px',
        fontWeight: 'bold'
    },
    L: {
        fontSize: '32px',
        fontWeight: 'bold'
    }
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

const squareButtonStyle = {
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
    display: 'flex',
    left: '5%',
    position: 'absolute',
    top: '25px'
}

const tabButtonStyle = {
    border: '2px solid black',
    borderBottom: '0px solid black',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    height: '30px'
}

const smoothTabStyle = {
    alignItems: 'center',
    backgroundColor: colorTheme.lightgray1,
    border: '2px solid black',
    borderBottom: '0px solid black',
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

const textInputStyle = {
    backgroundColor: colorTheme.white,
    fontSize: '14px',
    fontWeight: 'bold',
    height: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    width: '40px'
}

const checkboxStyle = {
    appearance: 'none',
    background: '#FFF',
    border: '2px solid black',
    height: '20px',
    marginLeft: '5px',
    width: '20px'
}

const checkedCheckboxStyle = {
    backgroundColor: '#000',
    height: '12px',
    pointerEvents: 'none',
    position: 'absolute',
    right: '18px',
    top: '6px',
    width: '12px'
}

const triggerStyle = {
    borderBottom: '2px solid black',
    borderLeft: '2px solid black',
    direction: 'ltr',
    padding: '10px',
    width: '100%'
}

const triggerText = {
    fontSize: '24px',
    fontWeight: 'bold',
    height: '2ch',
    padding: '5px',
    textAlign: 'right',
    width: '4ch'
}