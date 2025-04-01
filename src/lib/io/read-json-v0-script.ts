import { CONSTRAINT } from "../constraints";
import { TRIGGER_METADATA } from "../TriggerDataManager";
import {
  CameraFocusTrigger,
  CameraPanTrigger,
  GravityTrigger,
  LayerTrigger,
  SkinCssTrigger,
  TimeRemapTrigger,
  TRIGGER_ID,
  TriggerDataLookup,
  TriggerTime,
  ZoomTrigger,
} from "../TriggerDataManager.types";
import { retrieveTimestamp } from "../util";
import { assert, ASSERT_TYPE, check } from "./type-guards";

/**
 * Parses an individual command given its id and applies the parsed file data to the trigger data
 * @param commandId The type of command being parsed
 * @param fileObject The object that needs parsing
 * @param triggerData The trigger data object to write script data to
 */
export default function parseV0Command(commandId: TRIGGER_ID, fileObject: unknown, triggerData: TriggerDataLookup) {
  assert(fileObject, ASSERT_TYPE.RECORD);

  const command = fileObject[commandId];

  assert(command, ASSERT_TYPE.RECORD);
  assert(command["triggers"], ASSERT_TYPE.ARR);

  switch (commandId) {
    case TRIGGER_ID.ZOOM:
      triggerData[commandId].triggers = parseZoomTriggers(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.PAN:
      triggerData[commandId].triggers = parsePanTriggers(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.FOCUS:
      triggerData[commandId].triggers = parseFocusTriggers(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.TIME:
      triggerData[commandId].triggers = parseTimeTriggers(command["triggers"]);
      triggerData[commandId].interpolate = parseBooleanSmoothing(command["interpolate"]);
      break;
    case TRIGGER_ID.SKIN:
      triggerData[commandId].triggers = parseSkinTriggers(command["triggers"]);
      break;
    case TRIGGER_ID.GRAVITY:
      triggerData[commandId].triggers = parseGravityTriggers(command["triggers"]);
      break;
    case TRIGGER_ID.LAYER:
      triggerData[commandId].triggers = parseLayerTriggers(command["triggers"]);
      triggerData[commandId].interpolate = parseBooleanSmoothing(command["interpolate"]);
      break;
    default:
      break;
  }
}

/**
 * Parses an unknown array into a list of zoom triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseZoomTriggers(triggerArray: unknown[]): ZoomTrigger[] {
  const triggers: ZoomTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const zoomProp = trigger[1];

    assert(zoomProp, ASSERT_TYPE.NUM);

    const newTrigger: ZoomTrigger = [parseTime(trigger[0]), zoomProp] as ZoomTrigger;

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of camera pan triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parsePanTriggers(triggerArray: unknown[]): CameraPanTrigger[] {
  const triggers: CameraPanTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const panProp = trigger[1];

    assert(panProp, ASSERT_TYPE.STR_RECORD);

    const { x, y, w, h } = panProp;

    assert(x, ASSERT_TYPE.NUM);
    assert(y, ASSERT_TYPE.NUM);
    assert(w, ASSERT_TYPE.NUM);
    assert(h, ASSERT_TYPE.NUM);

    const newTrigger: CameraPanTrigger = [parseTime(trigger[0]), { x, y, w, h }];

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of camera focus triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseFocusTriggers(triggerArray: unknown[]): CameraFocusTrigger[] {
  const triggers: CameraFocusTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const focusProp = trigger[1];

    assert(focusProp, ASSERT_TYPE.NUM_ARR);

    const newTrigger: CameraFocusTrigger = [parseTime(trigger[0]), focusProp];

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of time remap triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseTimeTriggers(triggerArray: unknown[]): TimeRemapTrigger[] {
  const triggers: TimeRemapTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const timeRemapProp = trigger[1];

    assert(timeRemapProp, ASSERT_TYPE.NUM);

    const newTrigger: TimeRemapTrigger = [parseTime(trigger[0]), timeRemapProp] as TimeRemapTrigger;

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses integer smoothing
 * @param smoothingValue The proposed value for smoothing
 * @returns A valid smoothing value
 */
function parseNumberSmoothing(smoothingValue: unknown): number {
  const constraints = CONSTRAINT.SMOOTH;

  if (smoothingValue === null || smoothingValue === undefined) {
    return constraints.DEFAULT;
  }

  assert(smoothingValue, ASSERT_TYPE.NUM);

  if (smoothingValue > constraints.MAX) {
    return constraints.MAX;
  } else if (smoothingValue < constraints.MIN) {
    return constraints.MIN;
  } else {
    return smoothingValue;
  }
}

/**
 * Parses boolean smoothing
 * @param smoothingValue The proposed value for smoothing
 * @returns A valid smoothing value
 */
function parseBooleanSmoothing(smoothingValue: unknown): boolean {
  const constraints = CONSTRAINT.INTERPOLATE;

  if (smoothingValue === null || smoothingValue === undefined) {
    return constraints.DEFAULT;
  }

  if (!(smoothingValue === true || smoothingValue === false)) {
    throw new Error("Invalid boolean smoothing value!");
  }

  return smoothingValue;
}

/**
 * Parses a string of CSS into a skin trigger array
 * @param skinMapArray The css array that needs parsing
 * @returns The parsed list of triggers
 */
function parseSkinTriggers(skinMapArray: unknown[]): SkinCssTrigger[] {
  const triggers: SkinCssTrigger[] = [];

  for (const skinMap of skinMapArray) {
    assert(skinMap, ASSERT_TYPE.STR_RECORD);

    const defaultSkinMap = structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
    for (const key of Object.keys(defaultSkinMap)) {
      assert(skinMap[key], ASSERT_TYPE.STR_RECORD);

      if (check(skinMap[key].fill, ASSERT_TYPE.STR)) {
        defaultSkinMap[key].fill = skinMap[key].fill;
      }

      if (check(skinMap[key].stroke, ASSERT_TYPE.STR)) {
        defaultSkinMap[key].stroke = skinMap[key].stroke;
      }
    }
    triggers.push(defaultSkinMap);
  }

  return triggers;
}

/**
 * Converts a legacy array of gravity triggers to the v1 format
 * @param arr Array of old triggers to convert
 * @returns New array of valid triggers
 */
function parseGravityTriggers(arr: unknown[]): GravityTrigger[][] {
  const triggers: GravityTrigger[][] = [];

  for (const trigger of arr) {
    assert(trigger, ASSERT_TYPE.ARR);
    assert(trigger[0], ASSERT_TYPE.NUM_ARR);

    if (trigger[0].length < 3) {
      throw new Error("Trigger time did not have valid length!");
    }

    const triggerTime: TriggerTime = [trigger[0][0], trigger[0][1], trigger[0][2]];

    assert(trigger[1], ASSERT_TYPE.ARR);

    for (let i = 0; i < trigger[1].length; i++) {
      const record: unknown = trigger[1][i];

      assert(record, ASSERT_TYPE.STR_RECORD);
      assert(record["x"], ASSERT_TYPE.NUM);
      assert(record["y"], ASSERT_TYPE.NUM);

      while (triggers.length <= i) {
        triggers.push([]);
      }

      triggers[i].push([triggerTime, { x: record["x"], y: record["y"] }]);
    }
  }

  return triggers;
}

/**
 * Converts a legacy array of layer triggers to the v1 format
 * @param arr Array of old triggers to convert
 * @returns New record of valid triggers
 */
function parseLayerTriggers(arr: unknown[]): Record<number, LayerTrigger[]> {
  const triggers: Record<number, LayerTrigger[]> = {};

  for (const trigger of arr) {
    assert(trigger, ASSERT_TYPE.ARR);
    assert(trigger[0], ASSERT_TYPE.NUM_ARR);

    if (trigger[0].length < 3) {
      throw new Error("Trigger time did not have valid length!");
    }

    const triggerTime: TriggerTime = [trigger[0][0], trigger[0][1], trigger[0][2]];
    const record: unknown = trigger[1];

    assert(record, ASSERT_TYPE.STR_RECORD);
    assert(record["id"], ASSERT_TYPE.NUM);
    assert(record["on"], ASSERT_TYPE.NUM);
    assert(record["off"], ASSERT_TYPE.NUM);
    assert(record["offset"], ASSERT_TYPE.NUM);

    if (!(record["id"] in triggers)) {
      triggers[record["id"]] = [];
    }

    triggers[record["id"]].push([triggerTime, { on: record["on"], off: record["off"], offset: record["offset"] }]);
  }

  return triggers;
}

/**
 * Parses a timestamp
 * @param timestamp Time stamp to parse
 * @returns Valid timestamp converted to trigger time
 */
function parseTime(timestamp: unknown): TriggerTime {
  let parsedTimestamp: TriggerTime = [0, 0, 0];

  if (check(timestamp, ASSERT_TYPE.NUM)) {
    const index = timestamp;
    parsedTimestamp = retrieveTimestamp(index);
  } else {
    assert(timestamp, ASSERT_TYPE.NUM_ARR);

    if (timestamp.length === 1) {
      const index = timestamp[0];
      parsedTimestamp = retrieveTimestamp(index);
    } else if (timestamp.length === 2) {
      const index = timestamp[0] * 40 + timestamp[1];
      parsedTimestamp = retrieveTimestamp(index);
    } else {
      const index = timestamp[0] * 2400 + timestamp[1] * 40 + timestamp[2];
      parsedTimestamp = retrieveTimestamp(index);
    }
  }
  return parsedTimestamp;
}
