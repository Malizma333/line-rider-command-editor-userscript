import { STYLES } from "./components/lib/Styles";
import { RootComponent } from "./components/Root";
import { getPlayerRunning, getWindowFocused } from "./Store";

declare global {
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
}

function main (): void {
  const { React, ReactDOM, store } = window;
  const content = document.getElementById("content") as HTMLElement;
  const parent = document.createElement("div");

  Object.assign(parent.style, STYLES.root);

  ReactDOM.render(React.createElement(RootComponent), parent);

  content.appendChild(parent);

  store.subscribe(() => {
    const playerRunning = getPlayerRunning(store.getState());
    const windowFocused = getWindowFocused(store.getState());
    const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

    parent.style.opacity = shouldBeVisible ? "1" : "0";
    parent.style.pointerEvents = shouldBeVisible ? "auto" : "none";
  });

  const timerId = setInterval(() => {
    const errorContainer = content.querySelector("div[style=\"margin: 16px;\"]");
    if (errorContainer) {
      const errorHeader = errorContainer.querySelector("h1");
      if (errorHeader && errorHeader.innerHTML === "An error occured!") {
        console.warn("[index.main()] Crash detected...");
        window.save_commands();
        clearInterval(timerId);
      }
    }
  }, 100);
}

if (window.store) {
  main();
} else {
  const prevInit = window.onAppReady;
  window.onAppReady = () => {
    if (prevInit) prevInit();
    main();
  };
}