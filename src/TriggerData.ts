import { CONSTRAINTS } from "./Validation";

export type Primitive = any

export enum TRIGGER_ID {
  ZOOM = "ZOOM",
  PAN = "CAMERA_PAN",
  FOCUS = "CAMERA_FOCUS",
  TIME = "TIME_REMAP",
  SKIN = "CUSTOM_SKIN",
  GRAVITY = "GRAVITY"
}

export type TriggerTime = [number, number, number]

export type ZoomTrigger = [TriggerTime, number]
export type CameraPanTrigger = [TriggerTime, { w: number, h: number, x: number, y: number }]
export type CameraFocusTrigger = [TriggerTime, number[]]
export type TimeRemapTrigger = [TriggerTime, number]
export type SkinCssTrigger = Record<string, { stroke?: string, fill?: string }>;
export type GravityTrigger = [TriggerTime, [{ x: number, y: number }]]

export type TimedTrigger = ZoomTrigger | CameraPanTrigger | CameraFocusTrigger | TimeRemapTrigger | GravityTrigger
export type Trigger = TimedTrigger | SkinCssTrigger

interface TriggerMetadata<Type> {
  readonly DISPLAY_NAME: string
  readonly FUNC?: string
  TEMPLATE: Type
}

const ZoomMetadata: TriggerMetadata<ZoomTrigger> = {
  DISPLAY_NAME: "Zoom",
  FUNC: "getAutoZoom=createZoomer({0},{1});",
  TEMPLATE: [[0, 0, 0], 1]
};

const CameraPanMetadata: TriggerMetadata<CameraPanTrigger> = {
  DISPLAY_NAME: "Pan",
  FUNC: "getCamBounds=createBoundsPanner({0},{1});",
  TEMPLATE: [[0, 0, 0], { w: 0.4, h: 0.4, x: 0, y: 0 }]
};

const CameraFocusMetadata: TriggerMetadata<CameraFocusTrigger> = {
  DISPLAY_NAME: "Focus",
  FUNC: "getCamFocus=createFocuser({0},{1});",
  TEMPLATE: [[0, 0, 0], [1]]
};

const TimeRemapMetadata: TriggerMetadata<TimeRemapTrigger> = {
  DISPLAY_NAME: "Speed",
  FUNC: "timeRemapper=createTimeRemapper({0},{1});",
  TEMPLATE: [[0, 0, 0], 1]
};

const SkinCssMetadata: TriggerMetadata<SkinCssTrigger> = {
  DISPLAY_NAME: "Skin",
  FUNC: "setCustomRiders({0});",
  TEMPLATE: {
    outline: { stroke: "black" },
    flag: { fill: "#00000066" },
    skin: { fill: "white" },
    hair: { fill: "black" },
    fill: { fill: "black" },
    eye: { fill: "black" },
    sled: { fill: "white" },
    string: { stroke: "black" },
    armSleeve: { fill: "black" },
    armHand: { fill: "white" },
    legPants: { fill: "black" },
    legFoot: { fill: "white" },
    torso: { fill: "white" },
    hatTop: { fill: "white" },
    hatBottom: { stroke: "black" },
    hatBall: { fill: "black" },
    scarf1: { fill: "#FD4F38" },
    scarf2: { fill: "white" },
    scarf3: { fill: "#06A725" },
    scarf4: { fill: "white" },
    scarf5: { fill: "#3995FD" },
    id_scarf0: { fill: "white" },
    id_scarf1: { fill: "#FD4F38" },
    id_scarf2: { fill: "white" },
    id_scarf3: { fill: "#06A725" },
    id_scarf4: { fill: "white" },
    id_scarf5: { fill: "#3995FD" }
  }
};

const GravityMetadata: TriggerMetadata<GravityTrigger> = {
  DISPLAY_NAME: "Gravity",
  TEMPLATE: [[0, 0, 0], [{ x: 0, y: 0.175 }]]
};

export const TRIGGER_PROPS = {
  [TRIGGER_ID.ZOOM]: ZoomMetadata,
  [TRIGGER_ID.PAN]: CameraPanMetadata,
  [TRIGGER_ID.FOCUS]: CameraFocusMetadata,
  [TRIGGER_ID.TIME]: TimeRemapMetadata,
  [TRIGGER_ID.SKIN]: SkinCssMetadata,
  [TRIGGER_ID.GRAVITY]: GravityMetadata
};

interface TriggerDataItem {
  id: string
  triggers: Trigger[]
  smoothing?: number
  interpolate?: boolean
}

export interface TriggerData {
  [TRIGGER_ID.ZOOM]: TriggerDataItem
  [TRIGGER_ID.PAN]: TriggerDataItem
  [TRIGGER_ID.FOCUS]: TriggerDataItem
  [TRIGGER_ID.TIME]: TriggerDataItem
  [TRIGGER_ID.SKIN]: TriggerDataItem
  [TRIGGER_ID.GRAVITY]: TriggerDataItem
}

type HistoryItem = [(string | number)[], Primitive, TRIGGER_ID]

export class TriggerDataManager {
  private triggerData: TriggerData;
  private undoStack: HistoryItem[];
  private redoStack: HistoryItem[];

  constructor () {
    this.triggerData = TriggerDataManager.initialTriggerData;
    this.undoStack = [];
    this.redoStack = [];
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
      },
      [TRIGGER_ID.GRAVITY]: {
        id: TRIGGER_ID.GRAVITY,
        triggers: [structuredClone(TRIGGER_PROPS[TRIGGER_ID.GRAVITY].TEMPLATE)]
      }
    };
  }

  get data () {
    return this.triggerData;
  }

  get undoLen (): number {
    return this.undoStack.length;
  }

  get redoLen (): number {
    return this.redoStack.length;
  }

  /**
   * Resizes the focuser trigger weight arrays to match the number of riders
   * Also resizes the skin array to match the number of riders
   */
  updateRiderCount (riderCount: number): void {
    const focusTriggers = this.triggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[];

    for (const trigger of focusTriggers) {
      const oldLength = trigger[1].length;

      if (oldLength < riderCount) {
        trigger[1].push(...Array(riderCount - oldLength).fill(0));
      }
      if (oldLength > riderCount) {
        trigger[1].splice(riderCount, oldLength - riderCount);
      }
    }

    this.triggerData[TRIGGER_ID.FOCUS].triggers = focusTriggers;

    const gravityTriggers = this.triggerData[TRIGGER_ID.GRAVITY].triggers as GravityTrigger[];

    for (const trigger of gravityTriggers) {
      const oldLength = trigger[1].length;

      if (oldLength < riderCount) {
        trigger[1].push(...Array(riderCount - oldLength).fill(null).map(() => ({x: 0, y: 0.175})));
      }
      if (oldLength > riderCount) {
        trigger[1].splice(riderCount, oldLength - riderCount);
      }
    }

    this.triggerData[TRIGGER_ID.GRAVITY].triggers = gravityTriggers;

    const skinTriggers = this.triggerData[TRIGGER_ID.SKIN].triggers;
    const oldLength = skinTriggers.length;

    if (oldLength < riderCount) {
      skinTriggers.push(...Array(riderCount - oldLength).fill(null).map(() => structuredClone(
        TRIGGER_PROPS[TRIGGER_ID.SKIN].TEMPLATE
      )));
    }

    if (oldLength > riderCount) {
      skinTriggers.splice(riderCount, oldLength - riderCount);
    }

    this.triggerData[TRIGGER_ID.SKIN].triggers = skinTriggers;
  }

  updateFromPath (path: (string | number)[], newValue: Primitive, location: TRIGGER_ID): void {
    const HISTORY_LIMIT = 30;
    this.redoStack = [];
    const oldValue = this.setAtPointer(path, newValue);
    this.undoStack.push([path, oldValue, location]);
    if (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift();
    }
  }

  undo (): TRIGGER_ID | null {
    const previous = this.undoStack.pop();

    if (previous === undefined) {
      return null;
    }

    const [path, oldValue, location] = previous;
    const newValue = this.setAtPointer(path, oldValue);
    this.redoStack.push([path, newValue, location]);

    return location;
  }

  redo (): TRIGGER_ID | null {
    const next = this.redoStack.pop();

    if (next === undefined) {
      return null;
    }

    const [path, newValue, location] = next;
    const oldValue = this.setAtPointer(path, newValue);
    this.undoStack.push([path, oldValue, location]);

    return location;
  }

  /**
   * Updates value at a given path and returns the old value
   */
  private setAtPointer (path: (string | number)[], value: Primitive): Primitive {
    let pathPointer: Primitive = this.triggerData;

    for (let i = 0; i < path.length - 1; i += 1) {
      pathPointer = pathPointer[path[i]];
    }

    const oldValue = pathPointer[path[path.length - 1]];
    pathPointer[path[path.length - 1]] = value;
    return oldValue;
  }
}
