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

const getWindowStart = state => state.simulator.engine.engine.state.startPoint.constructor

const getWindowFocused = state => state.views.Main
const getPlayerRunning = state => state.player.running

const getCurrentScript = state => state.trackData.script
const getRiders = state => state.simulator.engine.engine.state.riders
const getNumRiders = state => getRiders(state).length
