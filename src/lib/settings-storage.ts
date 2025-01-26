import { SETTINGS_KEY } from "./settings-storage.types";

const LOCAL_STORAGE_PREFIX = "CMD_EDITOR_MOD_";

export const SETTINGS = {
  [SETTINGS_KEY.VIEWPORT]: {
    HD: { ID: "HD", NAME: "720p", SIZE: [1280, 720] },
    FHD: { ID: "FHD", NAME: "1080p", SIZE: [1920, 1080] },
    QHD: { ID: "QHD", NAME: "1440p", SIZE: [2560, 1440] },
    UHD: { ID: "UHD", NAME: "4K", SIZE: [3840, 2160] }
  },
  [SETTINGS_KEY.FONT_SIZE]: {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2
  }
} as const;

const DEFAULTS = {
  [SETTINGS_KEY.FONT_SIZE]: SETTINGS.FONT_SIZE.MEDIUM,
  [SETTINGS_KEY.VIEWPORT]: SETTINGS.VIEWPORT.HD.ID
} as const;

export function getSetting (key: SETTINGS_KEY): string {
  return window.localStorage.getItem(LOCAL_STORAGE_PREFIX + key) ?? String(DEFAULTS[key]);
}

export function saveSetting (key: SETTINGS_KEY, value: string): void {
  window.localStorage.setItem(LOCAL_STORAGE_PREFIX + key, value);
}
