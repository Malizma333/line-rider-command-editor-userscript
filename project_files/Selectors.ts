function getSimulatorTrack (state: any): any { return state.simulator.engine }

function getWindowFocused (state: any): boolean { return (state.views.Main as boolean) }

function getPlayerRunning (state: any): boolean { return state.player.running }

function getCurrentScript (state: any): string { return state.trackData.script }

function getRiders (state: any): any[] { return getSimulatorTrack(state).engine.state.riders }

function getNumRiders (state: any): number { return getRiders(state).length }

function getPlayerIndex (state: any): number { return state.player.index }

function getSidebarOpen (state: any): boolean { return (state.views.Sidebar as boolean) }

function getTrackTitle (state: any): string { return state.trackData.label }
