/* eslint-disable @typescript-eslint/no-unused-vars */

const ROOT_NODE_ID = 'COMMAND_EDITOR_ROOT_NODE'
const HELP_LINK = 'https://github.com/Malizma333/line-rider-command-editor-userscript#readme'
const REPORT_LINK = 'https://github.com/Malizma333/line-rider-command-editor-userscript/issues/new'
const FPS = 40

type VIEWPORT_OPTION = keyof typeof SETTINGS.VIEWPORT

const SETTINGS = {
  VIEWPORT: {
    HD: { ID: 'HD', NAME: '720p', SIZE: [1280, 720] },
    FHD: { ID: 'FHD', NAME: '1080p', SIZE: [1920, 1080] },
    QHD: { ID: 'QHD', NAME: '1440p', SIZE: [2560, 1440] },
    UHD: { ID: 'UHD', NAME: '4K', SIZE: [3840, 2160] }
  },
  FONT_SIZES: {
    SMALL: 0,
    MEDIUM: 1,
    LARGE: 2
  }
} as const

enum TRIGGER_TYPES {
  ZOOM = 'ZOOM',
  PAN = 'CAMERA_PAN',
  FOCUS = 'CAMERA_FOCUS',
  TIME = 'TIME_REMAP',
  SKIN = 'CUSTOM_SKIN'
}

interface TriggerMetadata {
  DISPLAY_NAME: string
  TEMPLATE: any
  FUNC: string
  STYLE_MAP?: any
}

const TRIGGER_PROPS = {
  [TRIGGER_TYPES.ZOOM]: {
    DISPLAY_NAME: 'Zoom',
    TEMPLATE: [[0, 0, 0], 1],
    FUNC: 'getAutoZoom = createZoomer({0},{1});'
  },
  [TRIGGER_TYPES.PAN]: {
    DISPLAY_NAME: 'Pan',
    TEMPLATE: [[0, 0, 0], {
      w: 0.4, h: 0.4, x: 0, y: 0
    }],
    FUNC: 'getCamBounds = createBoundsPanner({0},{1});'
  },
  [TRIGGER_TYPES.FOCUS]: {
    DISPLAY_NAME: 'Focus',
    TEMPLATE: [[0, 0, 0], [1]],
    FUNC: 'getCamFocus = createFocuser({0},{1});'
  },
  [TRIGGER_TYPES.TIME]: {
    DISPLAY_NAME: 'Speed',
    TEMPLATE: [[0, 0, 0], 1],
    FUNC: 'timeRemapper = createTimeRemapper({0},{1});'
  },
  [TRIGGER_TYPES.SKIN]: {
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
      id_scarf5: { fill: '#3995FD' }
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
      id_scarf5: '#scarf5'
    }
  }
}

interface SKIN_MAP_STRUCT {
  outline: { stroke: string }
  flag: { fill: string }
  skin: { fill: string }
  hair: { fill: string }
  fill: { fill: string }
  eye: { fill: string }
  sled: { fill: string }
  string: { stroke: string }
  armSleeve: { fill: string }
  armHand: { fill: string }
  legPants: { fill: string }
  legFoot: { fill: string }
  torso: { fill: string }
  hatTop: { fill: string }
  hatBottom: { stroke: string }
  hatBall: { fill: string }
  scarf1: { fill: string }
  scarf2: { fill: string }
  scarf3: { fill: string }
  scarf4: { fill: string }
  scarf5: { fill: string }
  id_scarf0: { fill: string }
  id_scarf1: { fill: string }
  id_scarf2: { fill: string }
  id_scarf3: { fill: string }
  id_scarf4: { fill: string }
  id_scarf5: { fill: string }
}
