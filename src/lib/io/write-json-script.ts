import {
  TRIGGER_ID,
  TriggerDataLookup,
} from "../TriggerDataManager.types";
import { retrieveIndex } from "../util";

/**
 * Writes the current trigger lookup data to a json object file
 * @param currentTriggerData The current data to write
 * @returns Json object to write to a file
 */
export default function writeJsonScript(currentTriggerData: TriggerDataLookup): JSONObject {
  return {
    version: 1, // Increment whenever version changes and need to reparse format
    zoom: {
      smoothing: currentTriggerData[TRIGGER_ID.ZOOM].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.ZOOM].triggers
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]]),
    },
    pan: {
      smoothing: currentTriggerData[TRIGGER_ID.PAN].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.PAN].triggers
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]]),
    },
    focus: {
      smoothing: currentTriggerData[TRIGGER_ID.FOCUS].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.FOCUS].triggers
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]]),
    },
    time: {
      interpolate: currentTriggerData[TRIGGER_ID.TIME].interpolate,
      triggers: currentTriggerData[TRIGGER_ID.TIME].triggers
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]]),
    },
    gravity: currentTriggerData[TRIGGER_ID.GRAVITY].triggers
        .map((triggerArray) => triggerArray
            .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]]),
        ),
    layer: Object.entries(currentTriggerData[TRIGGER_ID.LAYER].triggers)
        .map(([id, triggerArray]) => [id, triggerArray
            .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]])],
        ),
    skin: currentTriggerData[TRIGGER_ID.SKIN].triggers
        .map((trigger) => trigger),
  };
}
