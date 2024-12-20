/* eslint-disable @typescript-eslint/no-unused-vars */

type Track = any
type Rider = any
type EditorPosition = any
type Dimensions = any

function getSimulatorTrack (state: ReduxState): Track { return state.simulator.engine }

function getWindowFocused (state: ReduxState): boolean { return (state.views.Main as boolean) }

function getPlayerRunning (state: ReduxState): boolean { return state.player.running }

function getCurrentScript (state: ReduxState): string { return state.trackData.script }

function getRiders (state: ReduxState): Rider[] { return getSimulatorTrack(state).engine.state.riders }

function getNumRiders (state: ReduxState): number { return getRiders(state).length }

function getPlayerIndex (state: ReduxState): number { return state.player.index }

function getSidebarOpen (state: ReduxState): boolean { return (state.views.Sidebar as boolean) }

function getTrackTitle (state: ReduxState): string { return state.trackData.label }

function getEditorZoom (state: ReduxState): number { return state.camera.editorZoom }

function getEditorPosition (state: ReduxState): EditorPosition { return state.camera.editorPosition }

function getPlaybackZoom(state: ReduxState): number {
  return window.getAutoZoom ?
    window.getAutoZoom(getPlayerIndex(state)) :
    state.camera.playbackZoom
}

function getPlaybackDimensions(state: ReduxState): Dimensions {
  return state.camera.playbackDimensions || state.camera.editorDimensions;
}
