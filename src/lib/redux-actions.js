/**
 *
 * @param dimension
 */
export function setPlaybackDimensions(dimension) {
  return {
    type: 'SET_PLAYBACK_DIMENSIONS',
    payload: dimension,
  };
}

/**
 *
 */
export function closeSidebar() {
  return {
    type: 'SET_VIEWS',
    payload: {Sidebar: null},
    meta: {name: 'SET_SIDEBAR_PAGE', auto: false},
  };
}
