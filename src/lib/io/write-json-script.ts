import {
  CameraFocusTrigger,
  CameraPanTrigger,
  GravityTrigger,
  SkinCssTrigger,
  TRIGGER_ID,
  TriggerDataLookup,
  ZoomTrigger,
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
      smoothing: currentTriggerData[TRIGGER_ID.ZOOM].smoothing as JSONValue,
      triggers: (currentTriggerData[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    pan: {
      smoothing: currentTriggerData[TRIGGER_ID.PAN].smoothing as JSONValue,
      triggers: (currentTriggerData[TRIGGER_ID.PAN].triggers as CameraPanTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    focus: {
      smoothing: currentTriggerData[TRIGGER_ID.FOCUS].smoothing as JSONValue,
      triggers: (currentTriggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    time: {
      interpolate: currentTriggerData[TRIGGER_ID.TIME].interpolate as JSONValue,
      triggers: (currentTriggerData[TRIGGER_ID.TIME].triggers as CameraFocusTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    gravity: {
      triggers: (currentTriggerData[TRIGGER_ID.GRAVITY].triggers as GravityTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    layer: {
      triggers: (currentTriggerData[TRIGGER_ID.LAYER].triggers as GravityTrigger[])
          .map((trigger) => [retrieveIndex(trigger[0]), trigger[1]] as JSONArray),
    },
    skin: {
      triggers: (currentTriggerData[TRIGGER_ID.SKIN].triggers as SkinCssTrigger[])
          .map((trigger) => trigger),
    },
  } as JSONObject;
}
