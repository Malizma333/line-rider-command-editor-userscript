/* eslint-disable @typescript-eslint/no-unused-vars */

enum TRIGGER_ID {
  ZOOM = 'ZOOM',
  PAN = 'CAMERA_PAN',
  FOCUS = 'CAMERA_FOCUS',
  TIME = 'TIME_REMAP',
  SKIN = 'CUSTOM_SKIN'
}

type TriggerTime = [number, number, number]

type ZoomTrigger = [TriggerTime, number]
type CameraPanTrigger = [TriggerTime, { w: number, h: number, x: number, y: number }]
type CameraFocusTrigger = [TriggerTime, number[]]
type TimeRemapTrigger = [TriggerTime, number]
interface SkinCssTrigger { [property: string]: { stroke?: string, fill?: string } }

type TimedTrigger = ZoomTrigger | CameraPanTrigger | CameraFocusTrigger | TimeRemapTrigger
type Trigger = ZoomTrigger | CameraPanTrigger | CameraFocusTrigger | TimeRemapTrigger | SkinCssTrigger

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
  TEMPLATE: [[0, 0, 0], { w: 0.4, h: 0.4, x: 0, y: 0 }]
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

class TriggerDataManager {
  triggerData: TriggerData

  constructor () {
    this.triggerData = TriggerDataManager.initialTriggerData
  }

  static get initialTriggerData (): TriggerData {
    return {
      [TRIGGER_ID.ZOOM]: {
        id: TRIGGER_ID.ZOOM,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.ZOOM].TEMPLATE)],
        smoothing: CONSTRAINTS.SMOOTH.DEFAULT
      },
      [TRIGGER_ID.PAN]: {
        id: TRIGGER_ID.PAN,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.PAN].TEMPLATE)],
        smoothing: CONSTRAINTS.SMOOTH.DEFAULT
      },
      [TRIGGER_ID.FOCUS]: {
        id: TRIGGER_ID.FOCUS,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.FOCUS].TEMPLATE)],
        smoothing: CONSTRAINTS.SMOOTH.DEFAULT
      },
      [TRIGGER_ID.TIME]: {
        id: TRIGGER_ID.TIME,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.TIME].TEMPLATE)],
        interpolate: CONSTRAINTS.INTERPOLATE.DEFAULT
      },
      [TRIGGER_ID.SKIN]: {
        id: TRIGGER_ID.SKIN,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE)]
      }
    }
  }

  createTrigger (id: TRIGGER_ID, index: number, currentTime: TriggerTime): void {
    const newTrigger = structuredClone(this.triggerData[id].triggers[index]) as TimedTrigger
    newTrigger[0] = currentTime
    this.triggerData[id].triggers.splice(index + 1, 0, newTrigger)
  }

  /**
   * Resizes the focuser trigger weight arrays to match the number of riders
   * Also resizes the skin array to match the number of riders
   */
  updateRiderCount (riderCount: number): void {
    const focusTriggers = this.triggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[]

    for (let i = 0; i < focusTriggers.length; i++) {
      const oldLength = focusTriggers[i][1].length

      if (oldLength < riderCount) {
        focusTriggers[i][1].push(...Array(riderCount - oldLength).fill(0))
      }
      if (oldLength > riderCount) {
        focusTriggers[i][1].splice(riderCount, oldLength - riderCount)
      }
    }

    this.triggerData[TRIGGER_ID.FOCUS].triggers = focusTriggers

    const skinTriggers = this.triggerData[TRIGGER_ID.SKIN].triggers
    const oldLength = skinTriggers.length

    if (oldLength < riderCount) {
      skinTriggers.push(...Array(riderCount - oldLength).fill(structuredClone(
        TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
      )))
    }

    if (oldLength > riderCount) {
      skinTriggers.splice(riderCount, oldLength - riderCount)
    }

    this.triggerData[TRIGGER_ID.SKIN].triggers = skinTriggers
  }

  deleteTrigger (id: TRIGGER_ID, index: number): void {
    this.triggerData[id].triggers.splice(index, 1)
  }

  resetSkinTrigger (index: number): void {
    this.triggerData[TRIGGER_ID.SKIN].triggers[index] = structuredClone(
      TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
    )
  }

  updateZoomViewport (factor: number): void {
    const zoomTriggers = this.triggerData[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[]

    for (let i = 0; i < zoomTriggers.length; i++) {
      zoomTriggers[i][1] = Math.round((
        zoomTriggers[i][1] + factor + Number.EPSILON
      ) * 10e6) / 10e6
    }

    this.triggerData[TRIGGER_ID.ZOOM].triggers = zoomTriggers
  }

  replaceTriggers (newTriggers: TriggerData): void {
    this.triggerData = newTriggers
  }

  updateFromPath (path: any[], newValue: any): void {
    let pathPointer: any = this.triggerData

    for (let i = 0; i < path.length - 1; i += 1) {
      pathPointer = pathPointer[path[i]]
    }

    pathPointer[path[path.length - 1]] = newValue
  }
}
