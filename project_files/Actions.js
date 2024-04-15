// eslint-disable-next-line no-unused-vars
class Actions {
  static setPlaybackDimensions(dimension) {
    return {
      type: 'SET_PLAYBACK_DIMENSIONS',
      payload: dimension,
    };
  }

  static closeSidebar() {
    return {
      type: 'SET_VIEWS',
      payload: { Sidebar: null },
      meta: { name: 'SET_SIDEBAR_PAGE', auto: false },
    };
  }
}
