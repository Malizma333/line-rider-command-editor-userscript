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

type ReactComponent = typeof window.React.Component

function main (): void {
  const { React, ReactDOM } = window

  const parent = document.createElement('div');
  (document.getElementById('content') as HTMLElement).appendChild(parent)

  ReactDOM.render(React.createElement(GetRoot(parent)), parent)

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
