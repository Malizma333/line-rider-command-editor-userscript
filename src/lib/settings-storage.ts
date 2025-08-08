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

import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from "./settings-storage.types";

const LOCAL_STORAGE_PREFIX = "CMD_EDITOR_MOD_";

const DEFAULTS = {
  [SETTINGS_KEY.FONT_SIZE]: FONT_SIZE_SETTING.MEDIUM,
  [SETTINGS_KEY.VIEWPORT]: VIEWPORT_SETTING.HD,
} as const;

export const TEXT_SIZES = {
  [FONT_SIZE_SETTING.SMALL]: "12px",
  [FONT_SIZE_SETTING.MEDIUM]: "14px",
  [FONT_SIZE_SETTING.LARGE]: "16px",
} as const;

/**
 * Gets the localstorage setting based on a key value
 * @param key The key of the setting to retrieve
 * @returns The value that the setting is set to
 */
export function getSetting(key: SETTINGS_KEY): number {
  const item = window.localStorage.getItem(LOCAL_STORAGE_PREFIX + key);

  if (!item) {
    return DEFAULTS[key];
  }

  const parsed = parseInt(item, 10);

  if (isNaN(parsed)) {
    return DEFAULTS[key];
  }

  return parsed;
}

/**
 * Sets the value of a localstorage setting based on its key and a new value
 * @param key The key of the setting to set
 * @param value The new value to assign to the setting
 */
export function saveSetting(key: SETTINGS_KEY, value: number): void {
  window.localStorage.setItem(LOCAL_STORAGE_PREFIX + key, String(value));
}
