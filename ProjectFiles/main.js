function main () {
  const { React, ReactDOM } = window

  const parent = document.createElement('div')
  document.getElementById('content').appendChild(parent)

  class LegacyComponent extends React.Component {
    constructor () {
      super()

      this.state = {}
    }

    componentDidMount () {
      Object.assign(parent.style, {
        border: '2px solid black',
        left: '50px',
        position: 'fixed',
        top: '12.5px'
      })
    }

    render () {
      return React.createElement(
        'div',
        null,
        'Outdated command editor userscript build version detected! Please update by following the link below.',
        React.createElement('br'),
        React.createElement('a', { href: 'https://github.com/Malizma333/linerider-userscript-mods/raw/master/mods/line-rider-command-editor.user.js' }, 'Click Here')
      )
    }
  }

  ReactDOM.render(React.createElement(LegacyComponent), parent)
}

if (window.store) {
  main()
} else {
  window.onAppReady = main
}
