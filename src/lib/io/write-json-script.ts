import { TRIGGER_ID, TriggerDataLookup } from "../TriggerDataManager.types";
import { retrieveIndex } from "../util";

/**
 * Writes the current trigger lookup data to a json object file
 * @param currentTriggerData The current data to write
 * @returns Json object to write to a file
 */
export default function writeJsonScript(currentTriggerData: TriggerDataLookup): unknown {
  return {
    version: 1, // Increment whenever version changes and need to reparse format
    zoom: {
      smoothing: currentTriggerData[TRIGGER_ID.ZOOM].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.ZOOM].triggers
          .map((trigger) => [
            retrieveIndex(trigger[0]),
            trigger[1],
          ]),
    },
    pan: {
      smoothing: currentTriggerData[TRIGGER_ID.PAN].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.PAN].triggers
          .map((trigger) => [
            retrieveIndex(trigger[0]),
            trigger[1].w,
            trigger[1].h,
            trigger[1].x,
            trigger[1].y,
          ]),
    },
    focus: {
      smoothing: currentTriggerData[TRIGGER_ID.FOCUS].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.FOCUS].triggers
          .map((trigger) => [
            retrieveIndex(trigger[0]),
            trigger[1].map((weight) => weight),
          ]),
    },
    time: {
      interpolate: currentTriggerData[TRIGGER_ID.TIME].interpolate,
      triggers: currentTriggerData[TRIGGER_ID.TIME].triggers
          .map((trigger) => [
            retrieveIndex(trigger[0]),
            trigger[1],
          ]),
    },
    skin: {
      triggers: currentTriggerData[TRIGGER_ID.SKIN].triggers
          .map((trigger) => Object.fromEntries(
              Object.entries(trigger).map(([key, value]) => (
                [key, { fill: value.fill, stroke: value.stroke }]
              )),
          )),
    },
    gravity: {
      triggers: currentTriggerData[TRIGGER_ID.GRAVITY].triggers
          .map((riderTriggers) => (
            riderTriggers.map((trigger) => [
              retrieveIndex(trigger[0]),
              trigger[1].x,
              trigger[1].y,
            ])
          )),
    },
    layer: {
      interpolate: currentTriggerData[TRIGGER_ID.LAYER].interpolate,
      triggers: Object.fromEntries(
          Object.entries(currentTriggerData[TRIGGER_ID.LAYER].triggers)
              .map(([layerId, triggers]) => [
                layerId,
                triggers.map((trigger) => [
                  retrieveIndex(trigger[0]),
                  trigger[1].on,
                  trigger[1].off,
                  trigger[1].offset,
                ]),
              ]),
      ),
    },
  };
}
