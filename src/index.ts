function main (): void {
  const { React, ReactDOM } = window

  const parent = document.createElement('div')
  parent.setAttribute('id', 'COMMAND_EDITOR_ROOT_NODE');
  (document.getElementById('content') as HTMLElement).appendChild(parent)

  ReactDOM.render(React.createElement(InitRoot(parent)), parent)

  const content = (document.getElementById('content') as HTMLElement)
  const timerId = setInterval(() => {
    const errorContainer = content.querySelector('div[style="margin: 16px;"]')
    if (errorContainer) {
      const errorHeader = errorContainer.querySelector('h1')
      if (errorHeader && errorHeader.innerHTML === 'An error occured!') {
        console.warn('[index.main()] Crash detected...')
        window.save_commands()
        clearInterval(timerId)
      }
    }
  }, 100)
}
