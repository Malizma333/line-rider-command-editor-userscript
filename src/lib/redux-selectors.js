
/**
 * Selects the uncommitted engine object
 * @param {any} state Redux store state
 * @returns {object} Uncommitted track object
 */
export function getSimulatorTrack(state) {
  return state.simulator.engine;
}

/**
 * Selects the view property corresponding to the main view
 * @param {any} state Redux store state
 * @returns {boolean} True if the view is not on the splash screen
 */
export function getWindowFocused(state) {
  return !!state.views.Main;
}

/**
 * Selects the player running state
 * @param {any} state Redux store state
 * @returns {boolean} True if the timeline is playing
 */
export function getPlayerRunning(state) {
  return state.player.running;
}

/**
 * Selects the currently loaded track script
 * @param {any} state Redux store state
 * @returns {string} The script
 */
export function getCurrentScript(state) {
  return state.trackData.script;
}

/**
 * Selects the length of the rider array from the track state
 * @param {any} state Redux store state
 * @returns {number} Number of riders
 */
export function getNumRiders(state) {
  return getSimulatorTrack(state).engine.state.riders.length;
}

/**
 * Selects the player index state
 * @param {any} state Redux store state
 * @returns {number} Current frame the timeline is on
 */
export function getPlayerIndex(state) {
  return state.player.index;
}

/**
 * Selects the view property corresponding to the sidebar view
 * @param {any} state Redux store state
 * @returns {boolean} True if the sidebar is open
 */
export function getSidebarOpen(state) {
  return !!state.views.Sidebar;
}

/**
 * Selects the label property from the track data
 * @param {any} state Redux store state
 * @returns {string} Track label string
 */
export function getTrackTitle(state) {
  return state.trackData.label;
}

/**
 * Selects the current zoom in the editor
 * @param {any} state Redux store state
 * @returns {number} Camera zoom level
 */
export function getEditorZoom(state) {
  return state.camera.editorZoom;
}

/**
 * Selects the current position in the editor
 * @param {any} state Redux store state
 * @returns {{x: number, y: number}} Camera position
 */
export function getEditorPosition(state) {
  return state.camera.editorPosition;
}
/**
 * Selects the current zoom of the playback camera based on the current timeline index
 * @param {any} state Redux store state
 * @returns {number} Camera zoom level
 */
export function getPlaybackZoom(state) {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

/**
 * Selects the dimensions of the playback camera
 * @param {any} state Redux store state
 * @returns {{width: number, height: number}} Camera dimensions
 */
export function getPlaybackDimensions(state) {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
