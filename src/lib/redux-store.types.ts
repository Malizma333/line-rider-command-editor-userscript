export interface DispatchAction {
  type: string
  payload: Payload
  meta?: object
}

export type ReduxState = ReturnType<typeof window.store.getState>

export type Payload = null | boolean | number | string | object
export interface Track { engine: { state: { riders: Rider[] } } }
export type Rider = object
export interface EditorPosition { x: number, y: number }
export interface Dimensions { width: number, height: number }
