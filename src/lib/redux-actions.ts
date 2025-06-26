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
