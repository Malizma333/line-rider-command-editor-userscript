
/**
 *
 * @param state
 */
export function getSimulatorTrack(state) {
  return state.simulator.engine;
}

/**
 *
 * @param state
 */
export function getWindowFocused(state) {
  return (state.views.Main);
}

/**
 *
 * @param state
 */
export function getPlayerRunning(state) {
  return state.player.running;
}

/**
 *
 * @param state
 */
export function getCurrentScript(state) {
  return state.trackData.script;
}

/**
 *
 * @param state
 */
export function getNumRiders(state) {
  return getSimulatorTrack(state).engine.state.riders.length;
}

/**
 *
 * @param state
 */
export function getPlayerIndex(state) {
  return state.player.index;
}

/**
 *
 * @param state
 */
export function getSidebarOpen(state) {
  return (state.views.Sidebar);
}

/**
 *
 * @param state
 */
export function getTrackTitle(state) {
  return state.trackData.label;
}

/**
 *
 * @param state
 */
export function getEditorZoom(state) {
  return state.camera.editorZoom;
}

/**
 *
 * @param state
 */
export function getEditorPosition(state) {
  return state.camera.editorPosition;
}

/**
 *
 * @param state
 */
export function getPlaybackZoom(state) {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

/**
 *
 * @param state
 */
export function getPlaybackDimensions(state) {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
