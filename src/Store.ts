interface DispatchAction {
  type: string
  payload: Payload
  meta?: object
}

type ReduxState = ReturnType<typeof window.store.getState>

type Payload = null | boolean | number | string | object
interface Track { engine: { state: { riders: Rider[] } } }
type Rider = object
interface EditorPosition { x: number, y: number }
interface Dimensions { width: number, height: number }

export function setPlaybackDimensions (dimension: Dimensions): DispatchAction {
  return {
    type: "SET_PLAYBACK_DIMENSIONS",
    payload: dimension
  };
}

export function closeSidebar (): DispatchAction {
  return {
    type: "SET_VIEWS",
    payload: { Sidebar: null },
    meta: { name: "SET_SIDEBAR_PAGE", auto: false }
  };
}

export function getSimulatorTrack (state: ReduxState): Track { return state.simulator.engine; }

export function getWindowFocused (state: ReduxState): boolean { return (state.views.Main as boolean); }

export function getPlayerRunning (state: ReduxState): boolean { return state.player.running; }

export function getCurrentScript (state: ReduxState): string { return state.trackData.script; }

export function getRiders (state: ReduxState): Rider[] { return getSimulatorTrack(state).engine.state.riders; }

export function getNumRiders (state: ReduxState): number { return getRiders(state).length; }

export function getPlayerIndex (state: ReduxState): number { return state.player.index; }

export function getSidebarOpen (state: ReduxState): boolean { return (state.views.Sidebar as boolean); }

export function getTrackTitle (state: ReduxState): string { return state.trackData.label; }

export function getEditorZoom (state: ReduxState): number { return state.camera.editorZoom; }

export function getEditorPosition (state: ReduxState): EditorPosition { return state.camera.editorPosition; }

export function getPlaybackZoom(state: ReduxState): number {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

export function getPlaybackDimensions(state: ReduxState): Dimensions {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
