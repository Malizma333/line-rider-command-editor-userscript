import { TriggerDataManager, TRIGGER_DATA_KEYS } from "../TriggerDataManager";
import { TRIGGER_ID, TriggerDataLookup } from "../TriggerDataManager.types";
import parseV0Command from "./read-json-v0-script";
import parseV1Command from "./read-json-v1.script";
import { isNumber } from "./type-guards";

/**
 * Parses file from the script file format into a trigger data object, reverting to the original
 * value if an error occurs
 * @param fileObject The json object needing to be validated
 * @param currentTriggerData The current trigger data in case data needs be reverted
 * @returns The validated trigger data
 */
export default function readJsonScript(
    fileObject: JSONObject,
    currentTriggerData: TriggerDataLookup,
): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;

  let version = 0;

  if (isNumber(fileObject.version)) {
    if (fileObject.version === 0) {
      version = 0;
    } else if (fileObject.version === 1) {
      version = 1;
    } else {
      console.error(`[ScriptParser.parseScript()] Invalid file version!`);
      return currentTriggerData;
    }
  } else if (fileObject.version === undefined) {
    version = 0;
  } else {
    console.error(`[ScriptParser.parseScript()] Invalid file version!`);
    return currentTriggerData;
  }

  TRIGGER_DATA_KEYS.forEach((commandId) => {
    try {
      triggerData[commandId].triggers = [];
      if (version === 0) {
        parseV0Command(commandId, fileObject, triggerData);
      } else if (version === 1) {
        parseV1Command(commandId, fileObject, triggerData); // TODO
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[ScriptParser.parseScript()] ${error.message}`);
        switch (commandId) {
          case TRIGGER_ID.ZOOM:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
          case TRIGGER_ID.PAN:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
          case TRIGGER_ID.FOCUS:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
          case TRIGGER_ID.TIME:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
          case TRIGGER_ID.GRAVITY:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
          case TRIGGER_ID.LAYER:
            triggerData[commandId] = structuredClone(currentTriggerData[commandId]);
            break;
        }
      }
    }
  });

  return triggerData;
}
