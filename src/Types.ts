/* eslint-disable @typescript-eslint/no-unused-vars */

interface Window {
  React: any
  ReactDOM: any
  store: any
  onAppReady: Function
  save_commands: Function
  CMD_EDITOR_DEBUG: boolean
  getAutoZoom?: any
  createZoomer: Function
  getCamBounds?: any
  createBoundsPanner: Function
  getCamFocus?: any
  createFocuser: Function
  timeRemapper?: any
  createTimeRemapper: Function
  setCustomRiders: Function
  setCustomGravity?: Function
}

type PropMap<Type> = {
  [Property in keyof Type]: string;
}

type ReduxState = ReturnType<typeof window.store.getState>
type ReactComponent = typeof window.React.Component
type SetState = any

type DeepReadonly<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
}
