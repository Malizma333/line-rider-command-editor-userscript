/* eslint-disable @typescript-eslint/no-unused-vars */

type Payload = any

interface DispatchAction {
  type: string
  payload: Payload
  meta?: Object
}

function setPlaybackDimensions (dimension: { width: number, height: number }): DispatchAction {
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
