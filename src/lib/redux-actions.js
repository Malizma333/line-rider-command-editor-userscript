/**
 * Returns a dispatch object to set the dimensions of the playback camera
 * @param {{width: number, height:number}} dimension Viewport dimensions to assign to the camera
 * @returns {import("redux").AnyAction} Action object to dispatch to the redux store
 */
export function setPlaybackDimensions(dimension) {
  return {
    type: 'SET_PLAYBACK_DIMENSIONS',
    payload: dimension,
  };
}

/**
 * Returns a dispatch object to close the sidebar
 * @returns {import("redux").AnyAction} Action object to dispatch to the redux store
 */
export function closeSidebar() {
  return {
    type: 'SET_VIEWS',
    payload: {Sidebar: null},
    meta: {name: 'SET_SIDEBAR_PAGE', auto: false},
  };
}
