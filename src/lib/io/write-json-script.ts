// Line Rider Command Editor - A UI wrapper for linerider.com console commands
// Copyright (C) 2023-2025 Tobias Bessler
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
    [TRIGGER_ID.ZOOM]: {
      smoothing: currentTriggerData[TRIGGER_ID.ZOOM].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.ZOOM].triggers
        .map((trigger) => [
          retrieveIndex(trigger[0]),
          trigger[1],
        ]),
    },
    [TRIGGER_ID.PAN]: {
      smoothing: currentTriggerData[TRIGGER_ID.PAN].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.PAN].triggers
        .map((trigger) => [
          retrieveIndex(trigger[0]),
          trigger[1].w,
          trigger[1].h,
          trigger[1].x,
          trigger[1].y,
          trigger[1].px,
          trigger[1].py,
        ]),
    },
    [TRIGGER_ID.FOCUS]: {
      smoothing: currentTriggerData[TRIGGER_ID.FOCUS].smoothing,
      triggers: currentTriggerData[TRIGGER_ID.FOCUS].triggers
        .map((trigger) => [
          retrieveIndex(trigger[0]),
          trigger[1].map((weight) => weight),
        ]),
    },
    [TRIGGER_ID.TIME]: {
      interpolate: currentTriggerData[TRIGGER_ID.TIME].interpolate,
      triggers: currentTriggerData[TRIGGER_ID.TIME].triggers
        .map((trigger) => [
          retrieveIndex(trigger[0]),
          trigger[1],
        ]),
    },
    [TRIGGER_ID.SKIN]: {
      triggers: currentTriggerData[TRIGGER_ID.SKIN].triggers
        .map((trigger) =>
          Object.fromEntries(
            Object.entries(trigger).map(([key, value]) => [key, { fill: value.fill, stroke: value.stroke }]),
          )
        ),
    },
    [TRIGGER_ID.GRAVITY]: {
      triggers: currentTriggerData[TRIGGER_ID.GRAVITY].triggers
        .map((riderTriggers) => (
          riderTriggers.map((trigger) => [
            retrieveIndex(trigger[0]),
            trigger[1].x,
            trigger[1].y,
          ])
        )),
    },
    [TRIGGER_ID.LAYER]: {
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
