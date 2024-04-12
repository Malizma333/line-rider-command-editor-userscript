// Main function, entry point of the application

function main() {
  window.V2 = window.V2 || Selectors.getWindowStart(window.store.getState());

  const { React, ReactDOM } = window;

  const parent = document.createElement('div');
  parent.setAttribute('id', Constants.ROOT_NODE_ID);
  document.getElementById('content').appendChild(parent);

  ReactDOM.render(React.createElement(CommandEditorComponent), parent);
}

if (window.store) {
  main();
} else {
  window.onAppReady = main;
}
