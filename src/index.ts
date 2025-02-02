import {GLOBAL_STYLES} from './styles';
import {App} from './App';
import {getPlayerRunning, getWindowFocused} from './lib/redux-selectors';
import {
  CameraFocusTrigger, CameraPanTrigger, GravityTrigger, TimeRemapTrigger, ZoomTrigger,
} from './lib/TriggerDataManager.types';
import type {Store} from 'redux';

declare global {
  interface Window {
    ReactDOM: { render: (child: React.ComponentElement<object, App>, parent: HTMLElement) => void }
    store: Store
    CMD_EDITOR_DEBUG: boolean
    onAppReady: () => void
    saveCommands: () => void
    getAutoZoom?: (index: number) => number
    createZoomer: (zoom: ZoomTrigger[], smoothing?: number) => typeof window.getAutoZoom
    getCamBounds?: (index: number) => { w: number, h: number, x: number, y: number }
    createBoundsPanner: (pan: CameraPanTrigger[], smoothing?: number) => typeof window.getCamBounds
    getCamFocus?: (index: number) => boolean[]
    createFocuser: (focus: CameraFocusTrigger[], smoothing?: number) => typeof window.getCamFocus
    timeRemapper?: object
    createTimeRemapper: (timeRemap: TimeRemapTrigger[], smoothing?: boolean) => typeof window.timeRemapper
    setCustomRiders: (cssList: string[]) => void
    setCustomGravity?: (gravity: GravityTrigger[]) => void
  }

  type RootState = ReturnType<typeof window.store.getState>
}

/**
 *
 */
function main(): void {
  const {React, store} = window;
  const content = document.getElementById('content') as HTMLElement;
  const parent = document.createElement('div');

  Object.assign(parent.style, GLOBAL_STYLES.root);

  window.ReactDOM.render(React.createElement(App), parent);

  content.appendChild(parent);

  store.subscribe(() => {
    const playerRunning = getPlayerRunning(store.getState());
    const windowFocused = getWindowFocused(store.getState());
    const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

    parent.style.opacity = shouldBeVisible ? '1' : '0';
    parent.style.pointerEvents = shouldBeVisible ? 'auto' : 'none';
  });

  const timerId = setInterval(() => {
    const errorContainer = content.querySelector('div[style="margin: 16px;"]');
    if (errorContainer) {
      const errorHeader = errorContainer.querySelector('h1');
      if (errorHeader && errorHeader.innerHTML === 'An error occured!') {
        console.warn('[index.main()] Crash detected...');
        window.saveCommands();
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
