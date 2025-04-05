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
export default function parseV1Command(
    commandId: TRIGGER_ID,
    fileObject: Record<string, unknown>,
    triggerData: TriggerDataLookup,
) {
  const command = fileObject[commandId];

  assert(command, ASSERT_TYPE.RECORD);

  if (commandId === TRIGGER_ID.LAYER) {
    assert(command["triggers"], ASSERT_TYPE.RECORD);
    triggerData[commandId].triggers = parseLayerTriggers(command["triggers"]);
    triggerData[commandId].interpolate = parseBooleanSmoothing(command["interpolate"]);
    return;
  }

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
    assert(trigger, ASSERT_TYPE.NUM_ARR);

    const newTrigger: ZoomTrigger = [retrieveTimestamp(trigger[0]), trigger[1]] as ZoomTrigger;

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
    assert(trigger, ASSERT_TYPE.NUM_ARR);

    const [time, w, h, x, y] = trigger;

    const newTrigger: CameraPanTrigger = [retrieveTimestamp(time), { x, y, w, h }];

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

    const [time, focusProp] = trigger;

    assert(time, ASSERT_TYPE.NUM);
    assert(focusProp, ASSERT_TYPE.NUM_ARR);

    const newTrigger: CameraFocusTrigger = [retrieveTimestamp(time), focusProp];

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
    assert(trigger, ASSERT_TYPE.NUM_ARR);

    const newTrigger: TimeRemapTrigger = [retrieveTimestamp(trigger[0]), trigger[1]] as TimeRemapTrigger;

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
  if (smoothingValue === null || smoothingValue === undefined) {
    return 20;
  }

  assert(smoothingValue, ASSERT_TYPE.NUM);

  return Math.max(0, smoothingValue);
}

/**
 * Parses boolean smoothing
 * @param smoothingValue The proposed value for smoothing
 * @returns A valid smoothing value
 */
function parseBooleanSmoothing(smoothingValue: unknown): boolean {
  if (smoothingValue === null || smoothingValue === undefined) {
    return false;
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
    assert(skinMap, ASSERT_TYPE.RECORD);

    const defaultSkinMap = structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
    for (const key of Object.keys(defaultSkinMap)) {
      assert(skinMap[key], ASSERT_TYPE.RECORD);

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
  const overallNewTriggers: GravityTrigger[][] = [];

  for (const riderTriggers of arr) {
    assert(riderTriggers, ASSERT_TYPE.ARR);
    const newRiderTriggers: GravityTrigger[] = [];
    for (const trigger of riderTriggers) {
      assert(trigger, ASSERT_TYPE.NUM_ARR);

      const newTrigger: GravityTrigger = [
        retrieveTimestamp(trigger[0]),
        { x: trigger[1], y: trigger[2] },
      ];

      newRiderTriggers.push(newTrigger);
    }
    overallNewTriggers.push(newRiderTriggers);
  }

  return overallNewTriggers;
}

/**
 * Converts a legacy array of layer triggers to the v1 format
 * @param layerMap Array of old triggers to convert
 * @returns New record of valid triggers
 */
function parseLayerTriggers(layerMap: Record<string, unknown>): Record<number, LayerTrigger[]> {
  const overallNewTriggers: Record<number, LayerTrigger[]> = {};

  for (const id of Object.keys(layerMap)) {
    const currentLayerId = parseInt(id);
    overallNewTriggers[currentLayerId] = [];

    const layerTriggers = layerMap[id];
    assert(layerTriggers, ASSERT_TYPE.ARR);

    for (const trigger of layerTriggers) {
      assert(trigger, ASSERT_TYPE.NUM_ARR);

      overallNewTriggers[currentLayerId].push([
        retrieveTimestamp(trigger[0]),
        { on: trigger[1], off: trigger[2], offset: trigger[3] },
      ]);
    }
  }

  return overallNewTriggers;
}
