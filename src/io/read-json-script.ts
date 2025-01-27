import { TriggerDataManager, TRIGGER_METADATA } from "../lib/TriggerDataManager";
import { TRIGGER_ID, TriggerDataLookup, TriggerTime, TimedTrigger, GravityTrigger, SkinCssTrigger } from "../lib/TriggerDataManager.types";
import { CONSTRAINTS } from "../lib/validation";

/**
 * Parses file from the script file format into a trigger data object, reverting to the original
 * value if an error occurs
 */
export default function readJsonScript(fileObject: TriggerDataLookup, currentTriggerData: TriggerDataLookup): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;

  /**
   * Parses an individual command given its id and applies the parsed file data to the trigger data
   */
  function parseCommand (commandId: TRIGGER_ID, fileObject: TriggerDataLookup): void {
    if (fileObject[commandId] === undefined) {
      throw new Error(`Command ${commandId} not found!`);
    }

    switch (commandId) {
      case TRIGGER_ID.ZOOM:
      case TRIGGER_ID.PAN:
      case TRIGGER_ID.FOCUS:
        parseTriggers(commandId, fileObject[commandId]["triggers"] as TimedTrigger[]);
        parseSmoothing(commandId, fileObject[commandId]["smoothing"]);
        break;
      case TRIGGER_ID.TIME:
        parseTriggers(commandId, fileObject[commandId]["triggers"] as TimedTrigger[]);
        parseSmoothing(commandId, fileObject[commandId]["interpolate"]);
        break;
      case TRIGGER_ID.SKIN:
        parseSkinTriggers(fileObject[commandId]["triggers"] as SkinCssTrigger[]);
        break;
      case TRIGGER_ID.GRAVITY:
        parseTriggers(commandId, fileObject[commandId]["triggers"] as TimedTrigger[]);
        break;
      default:
        break;
    }
  }

  /**
   * Parses a potential new Trigger[], not necessarily a complete definition of one
   */
  function parseTriggers (commandId: TRIGGER_ID, triggerArray: TimedTrigger[]): void {
    const triggers: TimedTrigger[] = [];

    for (const timedTrigger of triggerArray) {
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
   */
  function parseSmoothing (commandId: TRIGGER_ID, smoothingValue?: boolean | number): void {
    if (commandId === TRIGGER_ID.TIME) {
      const constraints = CONSTRAINTS.INTERPOLATE;

      if (smoothingValue == null) {
        triggerData[commandId].interpolate = constraints.DEFAULT;
        return;
      }

      if (smoothingValue === true || smoothingValue === false) {
        triggerData[commandId].interpolate = smoothingValue;
      } else {
        throw new Error("Invalid boolean!");
      }
    } else {
      const constraints = CONSTRAINTS.SMOOTH;

      if (smoothingValue == null) {
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
   */
  function parseSkinTriggers (skinMapArray: SkinCssTrigger[]): void {
    const triggers = [] as SkinCssTrigger[];

    for (const skinMap of skinMapArray) {
      const defaultSkinMap = structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
      for (const key of Object.keys(defaultSkinMap)) {
        if (skinMap[key] === undefined) continue;
        
        if (skinMap[key].fill !== undefined) {
          defaultSkinMap[key].fill = skinMap[key].fill;
        }

        if (skinMap[key].stroke !== undefined) {
          defaultSkinMap[key].stroke = skinMap[key].stroke;
        }
      }
      triggers.push(defaultSkinMap);
    }

    triggerData[TRIGGER_ID.SKIN].triggers = triggers;
  }

  /**
   * Converts a player index to a trigger timestamp
   */
  function retrieveTimestamp (index: number): TriggerTime {
    const frames = index % 40;
    const seconds = Math.floor(index / 40) % 60;
    const minutes = Math.floor(index / 2400);
    return [minutes, seconds, frames];
  }

  Object.keys(TRIGGER_METADATA).forEach((commandId: string) => {
    try {
      triggerData[commandId as TRIGGER_ID].triggers = [];
      parseCommand(commandId as TRIGGER_ID, fileObject);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[ScriptParser.parseScript()] ${error.message}`);
        triggerData[commandId as TRIGGER_ID] = structuredClone(
          currentTriggerData[commandId as TRIGGER_ID]
        );
      }
    }
  });

  return triggerData;
}
