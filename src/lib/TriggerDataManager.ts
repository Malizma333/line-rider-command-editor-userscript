import { CONSTRAINT } from "./constraints";
import {
  TRIGGER_ID, TriggerDataLookup, TriggerMetadataLookup, HistoryItem, PathValue,
  LayerTrigger,
  ZoomTrigger,
  TimeRemapTrigger,
} from "./TriggerDataManager.types";

export const TRIGGER_METADATA: TriggerMetadataLookup = {
  [TRIGGER_ID.ZOOM]: {
    DISPLAY_NAME: "Zoom",
    FUNC: "getAutoZoom=createZoomer({0},{1});",
    TEMPLATE: [[0, 0, 0], 1] as ZoomTrigger,
  },
  [TRIGGER_ID.PAN]: {
    DISPLAY_NAME: "Pan",
    FUNC: "getCamBounds=createBoundsPanner({0},{1});",
    TEMPLATE: [[0, 0, 0], { w: 0.4, h: 0.4, x: 0, y: 0 }],
  },
  [TRIGGER_ID.FOCUS]: {
    DISPLAY_NAME: "Focus",
    FUNC: "getCamFocus=createFocuser({0},{1});",
    TEMPLATE: [[0, 0, 0], [1]],
  },
  [TRIGGER_ID.TIME]: {
    DISPLAY_NAME: "Speed",
    FUNC: "timeRemapper=createTimeRemapper({0},{1});",
    TEMPLATE: [[0, 0, 0], 1] as TimeRemapTrigger,
  },
  [TRIGGER_ID.SKIN]: {
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
      id_scarf5: { fill: "#3995FD" },
    },
  },
  [TRIGGER_ID.GRAVITY]: {
    DISPLAY_NAME: "Gravity",
    TEMPLATE: [[0, 0, 0], { x: 0, y: 0.175 }],
  },
  [TRIGGER_ID.LAYER]: {
    DISPLAY_NAME: "Layer",
    TEMPLATE: [[0, 0, 0], { on: 1, off: 0, offset: 0 }],
  },
};

const INIT_TRIGGER_DATA: TriggerDataLookup = {
  [TRIGGER_ID.ZOOM]: {
    id: TRIGGER_ID.ZOOM,
    triggers: [TRIGGER_METADATA[TRIGGER_ID.ZOOM].TEMPLATE],
    smoothing: CONSTRAINT.SMOOTH.DEFAULT,
  },
  [TRIGGER_ID.PAN]: {
    id: TRIGGER_ID.PAN,
    triggers: [TRIGGER_METADATA[TRIGGER_ID.PAN].TEMPLATE],
    smoothing: CONSTRAINT.SMOOTH.DEFAULT,
  },
  [TRIGGER_ID.FOCUS]: {
    id: TRIGGER_ID.FOCUS,
    triggers: [TRIGGER_METADATA[TRIGGER_ID.FOCUS].TEMPLATE],
    smoothing: CONSTRAINT.SMOOTH.DEFAULT,
  },
  [TRIGGER_ID.TIME]: {
    id: TRIGGER_ID.TIME,
    triggers: [TRIGGER_METADATA[TRIGGER_ID.TIME].TEMPLATE],
    interpolate: CONSTRAINT.INTERPOLATE.DEFAULT,
  },
  [TRIGGER_ID.SKIN]: {
    id: TRIGGER_ID.SKIN,
    triggers: [TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE],
  },
  [TRIGGER_ID.GRAVITY]: {
    id: TRIGGER_ID.GRAVITY,
    triggers: [[TRIGGER_METADATA[TRIGGER_ID.GRAVITY].TEMPLATE]],
  },
  [TRIGGER_ID.LAYER]: {
    id: TRIGGER_ID.LAYER,
    triggers: { 0: [TRIGGER_METADATA[TRIGGER_ID.LAYER].TEMPLATE] },
    interpolate: CONSTRAINT.INTERPOLATE.DEFAULT,
  },
};

export const TRIGGER_DATA_KEYS = [
  TRIGGER_ID.ZOOM,
  TRIGGER_ID.PAN,
  TRIGGER_ID.FOCUS,
  TRIGGER_ID.TIME,
  TRIGGER_ID.SKIN,
  TRIGGER_ID.GRAVITY,
  TRIGGER_ID.LAYER,
];

export class TriggerDataManager {
  private triggerData: TriggerDataLookup;
  private undoStack: HistoryItem[];
  private redoStack: HistoryItem[];

  constructor() {
    this.triggerData = TriggerDataManager.initialTriggerData;
    this.undoStack = [];
    this.redoStack = [];
  }

  static get initialTriggerData(): TriggerDataLookup {
    return structuredClone(INIT_TRIGGER_DATA);
  }

  get data() {
    return this.triggerData;
  }

  get undoLen(): number {
    return this.undoStack.length;
  }

  get redoLen(): number {
    return this.redoStack.length;
  }

  /**
   * Resizes the focuser trigger weight arrays to match the number of riders
   * Also resizes the skin array to match the number of riders
   * @param riderCount New number of riders in the track
   */
  updateRiderCount(riderCount: number): void {
    const focusTriggers = this.triggerData[TRIGGER_ID.FOCUS].triggers;

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

    const gravityTriggers = this.triggerData[TRIGGER_ID.GRAVITY].triggers;
    const oldGravityLength = gravityTriggers.length;

    if (oldGravityLength < riderCount) {
      gravityTriggers.push(...Array(riderCount - oldGravityLength).fill(null)
          .map(() => [structuredClone(TRIGGER_METADATA[TRIGGER_ID.GRAVITY].TEMPLATE)]));
    }

    if (oldGravityLength > riderCount) {
      gravityTriggers.splice(riderCount, oldGravityLength - riderCount);
    }

    this.triggerData[TRIGGER_ID.GRAVITY].triggers = gravityTriggers;

    const skinTriggers = this.triggerData[TRIGGER_ID.SKIN].triggers;
    const oldSkinLength = skinTriggers.length;

    if (oldSkinLength < riderCount) {
      skinTriggers.push(...Array(riderCount - oldSkinLength).fill(null)
          .map(() => structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE)));
    }

    if (oldSkinLength > riderCount) {
      skinTriggers.splice(riderCount, oldSkinLength - riderCount);
    }

    this.triggerData[TRIGGER_ID.SKIN].triggers = skinTriggers;
  }

  /**
   * Creates a new layer trigger for any new layer ids
   * Also removes any triggers that don't exist in the id map
   * @param layerMap Indices mapping to layer ids
   */
  updateLayerMap(layerMap: number[]): void {
    const layerTriggers = this.triggerData[TRIGGER_ID.LAYER].triggers;

    const existing = new Set(layerMap);
    const filteredIds = Object.keys(layerTriggers).map((id) => parseInt(id)).filter((id) => existing.has(id));
    const visited = new Set(filteredIds);
    const filteredTriggers: Record<number, LayerTrigger[]> = {};

    for (const id of filteredIds) {
      filteredTriggers[id] = layerTriggers[id];
    }

    for (const id of layerMap) {
      if (!visited.has(id)) {
        filteredTriggers[id] = [structuredClone(TRIGGER_METADATA[TRIGGER_ID.LAYER].TEMPLATE)];
      }
    }

    this.triggerData[TRIGGER_ID.LAYER].triggers = filteredTriggers;
  }

  updateFromPath(path: string[], newValue: PathValue, location: TRIGGER_ID): void {
    const HISTORY_LIMIT = 30;
    this.redoStack = [];
    const oldValue = this.setAtPointer(path, newValue);
    this.undoStack.push({ modificationPath: path, oldValue: oldValue, activeTab: location });
    if (this.undoStack.length > HISTORY_LIMIT) {
      this.undoStack.shift();
    }
  }

  undo(): TRIGGER_ID | null {
    const previous = this.undoStack.pop();

    if (previous === undefined) {
      return null;
    }

    const { modificationPath, oldValue, activeTab } = previous;
    const newValue = this.setAtPointer(modificationPath, oldValue);
    this.redoStack.push({ modificationPath, oldValue: newValue, activeTab });

    return activeTab;
  }

  redo(): TRIGGER_ID | null {
    const next = this.redoStack.pop();

    if (next === undefined) {
      return null;
    }

    const { modificationPath, oldValue, activeTab } = next;
    const newValue = this.setAtPointer(modificationPath, oldValue);
    this.undoStack.push({ modificationPath, oldValue: newValue, activeTab });

    return activeTab;
  }

  /**
   * Updates value at a given path and returns the old value
   * @param path Path to value that needs updating
   * @param value Value to update with
   * @returns The value before the update
   */
  private setAtPointer(path: string[], value: PathValue): PathValue {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pathPointer: any = this.triggerData;

    for (let i = 0; i < path.length - 1; i += 1) {
      pathPointer = pathPointer[path[i]];
    }

    const oldValue = pathPointer[path[path.length - 1]];
    pathPointer[path[path.length - 1]] = value;
    return oldValue;
  }
}
