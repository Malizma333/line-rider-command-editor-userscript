/* eslint-disable @typescript-eslint/no-unused-vars */

interface Window {
  React: any
  ReactDOM: any
  store: any
  onAppReady: Function
  save_commands: Function
  CMD_EDITOR_DEBUG: boolean
}

type ReactComponent = typeof window.React.Component

type Cloneable<T> = T extends Function | Symbol
  ? never
  : T extends Record<any, any>
    ? { -readonly [k in keyof T]: Cloneable<T[k]> }
    : T

declare function structuredClone<T> (value: Cloneable<T>, options?: StructuredSerializeOptions | undefined): Cloneable<T>
