// Line Rider Command Editor - A UI wrapper for linerider.com console commands
// Copyright (C) 2023-2025 Tobias Bessler
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import type { Store } from "redux";
import { App } from "./App";
import { getPlayerRunning, getWindowFocused } from "./lib/redux-selectors";
import {
  CameraFocusTrigger,
  CameraPanTrigger,
  GravityTrigger,
  LayerTrigger,
  TimeRemapTrigger,
  ZoomTrigger,
} from "./lib/TriggerDataManager.types";
import { GLOBAL_STYLES } from "./styles";

declare global {
  interface Window {
    ReactDOM: { render: (child: React.ComponentElement<object, App>, parent: HTMLElement) => void };
    store: Store;
    CMD_EDITOR_DEBUG: boolean;
    onAppReady: () => void;
    saveCommands: () => void;
    getAutoZoom?: (index: number) => number;
    createZoomer: (zoom: ZoomTrigger[], smoothing?: number) => typeof window.getAutoZoom;
    getCamBounds?: (index: number) => { w: number; h: number; x: number; y: number; px?: number; py?: number };
    createBoundsPanner: (pan: CameraPanTrigger[], smoothing?: number) => typeof window.getCamBounds;
    getCamFocus?: (index: number) => boolean[];
    createFocuser: (focus: CameraFocusTrigger[], smoothing?: number) => typeof window.getCamFocus;
    timeRemapper?: object;
    createTimeRemapper: (timeRemap: TimeRemapTrigger[], smoothing?: boolean) => typeof window.timeRemapper;
    setCustomRiders: (cssList: string[]) => void;
    setCustomGravity: (gravity: GravityTrigger[][]) => void;
    getLayerVisibleAtTime?: (id: number, ind: number) => boolean;
    createLayerAutomator: (
      layerTriggers: Record<number, LayerTrigger[]>,
      sixtyFps: boolean,
    ) => typeof window.getLayerVisibleAtTime;
  }

  type RootState = ReturnType<typeof window.store.getState>;
}

/**
 * Main function to run when the page is ready
 */
function main(): void {
  const { React, store } = window;
  const content = document.getElementById("content") as HTMLElement;
  const parent = document.createElement("div");

  Object.assign(parent.style, GLOBAL_STYLES.root);

  window.ReactDOM.render(React.createElement(App), parent);

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
      if (errorHeader && errorHeader.innerHTML === "An error occurred!") {
        console.warn("[index.main()] Crash detected...");
        window.saveCommands();
        clearInterval(timerId);
      }
    }
  }, 1000);
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
