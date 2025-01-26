import { Dimensions, StoreState, DispatchAction, Track, EditorPosition } from "./redux-store.types";

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

export function getSimulatorTrack (state: StoreState): Track { return state.simulator.engine; }

export function getWindowFocused (state: StoreState): boolean { return (state.views.Main as boolean); }

export function getPlayerRunning (state: StoreState): boolean { return state.player.running; }

export function getCurrentScript (state: StoreState): string { return state.trackData.script; }

export function getNumRiders (state: StoreState): number { return getSimulatorTrack(state).engine.state.riders.length; }

export function getPlayerIndex (state: StoreState): number { return state.player.index; }

export function getSidebarOpen (state: StoreState): boolean { return (state.views.Sidebar as boolean); }

export function getTrackTitle (state: StoreState): string { return state.trackData.label; }

export function getEditorZoom (state: StoreState): number { return state.camera.editorZoom; }

export function getEditorPosition (state: StoreState): EditorPosition { return state.camera.editorPosition; }

export function getPlaybackZoom(state: StoreState): number {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom;
}

export function getPlaybackDimensions(state: StoreState): Dimensions {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
