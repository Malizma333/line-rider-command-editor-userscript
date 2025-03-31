import { TriggerDataManager, TRIGGER_METADATA, TRIGGER_DATA_KEYS } from "../TriggerDataManager";
import {
  CameraFocusTrigger, CameraPanTrigger, TimeRemapTrigger, TRIGGER_ID, TriggerDataLookup, ZoomTrigger,
} from "../TriggerDataManager.types";
import { CONSTRAINT } from "../constraints";
import { retrieveTimestamp } from "../util";
import { isArray, isNumber, isNumberArray, isStringArray } from "./type-guards";

/**
 * Parses text from the script field into a trigger data object, reverting to the original value if an error occurs
 * @param scriptText The script text that needs to be parsed
 * @param currentTriggerData The current trigger data in case there is an issue with the new data
 * @returns The formatted trigger data object
 */
export default function readJsScript(scriptText: string, currentTriggerData: TriggerDataLookup): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;

  /**
   * Parses an individual command given its id and applies the parsed script to the trigger data
   * @param commandId The id of the command being parsed
   * @param scriptSection The section of script that needs parsing
   */
  function parseCommand(commandId: TRIGGER_ID, scriptSection: string): void {
    if (commandId === TRIGGER_ID.GRAVITY) {
      throw new Error("Gravity parsing not supported!");
    }

    if (commandId === TRIGGER_ID.LAYER) {
      throw new Error("Layer parsing not supported!");
    }

    if (TRIGGER_METADATA[commandId].FUNC === undefined) {
      throw new Error("Function undefined!");
    }

    const currentHeader = TRIGGER_METADATA[commandId].FUNC.split("(")[0];
    const currentHeaderIndex = scriptSection.indexOf(currentHeader);

    if (currentHeaderIndex === -1) {
      throw new Error("Command header not found!");
    }

    const startIndex = currentHeaderIndex + currentHeader.length + 1;
    let endIndex = startIndex;

    for (let i = 1; i > 0 || endIndex >= scriptSection.length; endIndex += 1) {
      if (scriptSection.charAt(endIndex + 1) === "(") i += 1;
      if (scriptSection.charAt(endIndex + 1) === ")") i -= 1;
    }

    const parameterText = `[${
      removeLeadingZeroes(
          scriptSection.substring(startIndex, endIndex),
          commandId,
      )
    }]`;

    // HACK: Using eval is easier than json.parse, which has stricter syntax
    const parameterArray: JSONArray = eval(parameterText);

    const keyframes = parameterArray[0];

    if (!isArray(keyframes)) {
      throw new Error("Keyframes was not an array!");
    }

    let smoothing: JSONValue = 0;

    if (parameterArray.length > 0) {
      smoothing = parameterArray[1];
    }

    switch (commandId) {
      case TRIGGER_ID.ZOOM:
        triggerData[commandId].triggers = parseTriggers<ZoomTrigger>(keyframes);
        triggerData[commandId].smoothing = parseSmoothing(smoothing);
        break;
      case TRIGGER_ID.PAN:
        triggerData[commandId].triggers = parseTriggers<CameraPanTrigger>(keyframes);
        triggerData[commandId].smoothing = parseSmoothing(smoothing);
        break;
      case TRIGGER_ID.FOCUS:
        triggerData[commandId].triggers = parseTriggers<CameraFocusTrigger>(keyframes);
        triggerData[commandId].smoothing = parseSmoothing(smoothing);
        break;
      case TRIGGER_ID.TIME:
        triggerData[commandId].triggers = parseTriggers<TimeRemapTrigger>(keyframes);
        triggerData[commandId].interpolate = smoothing === true;
        break;
      case TRIGGER_ID.SKIN:
        parseSkinCss(keyframes);
        break;
      default:
        break;
    }
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
        throw new Error("Command keyframe was not an array!");
      }

      const newTrigger: JSONArray = [[0, 0, 0], structuredClone(trigger[1])];
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
   * Parses integer smoothing for a command if its available
   * @param smoothingValue The proposed value for smoothing
   * @returns The parsed smoothing integer
   */
  function parseSmoothing(smoothingValue: JSONValue): number {
    const constraints = CONSTRAINT.SMOOTH;

    if (smoothingValue === null || smoothingValue === undefined) {
      return constraints.DEFAULT;
    }

    if (!isNumber(smoothingValue)) {
      throw new Error("Invalid smoothing, was not a number!");
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
   * Parses a string of CSS into a skin trigger array
   * @param skinCSSArray The css array that needs parsing
   */
  function parseSkinCss(skinCSSArray: JSONArray): void {
    if (!isStringArray(skinCSSArray)) {
      throw new Error("Skin CSS Array was not string array!");
    }

    skinCSSArray.forEach((skinCSS: string, skinIndex: number) => {
      triggerData[TRIGGER_ID.SKIN].triggers.push(
          structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE),
      );
      let depth = 0;
      let zeroIndex = 0;

      for (let i = 0; i < skinCSS.length; i += 1) {
        if (skinCSS.charAt(i) === "{") depth += 1;
        if (skinCSS.charAt(i) === "}") {
          depth -= 1;
          if (depth === 0) {
            parseSkinProp(
                skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ""),
                skinIndex,
            );
            zeroIndex = i + 1;
          }
        }
      }
    });

    // Revert from 1 indexed modulo n skin array to 0 indexed array
    if (triggerData[TRIGGER_ID.SKIN].triggers.length > 0) {
      triggerData[TRIGGER_ID.SKIN].triggers.push(
          triggerData[TRIGGER_ID.SKIN].triggers.shift() ?? TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE,
      );
    }
  }

  /**
   * Parses a specific property of a skin css string
   * @param cssString The css property as a string
   * @param skinIndex The corresponding index of the skin this property is being parsed for
   */
  function parseSkinProp(cssString: string, skinIndex: number): void {
    const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g;
    const skinTriggers = triggerData[TRIGGER_ID.SKIN].triggers;
    const cssPropKeywords = {
      outline: ".outline",
      flag: ".flag",
      skin: ".skin",
      hair: ".hair",
      fill: ".fill",
      eye: "#eye",
      sled: ".sled",
      string: "#string",
      armSleeve: ".arm.sleeve",
      armHand: ".arm.hand",
      legPants: ".leg.pants",
      legFoot: ".leg.foot",
      torso: ".torso",
      hatTop: ".hat.top",
      hatBottom: ".hat.bottom",
      hatBall: ".hat.ball",
      scarf1: ".scarf1",
      scarf2: ".scarf2",
      scarf3: ".scarf3",
      scarf4: ".scarf4",
      scarf5: ".scarf5",
      id_scarf0: "#scarf0",
      id_scarf1: "#scarf1",
      id_scarf2: "#scarf2",
      id_scarf3: "#scarf3",
      id_scarf4: "#scarf4",
      id_scarf5: "#scarf5",
    };

    Object.entries(cssPropKeywords).forEach(([propName, cssSelector]) => {
      if (!cssString.startsWith(cssSelector)) return;
      const styleData = JSON.parse(cssString
          .substring(cssSelector.length)
          .replace(wordRegex, "\"$2\"")
          .replace(";", ","));

      if (styleData.fill !== undefined) {
        skinTriggers[skinIndex][propName].fill = styleData.fill;
      }

      if (styleData.stroke !== undefined) {
        skinTriggers[skinIndex][propName].stroke = styleData.stroke;
      }
    });

    triggerData[TRIGGER_ID.SKIN].triggers = skinTriggers;
  }

  /**
   * Removes the leading zeroes from numbers within the script
   * @param script Script to remove leading zeroes from
   * @param commandId Type of trigger this script portion is being parsed for
   * @returns Script with leading zeroes removed
   */
  function removeLeadingZeroes(script: string, commandId: TRIGGER_ID): string {
    if (commandId === TRIGGER_ID.SKIN) return script;
    return script.replace(/([^\d.+-])0+(\d+)/g, "$1$2");
  }

  const trimmedScript = scriptText.replace(/\s/g, "");

  TRIGGER_DATA_KEYS.forEach((commandId) => {
    try {
      triggerData[commandId].triggers = [];
      parseCommand(commandId, trimmedScript);
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
