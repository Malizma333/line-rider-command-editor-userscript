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

import type { AnyAction } from "redux";

/**
 * Returns a dispatch object to set the dimensions of the playback camera
 * @param dimension Viewport dimensions to assign to the camera
 * @param dimension.width Width of the viewport in pixels
 * @param dimension.height Height of the viewport in pixels
 * @returns Action object to dispatch to the redux store
 */
export function setPlaybackDimensions(dimension: { width: number; height: number }): AnyAction {
  return {
    type: "SET_PLAYBACK_DIMENSIONS",
    payload: dimension,
  };
}

/**
 * Returns a dispatch object to close the sidebar
 * @returns Action object to dispatch to the redux store
 */
export function closeSidebar(): AnyAction {
  return {
    type: "SET_VIEWS",
    payload: { Sidebar: null },
    meta: { name: "SET_SIDEBAR_PAGE", auto: false },
  };
}
