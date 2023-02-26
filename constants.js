/* Window Constants */

const commitTrackChanges = () => ({
    type: 'COMMIT_TRACK_CHANGES'
})

const revertTrackChanges = () => ({
    type: 'REVERT_TRACK_CHANGES'
})

const getSimulatorCommittedTrack = state => state.simulator.committedEngine

/* Value Constants */

const smooth = {
    min: 0,
    max: 20,
    default: 10
}

const commandDataTypes = {
    "Zoom": [[0,0,0], 2], 
    "Camera Pan": [[0,0,0], {w: 0.4, h: 0.4, x: 0, y: 0}], 
    "Camera Focus": [[0,0,0], [1]], 
    "Time Remap": [[0,0,0], 1]
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
        fontSize: '24px',
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
    display: 'flex',
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

const textInputStyle = {
    backgroundColor: colorTheme.white,
    fontSize: '14px',
    fontWeight: 'bold',
    height: '20px',
    overflow: 'hidden',
    textAlign: 'center',
    width: '40px'
}