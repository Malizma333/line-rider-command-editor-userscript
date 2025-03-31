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
import { isArray, isNumber, isNumberArray, isRecord, isString, isStringRecord } from "./type-guards";

/**
 * Parses an individual command given its id and applies the parsed file data to the trigger data
 * @param commandId The type of command being parsed
 * @param fileObject The object that needs parsing
 * @param triggerData The trigger data object to write script data to
 */
export default function parseV1Command(commandId: TRIGGER_ID, fileObject: JSONObject, triggerData: TriggerDataLookup) {
  if (fileObject === null) {
    throw new Error("File object was null");
  }

  const command = fileObject[commandId];
  if (!isRecord(command)) {
    throw new Error("Command was not valid object");
  }

  if (!isArray(command["triggers"])) {
    throw new Error("Triggers was not valid trigger array!");
  }

  switch (commandId) {
    case TRIGGER_ID.ZOOM:
      triggerData[commandId].triggers = parseTriggers<ZoomTrigger>(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.PAN:
      triggerData[commandId].triggers = parseTriggers<CameraPanTrigger>(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.FOCUS:
      triggerData[commandId].triggers = parseTriggers<CameraFocusTrigger>(command["triggers"]);
      triggerData[commandId].smoothing = parseNumberSmoothing(command["smoothing"]);
      break;
    case TRIGGER_ID.TIME:
      triggerData[commandId].triggers = parseTriggers<TimeRemapTrigger>(command["triggers"]);
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

  /**
   * Parses a potential new Trigger[], not necessarily a complete definition of one
   * @param triggerArray The list of triggers being parsed
   * @returns The parsed list of triggers
   */
  function parseTriggers<TriggerType>(triggerArray: JSONArray): TriggerType[] {
    const triggers: TriggerType[] = [];

    for (const trigger of triggerArray) {
      if (!isArray(trigger)) {
        throw new Error("Timed trigger was not an array");
      }

      const newTrigger: JSONArray = structuredClone(trigger);
      const timeProp = trigger[0];

      if (typeof timeProp === "number") {
        const index = timeProp;
        newTrigger[0] = retrieveTimestamp(index);
        continue;
      }

      if (!isNumberArray(timeProp)) {
        throw new Error("Keyframe was not a number array or number!");
      }

      if (timeProp.length === 1) {
        const index = timeProp[0];
        newTrigger[0] = retrieveTimestamp(index);
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * 40 + timeProp[1];
        newTrigger[0] = retrieveTimestamp(index);
      } else {
        const index = timeProp[0] * 2400 + timeProp[1] * 40 + timeProp[2];
        newTrigger[0] = retrieveTimestamp(index);
      }

      triggers.push(newTrigger as TriggerType); // TODO: Unsafe
    }

    return triggers;
  }

  /**
   * Parses integer smoothing
   * @param smoothingValue The proposed value for smoothing
   * @returns A valid smoothing value
   */
  function parseNumberSmoothing(smoothingValue: JSONValue): number {
    const constraints = CONSTRAINT.SMOOTH;

    if (smoothingValue === null || smoothingValue === undefined) {
      return constraints.DEFAULT;
    }

    if (!isNumber(smoothingValue)) {
      throw new Error("Smoothing was not a number");
    }

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
  function parseBooleanSmoothing(smoothingValue: JSONValue): boolean {
    const constraints = CONSTRAINT.INTERPOLATE;

    if (smoothingValue === null || smoothingValue === undefined) {
      return constraints.DEFAULT;
    }

    if (!(smoothingValue === true || smoothingValue === false)) {
      throw new Error("Invalid boolean smooothing value!");
    }

    return smoothingValue;
  }

  /**
   * Parses a string of CSS into a skin trigger array
   * @param skinMapArray The css array that needs parsing
   * @returns The parsed list of triggers
   */
  function parseSkinTriggers(skinMapArray: JSONArray): SkinCssTrigger[] {
    const triggers: SkinCssTrigger[] = [];

    for (const skinMap of skinMapArray) {
      if (!isStringRecord(skinMap)) {
        throw new Error("Skin map was not string record");
      }

      const defaultSkinMap = structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
      for (const key of Object.keys(defaultSkinMap)) {
        if (!isStringRecord(skinMap[key])) {
          throw new Error("Skin map object was not string record");
        }

        if (isString(skinMap[key].fill)) {
          defaultSkinMap[key].fill = skinMap[key].fill;
        }

        if (isString(skinMap[key].stroke)) {
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
  function parseGravityTriggers(arr: JSONArray): GravityTrigger[][] {
    const triggers: GravityTrigger[][] = [];

    for (const trigger of arr) {
      if (!isArray(trigger)) {
        throw new Error("Trigger was not valid array!");
      }

      if (!isNumberArray(trigger[0])) {
        throw new Error("Trigger time was not valid array!");
      }

      if (trigger[0].length < 3) {
        throw new Error("Trigger time did not have valid length!");
      }

      const triggerTime: TriggerTime = [trigger[0][0], trigger[0][1], trigger[0][2]];

      if (!isArray(trigger[1])) {
        throw new Error("Trigger contents was not valid array!");
      }

      for (let i = 0; i < trigger[1].length; i++) {
        const record = trigger[1][i];

        if (!isStringRecord(record)) {
          throw new Error("Gravity was not valid record!");
        }

        if (!isNumber(record["x"])) {
          throw new Error("Gravity did not have valid x prop!");
        }

        if (!isNumber(record["y"])) {
          throw new Error("Gravity did not have valid y prop!");
        }

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
  function parseLayerTriggers(arr: JSONArray): Record<number, LayerTrigger[]> {
    const triggers: Record<number, LayerTrigger[]> = {};

    for (const trigger of arr) {
      if (!isArray(trigger)) {
        throw new Error("Trigger was not valid array!");
      }

      if (!isNumberArray(trigger[0])) {
        throw new Error("Trigger time was not valid array!");
      }

      if (trigger[0].length < 3) {
        throw new Error("Trigger time did not have valid length!");
      }

      const triggerTime: TriggerTime = [trigger[0][0], trigger[0][1], trigger[0][2]];
      const record = trigger[1];

      if (!isStringRecord(record)) {
        throw new Error("Trigger contents was not valid record!");
      }

      if (!isNumber(record["id"])) {
        throw new Error("Layer did not have valid id prop!");
      }

      if (!isNumber(record["on"])) {
        throw new Error("Layer did not have valid on prop!");
      }

      if (!isNumber(record["off"])) {
        throw new Error("Layer did not have valid off prop!");
      }

      if (!isNumber(record["offset"])) {
        throw new Error("Layer did not have valid offset prop!");
      }

      if (!(record["id"] in triggers)) {
        triggers[record["id"]] = [];
      }

      triggers[record["id"]].push([triggerTime, { on: record["on"], off: record["off"], offset: record["offset"] }]);
    }

    return triggers;
  }
}
