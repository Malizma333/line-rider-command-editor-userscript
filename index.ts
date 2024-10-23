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
