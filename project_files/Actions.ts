interface DispatchAction {
  type: string
  payload: any
  meta?: Object
}

function setPlaybackDimensions (dimension: { width: any, height: any }): DispatchAction {
  return {
    type: 'SET_PLAYBACK_DIMENSIONS',
    payload: dimension
  }
}

function closeSidebar (): DispatchAction {
  return {
    type: 'SET_VIEWS',
    payload: { Sidebar: null },
    meta: { name: 'SET_SIDEBAR_PAGE', auto: false }
  }
}
