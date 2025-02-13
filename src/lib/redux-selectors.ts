/**
 * Selects the uncommitted engine object
 * @param state Redux store state
 * @returns Uncommitted track object
 */
export function getSimulatorTrack(state: RootState): object {
  return state.simulator.engine;
}

/**
 * Selects the view property corresponding to the main view
 * @param state Redux store state
 * @returns True if the view is not on the splash screen
 */
export function getWindowFocused(state: RootState): boolean {
  return !!state.views.Main;
}

/**
 * Selects the player running state
 * @param state Redux store state
 * @returns True if the timeline is playing
 */
export function getPlayerRunning(state: RootState): boolean {
  return state.player.running;
}

/**
 * Selects the currently loaded track script
 * @param state Redux store state
 * @returns The script
 */
export function getCurrentScript(state: RootState): string {
  return state.trackData.script;
}

/**
 * Selects the length of the rider array from the track state
 * @param state Redux store state
 * @returns Number of riders
 */
export function getNumRiders(state: RootState): number {
  return state.simulator.engine.engine.state.riders.length;
}

/**
 * Selects the player index state
 * @param state Redux store state
 * @returns Current frame the timeline is on
 */
export function getPlayerIndex(state: RootState): number {
  return state.player.index;
}

/**
 * Selects the view property corresponding to the sidebar view
 * @param state Redux store state
 * @returns True if the sidebar is open
 */
export function getSidebarOpen(state: RootState): boolean {
  return !!state.views.Sidebar;
}

/**
 * Selects the label property from the track data
 * @param state Redux store state
 * @returns Track label string
 */
export function getTrackTitle(state: RootState): string {
  return state.trackData.label;
}

/**
 * Selects the current zoom in the editor
 * @param state Redux store state
 * @returns Camera zoom level
 */
export function getEditorZoom(state: RootState): number {
  return state.camera.editorZoom;
}

/**
 * Selects the current position in the editor
 * @param state Redux store state
 * @returns Camera position
 */
export function getEditorPosition(state: RootState): {x: number, y: number} {
  return state.camera.editorPosition;
}
/**
 * Selects the current zoom of the playback camera based on the current timeline index
 * @param state Redux store state
 * @returns Camera zoom level
 */
export function getPlaybackZoom(state: RootState): number {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

/**
 * Selects the dimensions of the playback camera
 * @param state Redux store state
 * @returns Camera dimensions
 */
export function getPlaybackDimensions(state: RootState): {width: number, height: number} {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}

/**
 * Selects the mapping of the track layer indices to their ids
 * @param state Redux store state
 * @returns List of layer ids by index
 */
export function getLayers(state: RootState): number[] {
  return state.simulator.committedEngine.engine.state.layers.toArray().map((l: {id: number}) => l.id);
}
