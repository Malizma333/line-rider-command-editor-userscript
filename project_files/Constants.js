// eslint-disable-next-line no-unused-vars
class Constants {
  static get ROOT_NODE_ID() {
    return 'COMMAND_EDITOR_ROOT_NODE';
  }

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

  static get SETTINGS() {
    return {
      VIEWPORT: {
        HD: { ID: 'HD', NAME: '720p', SIZE: [1280, 720] },
        FHD: { ID: 'FHD', NAME: '1080p', SIZE: [1920, 1080] },
        QHD: { ID: 'QHD', NAME: '1440p', SIZE: [2560, 1440] },
        UHD: { ID: 'UHD', NAME: '4K', SIZE: [3840, 2160] },
      },
      FONT_SIZES: {
        SMALL: 0,
        MEDIUM: 1,
        LARGE: 2,
      },
    };
  }

  static get TYPES() {
    return {
      BOOL: 'BOOLEAN',
      INT: 'INTEGER',
      FLOAT: 'FLOAT',
    };
  }

  static get CONSTRAINTS() {
    return {
      INTERPOLATE: {
        DEFAULT: true, TYPE: Constants.TYPES.BOOL,
      },
      SMOOTH: {
        DEFAULT: 20, MIN: 0, MAX: 40, TYPE: Constants.TYPES.INT,
      },
      FRAME: {
        DEFAULT: 0, MIN: 0, MAX: 39, TYPE: Constants.TYPES.INT,
      },
      SECOND: {
        DEFAULT: 0, MIN: 0, MAX: 59, TYPE: Constants.TYPES.INT,
      },
      MINUTE: {
        DEFAULT: 0, MIN: 0, MAX: 99, TYPE: Constants.TYPES.INT,
      },
      ZOOM: {
        DEFAULT: 1, MIN: -50, MAX: 50, TYPE: Constants.TYPES.FLOAT,
      },
      PAN_X: {
        DEFAULT: 0, MIN: -100, MAX: 100, TYPE: Constants.TYPES.FLOAT,
      },
      PAN_Y: {
        DEFAULT: 0, MIN: -100, MAX: 100, TYPE: Constants.TYPES.FLOAT,
      },
      PAN_WIDTH: {
        DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: Constants.TYPES.FLOAT,
      },
      PAN_HEIGHT: {
        DEFAULT: 0.4, MIN: 0, MAX: 2, TYPE: Constants.TYPES.FLOAT,
      },
      FOCUS_WEIGHT: {
        DEFAULT: 0, MIN: 0, MAX: 1, TYPE: Constants.TYPES.FLOAT,
      },
      TIME_SPEED: {
        DEFAULT: 1, MIN: 0.01, MAX: 10, TYPE: Constants.TYPES.FLOAT,
      },
      SKIN_ZOOM: {
        DEFAULT: 1, MIN: 1, MAX: 4, TYPE: Constants.TYPES.FLOAT,
      },
      ALPHA_SLIDER: {
        DEFAULT: 1, MIN: 0, MAX: 1, TYPE: Constants.TYPES.FLOAT,
      },
    };
  }

  static get TRIGGER_TYPES() {
    return {
      ZOOM: 'ZOOM',
      PAN: 'CAMERA_PAN',
      FOCUS: 'CAMERA_FOCUS',
      TIME: 'TIME_REMAP',
      SKIN: 'CUSTOM_SKIN',
    };
  }

  static get TRIGGER_PROPS() {
    return {
      [Constants.TRIGGER_TYPES.ZOOM]: {
        DISPLAY_NAME: 'Zoom',
        TEMPLATE: [[0, 0, 0], 1],
        FUNC: 'getAutoZoom=createZoomer({0},{1});',
      },
      [Constants.TRIGGER_TYPES.PAN]: {
        DISPLAY_NAME: 'Pan',
        TEMPLATE: [[0, 0, 0], {
          w: 0.4, h: 0.4, x: 0, y: 0,
        }],
        FUNC: 'getCamBounds=createBoundsPanner({0},{1});',
      },
      [Constants.TRIGGER_TYPES.FOCUS]: {
        DISPLAY_NAME: 'Focus',
        TEMPLATE: [[0, 0, 0], [1]],
        FUNC: 'getCamFocus=createFocuser({0},{1});',
      },
      [Constants.TRIGGER_TYPES.TIME]: {
        DISPLAY_NAME: 'Speed',
        TEMPLATE: [[0, 0, 0], 1],
        FUNC: 'timeRemapper=createTimeRemapper({0},{1});',
      },
      [Constants.TRIGGER_TYPES.SKIN]: {
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
        STYLE_MAP: {
          outline: '.outline',
          flag: '.flag',
          skin: '.skin',
          hair: '.hair',
          fill: '.fill',
          eye: '#eye',
          sled: '.sled',
          string: '#string',
          armSleeve: '.arm.sleeve',
          armHand: '.arm.hand',
          legPants: '.leg.pants',
          legFoot: '.leg.foot',
          torso: '.torso',
          hatTop: '.hat.top',
          hatBottom: '.hat.bottom',
          hatBall: '.hat.ball',
          scarf1: '.scarf1',
          scarf2: '.scarf2',
          scarf3: '.scarf3',
          scarf4: '.scarf4',
          scarf5: '.scarf5',
          id_scarf0: '#scarf0',
          id_scarf1: '#scarf1',
          id_scarf2: '#scarf2',
          id_scarf3: '#scarf3',
          id_scarf4: '#scarf4',
          id_scarf5: '#scarf5',
        },
      },
    };
  }
}
