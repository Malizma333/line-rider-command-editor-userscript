function main () {
  const { React, ReactDOM } = window

  const parent = document.createElement('div')
  parent.setAttribute('id', Constants.ROOT_NODE_ID)
  document.getElementById('content').appendChild(parent)

  ReactDOM.render(React.createElement(InitRoot()), parent)
}

if (window.store) {
  main()
} else {
  const prevInit = window.onAppReady
  window.onAppReady = () => {
    if (prevInit) prevInit()
    main()
  }
}
