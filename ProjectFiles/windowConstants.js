const getWindowStart = state => state.simulator.engine.engine.state.startPoint.constructor

const getWindowFocused = state => state.views.Main
const getPlayerRunning = state => state.player.running

const getCurrentScript = state => state.trackData.script
const getRiders = state => state.simulator.engine.engine.state.riders
const getNumRiders = state => getRiders(state).length
