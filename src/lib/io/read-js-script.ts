import { TriggerDataManager, TRIGGER_METADATA, TRIGGER_DATA_KEYS } from "../TriggerDataManager";
import {
  CameraFocusTrigger,
  CameraPanTrigger,
  SkinCssTrigger,
  TimeRemapTrigger,
  TRIGGER_ID,
  TriggerDataLookup,
  TriggerTime,
  ZoomTrigger,
} from "../TriggerDataManager.types";
import { CONSTRAINT } from "../constraints";
import { retrieveTimestamp } from "../util";
import { assert, ASSERT_TYPE, check } from "./type-guards";

/**
 * Parses an individual command given its id and applies the parsed script to the trigger data
 * @param commandId The id of the command being parsed
 * @param scriptSection The section of script that needs parsing
 * @param triggerData Trigger data to write to
 */
function parseCommand(commandId: TRIGGER_ID, scriptSection: string, triggerData: TriggerDataLookup): void {
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
  const parameterArray: unknown[] = eval(parameterText);

  const keyframes = parameterArray[0];

  assert(keyframes, ASSERT_TYPE.ARR);

  let smoothing: unknown = 0;

  if (parameterArray.length > 0) {
    smoothing = parameterArray[1];
  }

  switch (commandId) {
    case TRIGGER_ID.ZOOM:
      triggerData[commandId].triggers = parseZoomTriggers(keyframes);
      triggerData[commandId].smoothing = parseNumberSmoothing(smoothing);
      break;
    case TRIGGER_ID.PAN:
      triggerData[commandId].triggers = parsePanTriggers(keyframes);
      triggerData[commandId].smoothing = parseNumberSmoothing(smoothing);
      break;
    case TRIGGER_ID.FOCUS:
      triggerData[commandId].triggers = parseFocusTriggers(keyframes);
      triggerData[commandId].smoothing = parseNumberSmoothing(smoothing);
      break;
    case TRIGGER_ID.TIME:
      triggerData[commandId].triggers = parseTimeTriggers(keyframes);
      triggerData[commandId].interpolate = smoothing === true;
      break;
    case TRIGGER_ID.SKIN:
      triggerData[commandId].triggers = parseSkinCss(keyframes);
      break;
    default:
      break;
  }
}

/**
 * Parses an unknown array into a list of zoom triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseZoomTriggers(triggerArray: unknown[]): ZoomTrigger[] {
  const triggers: ZoomTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const zoomProp = trigger[1];

    assert(zoomProp, ASSERT_TYPE.NUM);

    const newTrigger: ZoomTrigger = [parseTime(trigger[0]), zoomProp] as ZoomTrigger;

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of camera pan triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parsePanTriggers(triggerArray: unknown[]): CameraPanTrigger[] {
  const triggers: CameraPanTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const panProp = trigger[1];

    assert(panProp, ASSERT_TYPE.STR_RECORD);

    const { x, y, w, h } = panProp;

    assert(x, ASSERT_TYPE.NUM);
    assert(y, ASSERT_TYPE.NUM);
    assert(w, ASSERT_TYPE.NUM);
    assert(h, ASSERT_TYPE.NUM);

    const newTrigger: CameraPanTrigger = [parseTime(trigger[0]), { x, y, w, h }];

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of camera focus triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseFocusTriggers(triggerArray: unknown[]): CameraFocusTrigger[] {
  const triggers: CameraFocusTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const focusProp = trigger[1];

    assert(focusProp, ASSERT_TYPE.NUM_ARR);

    const newTrigger: CameraFocusTrigger = [parseTime(trigger[0]), focusProp];

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses an unknown array into a list of time remap triggers
 * @param triggerArray The list of triggers being parsed
 * @returns The converted list of triggers
 */
function parseTimeTriggers(triggerArray: unknown[]): TimeRemapTrigger[] {
  const triggers: TimeRemapTrigger[] = [];

  for (const trigger of triggerArray) {
    assert(trigger, ASSERT_TYPE.ARR);

    const timeRemapProp = trigger[1];

    assert(timeRemapProp, ASSERT_TYPE.NUM);

    const newTrigger: TimeRemapTrigger = [parseTime(trigger[0]), timeRemapProp] as TimeRemapTrigger;

    triggers.push(newTrigger);
  }

  return triggers;
}

/**
 * Parses integer smoothing
 * @param smoothingValue The proposed value for smoothing
 * @returns A valid smoothing value
 */
function parseNumberSmoothing(smoothingValue: unknown): number {
  const constraints = CONSTRAINT.SMOOTH;

  if (smoothingValue === null || smoothingValue === undefined) {
    return constraints.DEFAULT;
  }

  assert(smoothingValue, ASSERT_TYPE.NUM);

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
 * @returns The parsed triggers
 */
function parseSkinCss(skinCSSArray: unknown[]): SkinCssTrigger[] {
  assert(skinCSSArray, ASSERT_TYPE.STR_ARR);
  const triggers: SkinCssTrigger[] = [];

  skinCSSArray.forEach((skinCSS: string, skinIndex: number) => {
    triggers.push(structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE));

    let depth = 0;
    let zeroIndex = 0;

    for (let i = 0; i < skinCSS.length; i += 1) {
      if (skinCSS.charAt(i) === "{") depth += 1;
      if (skinCSS.charAt(i) === "}") {
        depth -= 1;
        if (depth === 0) {
          triggers[skinIndex] = parseSkinProp(skinCSS.substring(zeroIndex, i + 1).replace(/\s/g, ""));
          zeroIndex = i + 1;
        }
      }
    }
  });

  // Revert from 1 indexed modulo n skin array to 0 indexed array
  if (triggers.length > 0) {
    triggers.push(triggers.shift() ?? TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE);
  }

  return triggers;
}

/**
 * Parses a specific property of a skin css string
 * @param cssString The css property as a string
 * @returns A record of properties to apply
 */
function parseSkinProp(cssString: string): Record<string, Record<string, string>> {
  const props: Record<string, Record<string, string>> = {};
  const wordRegex = /(['"])?([#]?[a-z0-9A-Z_-]+)(['"])?/g;
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

    if (!(propName in props)) {
      props[propName] = {};
    }

    if (styleData.fill !== undefined) {
      props[propName].fill = styleData.fill;
    }

    if (styleData.stroke !== undefined) {
      props[propName].stroke = styleData.stroke;
    }
  });

  return props;
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

/**
 * Parses text from the script field into a trigger data object, reverting to the original value if an error occurs
 * @param scriptText The script text that needs to be parsed
 * @param currentTriggerData The current trigger data in case there is an issue with the new data
 * @returns The formatted trigger data object
 */
export default function readJsScript(scriptText: string, currentTriggerData: TriggerDataLookup): TriggerDataLookup {
  const triggerData = TriggerDataManager.initialTriggerData;
  const trimmedScript = scriptText.replace(/\s/g, "");

  TRIGGER_DATA_KEYS.forEach((commandId) => {
    try {
      triggerData[commandId].triggers = [];
      parseCommand(commandId, trimmedScript, triggerData);
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

/**
 * Parses a timestamp
 * @param timestamp Time stamp to parse
 * @returns Valid timestamp converted to trigger time
 */
function parseTime(timestamp: unknown): TriggerTime {
  let parsedTimestamp: TriggerTime = [0, 0, 0];

  if (check(timestamp, ASSERT_TYPE.NUM)) {
    const index = timestamp;
    parsedTimestamp = retrieveTimestamp(index);
  } else {
    assert(timestamp, ASSERT_TYPE.NUM_ARR);

    if (timestamp.length === 1) {
      const index = timestamp[0];
      parsedTimestamp = retrieveTimestamp(index);
    } else if (timestamp.length === 2) {
      const index = timestamp[0] * 40 + timestamp[1];
      parsedTimestamp = retrieveTimestamp(index);
    } else {
      const index = timestamp[0] * 2400 + timestamp[1] * 40 + timestamp[2];
      parsedTimestamp = retrieveTimestamp(index);
    }
  }
  return parsedTimestamp;
}
