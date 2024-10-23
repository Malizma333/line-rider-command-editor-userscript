interface Window {
  React: any
  ReactDOM: any
  store: any
  onAppReady: Function
  save_commands: Function
  CMD_EDITOR_DEBUG: boolean
}

type Cloneable<T> = T extends Function | Symbol
  ? never
  : T extends Record<any, any>
    ? { -readonly [k in keyof T]: Cloneable<T[k]> }
    : T

declare function structuredClone<T> (value: Cloneable<T>, options?: StructuredSerializeOptions | undefined): Cloneable<T>

type ReactComponent = typeof window.React.Component

function main (): void {
  const { React, ReactDOM } = window

  const parent = document.createElement('div')
  parent.setAttribute('id', ROOT_NODE_ID);
  (document.getElementById('content') as HTMLElement).appendChild(parent)

  ReactDOM.render(React.createElement(InitRoot()), parent)
}

if (window.store != null) {
  main()
} else {
  const prevInit = window.onAppReady
  window.onAppReady = () => {
    if (prevInit != null) prevInit()
    main()
  }
}
