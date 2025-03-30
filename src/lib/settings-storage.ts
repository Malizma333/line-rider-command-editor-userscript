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
