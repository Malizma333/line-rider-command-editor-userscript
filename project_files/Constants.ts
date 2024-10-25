/* eslint-disable @typescript-eslint/no-unused-vars */

const ROOT_NODE_ID = 'COMMAND_EDITOR_ROOT_NODE'
const HELP_LINK = 'https://github.com/Malizma333/line-rider-command-editor-userscript#readme'
const REPORT_LINK = 'https://github.com/Malizma333/line-rider-command-editor-userscript/issues/new'
const FPS = 40

enum TRIGGER_ID {
  ZOOM = 'ZOOM',
  PAN = 'CAMERA_PAN',
  FOCUS = 'CAMERA_FOCUS',
  TIME = 'TIME_REMAP',
  SKIN = 'CUSTOM_SKIN'
}

type TriggerTime = [number, number, number]

type ZoomTrigger = [TriggerTime, number]
type CameraPanTrigger = [TriggerTime, { width: number, height: number, x: number, y: number }]
type CameraFocusTrigger = [TriggerTime, number[]]
type TimeRemapTrigger = [TriggerTime, number]

interface strokePrimary { stroke: string, fill?: string }
interface fillPrimary { fill: string, stroke?: string }

interface SkinCssTrigger {
  outline: strokePrimary
  flag: fillPrimary
  skin: fillPrimary
  hair: fillPrimary
  fill: fillPrimary
  eye: fillPrimary
  sled: fillPrimary
  string: strokePrimary
  armSleeve: fillPrimary
  armHand: fillPrimary
  legPants: fillPrimary
  legFoot: fillPrimary
  torso: fillPrimary
  hatTop: fillPrimary
  hatBottom: strokePrimary
  hatBall: fillPrimary
  scarf1: fillPrimary
  scarf2: fillPrimary
  scarf3: fillPrimary
  scarf4: fillPrimary
  scarf5: fillPrimary
  id_scarf0: fillPrimary
  id_scarf1: fillPrimary
  id_scarf2: fillPrimary
  id_scarf3: fillPrimary
  id_scarf4: fillPrimary
  id_scarf5: fillPrimary
}

type SkinMap = PropMap<SkinCssTrigger>

interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string
  readonly FUNC: string
  TEMPLATE: Type
}

const ZoomMetadata: TriggerMetadata<ZoomTrigger> = {
  DISPLAY_NAME: 'Zoom',
  FUNC: 'getAutoZoom = createZoomer({0},{1});',
  TEMPLATE: [[0, 0, 0], 1]
}

const CameraPanMetadata: TriggerMetadata<CameraPanTrigger> = {
  DISPLAY_NAME: 'Pan',
  FUNC: 'getCamBounds = createBoundsPanner({0},{1});',
  TEMPLATE: [[0, 0, 0], {
    width: 0.4, height: 0.4, x: 0, y: 0
  }]
}

const CameraFocusMetadata: TriggerMetadata<CameraFocusTrigger> = {
  DISPLAY_NAME: 'Focus',
  FUNC: 'getCamFocus = createFocuser({0},{1});',
  TEMPLATE: [[0, 0, 0], [1]]
}

const TimeRemapMetadata: TriggerMetadata<TimeRemapTrigger> = {
  DISPLAY_NAME: 'Speed',
  FUNC: 'timeRemapper = createTimeRemapper({0},{1});',
  TEMPLATE: [[0, 0, 0], 1]
}

const SkinCssMetadata: TriggerMetadata<SkinCssTrigger> = {
  DISPLAY_NAME: 'Skin',
  FUNC: 'setCustomRiders({0});',
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
  }
}

const TRIGGER_PROPS = {
  [TRIGGER_ID.ZOOM]: ZoomMetadata,
  [TRIGGER_ID.PAN]: CameraPanMetadata,
  [TRIGGER_ID.FOCUS]: CameraFocusMetadata,
  [TRIGGER_ID.TIME]: TimeRemapMetadata,
  [TRIGGER_ID.SKIN]: SkinCssMetadata
}

type TimedTrigger = ZoomTrigger | CameraPanTrigger | CameraFocusTrigger | TimeRemapTrigger
type Trigger = TimedTrigger | SkinCssTrigger

interface TriggerDataItem {
  id: string
  triggers: Trigger[]
  smoothing?: number
  interpolate?: boolean
}

interface TriggerData {
  [TRIGGER_ID.ZOOM]: TriggerDataItem
  [TRIGGER_ID.PAN]: TriggerDataItem
  [TRIGGER_ID.FOCUS]: TriggerDataItem
  [TRIGGER_ID.TIME]: TriggerDataItem
  [TRIGGER_ID.SKIN]: TriggerDataItem
}
