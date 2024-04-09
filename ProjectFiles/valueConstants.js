// eslint-disable-next-line no-unused-vars
class CONSTANTS {
  static get VIEWPORT_DIMENSIONS() {
    return {
      WIDTH: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      HEIGHT: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    };
  }

  static get LINKS() {
    return {
      HELP: 'https://github.com/Malizma333/line-rider-command-editor-userscript#readme',
      REPORT: 'https://trello.com/invite/b/HQI4mr1y/ATTI88d27c72cf8ffcd70c6e2b424e4ffb548519EDDF/line-rider-command-editor',
    };
  }

  static get SCROLL_DELTA() {
    return 0.001;
  }

  static get TIMELINE() {
    return {
      FPS: 40,
      SPM: 60,
    };
  }

  static get VIEWPORTS() {
    return {
      HD: '720p',
      FHD: '1080p',
      QHD: '1440p',
      UHD: '4K',
    };
  }

  static get FONT_SIZES() {
    return {
      SMALL: 0,
      MEDIUM: 1,
      LARGE: 2,
    };
  }

  static get TYPES() {
    return {
      BOOL: 'BOOLEAN',
      INT: 'INTEGER',
      FLOAT: 'FLOAT',
    };
  }

  static get TRIGGERS() {
    return {
      ZOOM: 'ZOOM',
      PAN: 'CAMERA_PAN',
      FOCUS: 'CAMERA_FOCUS',
      TIME: 'TIME_REMAP',
      SKIN: 'CUSTOM_SKIN',
    };
  }

  static get CONSTRAINTS() {
    return {
      INTERPOLATE: {
        DEFAULT: true, TYPE: CONSTANTS.TYPES.BOOL,
      },
      SMOOTH: {
        DEFAULT: 20, MIN: 0, MAX: 40, TYPE: CONSTANTS.TYPES.INT,
      },
      FRAME: {
        DEFAULT: 0, MIN: 0, MAX: 39, TYPE: CONSTANTS.TYPES.INT,
      },
      SECOND: {
        DEFAULT: 0, MIN: 0, MAX: 59, TYPE: CONSTANTS.TYPES.INT,
      },
      MINUTE: {
        DEFAULT: 0, MIN: 0, MAX: 99, TYPE: CONSTANTS.TYPES.INT,
      },
      ZOOM: {
        DEFAULT: 1, MIN: -50, MAX: 50, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      PAN_X: {
        DEFAULT: 0, MIN: -100, MAX: 100, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      PAN_Y: {
        DEFAULT: 0, MIN: -100, MAX: 100, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      PAN_WIDTH: {
        DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      PAN_HEIGHT: {
        DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      FOCUS_WEIGHT: {
        DEFAULT: 0, MIN: 0, MAX: 1, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      TIME_SPEED: {
        DEFAULT: 1, MIN: 0.01, MAX: 10, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      SKIN_ZOOM: {
        DEFAULT: 1, MIN: 1, MAX: 4, TYPE: CONSTANTS.TYPES.FLOAT,
      },
      ALPHA_SLIDER: {
        DEFAULT: 1, MIN: 0, MAX: 1, TYPE: CONSTANTS.TYPES.FLOAT,
      },
    };
  }

  static get TRIGGER_PROPS() {
    return {
      [CONSTANTS.TRIGGERS.ZOOM]: {
        DISPLAY_NAME: 'Zoom',
        TEMPLATE: [[0, 0, 0], 1],
        FUNC: 'getAutoZoom=createZoomer({0},{1});',
      },
      [CONSTANTS.TRIGGERS.PAN]: {
        DISPLAY_NAME: 'Pan',
        TEMPLATE: [[0, 0, 0], {
          w: 0.4, h: 0.4, x: 0, y: 0,
        }],
        FUNC: 'getCamBounds=createBoundsPanner({0},{1});',
      },
      [CONSTANTS.TRIGGERS.FOCUS]: {
        DISPLAY_NAME: 'Focus',
        TEMPLATE: [[0, 0, 0], [1]],
        FUNC: 'getCamFocus=createFocuser({0},{1});',
      },
      [CONSTANTS.TRIGGERS.TIME]: {
        DISPLAY_NAME: 'Speed',
        TEMPLATE: [[0, 0, 0], 1],
        FUNC: 'timeRemapper=createTimeRemapper({0},{1});',
      },
      [CONSTANTS.TRIGGERS.SKIN]: {
        DISPLAY_NAME: 'Skin',
        TEMPLATE: {
          outline: { stroke: 'black' },
          flag: { fill: '#00000066' },
          skin: { fill: 'white' },
          hair: { fill: 'black' },
          fill: { fill: 'black' },
          eye: { fill: 'black' },
          sled: { fill: 'white' },
          string: { stroke: 'black' },
          armSleeve: { fill: 'black' },
          armHand: { fill: 'white' },
          legPants: { fill: 'black' },
          legFoot: { fill: 'white' },
          torso: { fill: 'white' },
          hatTop: { fill: 'white' },
          hatBottom: { stroke: 'black' },
          hatBall: { fill: 'black' },
          scarf1: { fill: '#FD4F38' },
          scarf2: { fill: 'white' },
          scarf3: { fill: '#06A725' },
          scarf4: { fill: 'white' },
          scarf5: { fill: '#3995FD' },
          id_scarf0: { fill: 'white' },
          id_scarf1: { fill: '#FD4F38' },
          id_scarf2: { fill: 'white' },
          id_scarf3: { fill: '#06A725' },
          id_scarf4: { fill: 'white' },
          id_scarf5: { fill: '#3995FD' },
        },
        FUNC: 'setCustomRiders({0});',
      },
    };
  }

  static get INIT_SETTINGS() {
    return {
      fontSize: CONSTANTS.FONT_SIZES.MEDIUM,
      resolution: CONSTANTS.VIEWPORTS.FHD,
    };
  }
}
