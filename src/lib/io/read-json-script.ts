import { TriggerDataManager, TRIGGER_METADATA } from "../TriggerDataManager";
import {
  TRIGGER_ID, TriggerDataLookup, TimedTrigger, GravityTrigger, SkinCssTrigger,
} from "../TriggerDataManager.types";
import { CONSTRAINT } from "../constraints";
import { retrieveTimestamp } from "../util";

/**
 * Parses file from the script file format into a trigger data object, reverting to the original
 * value if an error occurs
 * @param fileObject The json object needing to be validated
 * @param currentTriggerData The current trigger data in case data needs be reverted
 * @returns The validated trigger data
 */
export function readJsonScript(
    fileObject: JSONObject,
    currentTriggerData: TriggerDataLookup,
): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;

  let version = 0;

  if (typeof fileObject.version === "number") {
    if (fileObject.version === 0) {
      version = 0;
    } else if (fileObject.version === 1) {
      version = 1;
    } else {
      console.warn(`[ScriptParser.parseScript()] Invalid file version!`);
      return currentTriggerData;
    }
  } else if (fileObject.version === undefined) {
    version = 0;
  } else {
    console.warn(`[ScriptParser.parseScript()] Invalid file version!`);
    return currentTriggerData;
  }

  Object.keys(TRIGGER_METADATA).forEach((commandId: string) => {
    try {
      triggerData[commandId as TRIGGER_ID].triggers = [];
      if (version === 0) {
        parseV0Command(commandId as TRIGGER_ID, fileObject, triggerData);
      } else if (version === 1) {
        parseV0Command(commandId as TRIGGER_ID, fileObject, triggerData); // TODO
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[ScriptParser.parseScript()] ${error.message}`);
        triggerData[commandId as TRIGGER_ID] = structuredClone(
            currentTriggerData[commandId as TRIGGER_ID],
        );
      }
    }
  });

  return triggerData;
}

/**
 * Parses an individual command given its id and applies the parsed file data to the trigger data
 * @param commandId The type of command being parsed
 * @param fileObject The object that needs parsing
 * @param triggerData The trigger data object to write script data to
 */
function parseV0Command(commandId: TRIGGER_ID, fileObject: JSONObject, triggerData: TriggerDataLookup) {
  if (fileObject[commandId] === undefined || fileObject[commandId] === null) {
    throw new Error(`Command ${commandId} not found!`);
  }

  if (typeof fileObject[commandId] !== "object") {
    throw new Error(`Invalid format for ${commandId}!`);
  }

  if (Array.isArray(fileObject[commandId])) {
    throw new Error(`Invalid format for ${commandId}!`);
  }

  switch (commandId) {
    case TRIGGER_ID.ZOOM:
    case TRIGGER_ID.PAN:
    case TRIGGER_ID.FOCUS:
      parseTriggers(commandId, fileObject[commandId]["triggers"]);
      parseSmoothing(commandId, fileObject[commandId]["smoothing"]);
      break;
    case TRIGGER_ID.TIME:
    case TRIGGER_ID.LAYER:
      parseTriggers(commandId, fileObject[commandId]["triggers"]);
      parseSmoothing(commandId, fileObject[commandId]["interpolate"]);
      break;
    case TRIGGER_ID.SKIN:
      parseSkinTriggers(fileObject[commandId]["triggers"]);
      break;
    case TRIGGER_ID.GRAVITY:
      parseTriggers(commandId, fileObject[commandId]["triggers"]);
      break;
    default:
      break;
  }

  /**
   * Parses a potential new Trigger[], not necessarily a complete definition of one
   * @param commandId The trigger type being parsed
   * @param triggerArray The list of triggers being parsed
   */
  function parseTriggers(commandId: TRIGGER_ID, triggerArray: JSONValue): void {
    if (!Array.isArray(triggerArray)) {
      throw new Error(`Invalid triggerArray format for ${commandId}!`);
    }

    const triggers: TimedTrigger[] = [];

    for (const timedTrigger of triggerArray) {
      if (!isTimedTrigger(timedTrigger)) {
        throw new Error(`Invalid trigger format for ${commandId}!`);
      }

      const timeTrigger: TimedTrigger = structuredClone(timedTrigger);
      const timeProp = timedTrigger[0] as number | number[];

      if (typeof timeProp === "number") {
        const index = timeProp;
        timeTrigger[0] = retrieveTimestamp(index);
      } else if (timeProp.length === 1) {
        const index = timeProp[0];
        timeTrigger[0] = retrieveTimestamp(index);
      } else if (timeProp.length === 2) {
        const index = timeProp[0] * 40 + timeProp[1];
        timeTrigger[0] = retrieveTimestamp(index);
      } else {
        const index = timeProp[0] * 2400 +
         timeProp[1] * 40 + timeProp[2];
        timeTrigger[0] = retrieveTimestamp(index);
      }

      if (commandId === TRIGGER_ID.GRAVITY && (timeTrigger[1] as GravityTrigger[1]).length === undefined) {
        timeTrigger[1] = [timeTrigger[1] as GravityTrigger[1][0]];
      }

      triggers.push(timeTrigger);
    }

    triggerData[commandId].triggers = triggers;
  }

  /**
   * Parses integer or boolean smoothing for a command if its available
   * @param commandId The trigger type being parsed
   * @param smoothingValue The proposed value for smoothing
   */
  function parseSmoothing(commandId: TRIGGER_ID, smoothingValue: JSONValue): void {
    if (commandId === TRIGGER_ID.TIME || commandId === TRIGGER_ID.LAYER) {
      const constraints = CONSTRAINT.INTERPOLATE;

      if (smoothingValue === null || smoothingValue === undefined) {
        triggerData[commandId].interpolate = constraints.DEFAULT;
        return;
      }

      if (smoothingValue === true || smoothingValue === false) {
        triggerData[commandId].interpolate = smoothingValue;
      } else {
        throw new Error("Invalid boolean!");
      }
    } else {
      const constraints = CONSTRAINT.SMOOTH;

      if (smoothingValue === null || smoothingValue === undefined) {
        triggerData[commandId].smoothing = constraints.DEFAULT;
        return;
      }

      if (typeof smoothingValue !== "number") {
        throw new Error("Invalid integer!");
      }

      if (smoothingValue > constraints.MAX) {
        triggerData[commandId].smoothing = constraints.MAX;
      } else if (smoothingValue < constraints.MIN) {
        triggerData[commandId].smoothing = constraints.MIN;
      } else {
        triggerData[commandId].smoothing = smoothingValue;
      }
    }
  }

  /**
   * Parses a string of CSS into a skin trigger array
   * @param skinMapArray The css array that needs parsing
   */
  function parseSkinTriggers(skinMapArray: JSONValue): void {
    if (!Array.isArray(skinMapArray)) {
      throw new Error(`Invalid skinMapArray format!`);
    }

    const triggers = [] as SkinCssTrigger[];

    for (const skinMap of skinMapArray) {
      if (!(skinMap && typeof skinMap === "object") || Array.isArray(skinMap)) {
        throw new Error(`Invalid skinMapArray format!`);
      }

      const defaultSkinMap = structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
      for (const key of Object.keys(defaultSkinMap)) {
        if (skinMap[key] === null || skinMap[key] === undefined) continue;

        if (!(typeof skinMap[key] === "object") || Array.isArray(skinMap[key])) {
          throw new Error(`Invalid skinMapArray format!`);
        }

        if (typeof skinMap[key].fill === "string") {
          defaultSkinMap[key].fill = skinMap[key].fill;
        }

        if (typeof skinMap[key].stroke === "string") {
          defaultSkinMap[key].stroke = skinMap[key].stroke;
        }
      }
      triggers.push(defaultSkinMap);
    }

    triggerData[TRIGGER_ID.SKIN].triggers = triggers;
  }

  /**
   * A typegaurd for the TimeTrigger type
   * @param trigger Trigger to check type of
   * @returns Whether trigger is a proper TimedTrigger
   */
  function isTimedTrigger(trigger: JSONValue): trigger is TimedTrigger {
    return !!(
      trigger &&
      Array.isArray(trigger) &&
      trigger.length === 2 &&
      Array.isArray(trigger[0]) &&
      trigger[0].length === 3 &&
      typeof trigger[0][0] === "number" &&
      typeof trigger[0][1] === "number" &&
      typeof trigger[0][2] === "number" && (
        typeof trigger[1] === "number" ||
        typeof trigger[1] === "object" && trigger[1]
      )
    );
  }
}
