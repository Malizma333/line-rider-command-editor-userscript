// eslint-disable-next-line no-unused-vars
class Selectors {
  static getSimulatorTrack (state) { return state.simulator.engine }

  static getTrackStart (state) { return Selectors.getSimulatorTrack(state).engine.state.startPoint }

  static getWindowStart (state) { return Selectors.getTrackStart(state).constructor }

  static getWindowFocused (state) { return state.views.Main }

  static getPlayerRunning (state) { return state.player.running }

  static getCurrentScript (state) { return state.trackData.script }

  static getRiders (state) { return Selectors.getSimulatorTrack(state).engine.state.riders }

  static getNumRiders (state) { return Selectors.getRiders(state).length }

  static getPlayerIndex (state) { return state.player.index }

  static getSidebarOpen (state) { return !!state.views.Sidebar }
}
