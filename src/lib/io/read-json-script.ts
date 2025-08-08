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

import { TRIGGER_DATA_KEYS, TriggerDataManager } from "../TriggerDataManager";
import { TRIGGER_ID, TriggerDataLookup } from "../TriggerDataManager.types";
import parseV0Command from "./read-json-v0-script";
import parseV1Command from "./read-json-v1-script";
import { assert, ASSERT_TYPE } from "./type-guards";

/**
 * Parses file from the script file format into a trigger data object, reverting to the original
 * value if an error occurs
 * @param fileObject The json object needing to be validated
 * @param currentTriggerData The current trigger data in case data needs be reverted
 * @returns The validated trigger data
 */
export default function readJsonScript(
  fileObject: unknown,
  currentTriggerData: TriggerDataLookup,
): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;

  let version = -1;

  assert(fileObject, ASSERT_TYPE.RECORD);

  if (fileObject.version === undefined || fileObject.version === 0) {
    version = 0;
  } else if (fileObject.version === 1) {
    version = 1;
  } else {
    console.error(`[ScriptParser.parseScript()] Invalid file version!`);
    return currentTriggerData;
  }

  TRIGGER_DATA_KEYS.forEach((commandId) => {
    try {
      triggerData[commandId].triggers = [];
      switch (version) {
        case 0:
          parseV0Command(commandId, fileObject, triggerData);
          break;
        case 1:
          parseV1Command(commandId, fileObject, triggerData);
          break;
        default:
          break;
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
