
export function getSimulatorTrack (state) { return state.simulator.engine; }

export function getWindowFocused (state) { return (state.views.Main); }

export function getPlayerRunning (state) { return state.player.running; }

export function getCurrentScript (state) { return state.trackData.script; }

export function getNumRiders (state) { return getSimulatorTrack(state).engine.state.riders.length; }

export function getPlayerIndex (state) { return state.player.index; }

export function getSidebarOpen (state) { return (state.views.Sidebar); }

export function getTrackTitle (state) { return state.trackData.label; }

export function getEditorZoom (state) { return state.camera.editorZoom; }

export function getEditorPosition (state) { return state.camera.editorPosition; }

export function getPlaybackZoom(state) {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

export function getPlaybackDimensions(state) {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
