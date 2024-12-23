function main (): void {
  const { React, ReactDOM } = window

  const parent = document.createElement('div')
  parent.setAttribute('id', ROOT_NODE_ID);
  (document.getElementById('content') as HTMLElement).appendChild(parent)

  ReactDOM.render(React.createElement(InitRoot()), parent)

  const content = (document.getElementById('content') as HTMLElement)
  const timerId = setInterval(() => {
    const errorContainer = content.querySelector('div[style="margin: 16px;"]')
    if (errorContainer != null) {
      const errorHeader = errorContainer.querySelector('h1')
      if (errorHeader != null && errorHeader.innerHTML === 'An error occured!') {
        console.warn('[index.main()] Crash detected...')
        window.save_commands()
        clearInterval(timerId)
      }
    }
  }, 100)
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
