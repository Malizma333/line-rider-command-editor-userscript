import {
  TRIGGER_ID,
  TriggerDataLookup,
  TimedTrigger,
  TriggerTime,
  SkinCssTrigger,
} from "../lib/TriggerDataManager.types";
import { TRIGGER_METADATA } from "./TriggerDataManager";

/**
 * Extracts the trigger array from some trigger data lookup for a specific trigger
 * @param triggerData The trigger data lookup to extract from
 * @param activeTab The target trigger to extract the trigger array of (excluding skin triggers)
 * @param gravityDropdown The target gravity trigger array to get
 * @param layerDropdown The target layer trigger array to get
 * @returns The extracted array of triggers
 */
export function extractTriggerArray(
    triggerData: TriggerDataLookup,
    activeTab: Exclude<TRIGGER_ID, TRIGGER_ID.SKIN>,
    gravityDropdown: number,
    layerDropdown: number,
): TimedTrigger[] {
  return (
      activeTab === TRIGGER_ID.GRAVITY ? triggerData[activeTab].triggers[gravityDropdown] :
      activeTab === TRIGGER_ID.LAYER ? triggerData[activeTab].triggers[layerDropdown] :
      triggerData[activeTab].triggers
  );
}

/**
 * Validates the times in a list of triggers
 * - First trigger must be at time 0
 * - Each trigger after should have a later time than the trigger before it
 * @param triggers List of triggers to check timestamps of
 * @returns Which times in the trigger array are invalid
 */
export function validateTimes(triggers: TimedTrigger[]): boolean[] {
  const invalidIndices = Array(triggers.length).fill(false);

  const firstTime = triggers[0][0];
  if (firstTime[0] !== 0 || firstTime[1] !== 0 || firstTime[2] !== 0) {
    invalidIndices[0] = true;
  }

  for (let i = 0; i < triggers.length - 1; i += 1) {
    const time1 = triggers[i][0];
    const time2 = triggers[i + 1][0];
    const index1 = (
      time1[0] * 60 + time1[1]
    ) * 40 + time1[2];
    const index2 = (
      time2[0] * 60 + time2[1]
    ) * 40 + time2[2];

    if (index1 >= index2) {
      invalidIndices[i + 1] = true;
    }
  }

  return invalidIndices;
}

/**
 * Formats a list of `SkinCSSTriggers` into an array of css strings
 * @param customSkinData List of CSS triggers to convert to a string array
 * @returns The array of css properties
 */
export function formatSkins(customSkinData: SkinCssTrigger[]): string[] {
  const nullColor = "#ffffffff";
  const customSkinStrings = customSkinData.map((customSkin: SkinCssTrigger) => [
    ` .outline {stroke: ${customSkin.outline.stroke ?? nullColor}}`,
    ` .skin {fill: ${customSkin.skin.fill ?? nullColor}}`,
    ` .hair {fill: ${customSkin.hair.fill ?? nullColor}}`,
    ` .fill {fill: ${customSkin.fill.fill ?? nullColor}}`,
    ` #eye {fill: ${customSkin.eye.fill ?? nullColor}}`,
    ` .sled {fill: ${customSkin.sled.fill ?? nullColor}}`,
    ` #string {stroke: ${customSkin.string.stroke ?? nullColor}}`,
    ` .arm .sleeve {fill: ${customSkin.armSleeve.fill ?? nullColor}}`,
    ` .arm .hand {fill: ${customSkin.armHand.fill ?? nullColor}}`,
    ` .leg .pants {fill: ${customSkin.legPants.fill ?? nullColor}}`,
    ` .leg .foot {fill: ${customSkin.legFoot.fill ?? nullColor}}`,
    ` .torso {fill: ${customSkin.torso.fill ?? nullColor}}`,
    ` .scarf1 {fill: ${customSkin.scarf1.fill ?? nullColor}}`,
    ` .scarf2 {fill: ${customSkin.scarf2.fill ?? nullColor}}`,
    ` .scarf3 {fill: ${customSkin.scarf3.fill ?? nullColor}}`,
    ` .scarf4 {fill: ${customSkin.scarf4.fill ?? nullColor}}`,
    ` .scarf5 {fill: ${customSkin.scarf5.fill ?? nullColor}}`,
    ` #scarf0 {fill: ${customSkin.id_scarf0.fill ?? nullColor}}`,
    ` #scarf1 {fill: ${customSkin.id_scarf1.fill ?? nullColor}}`,
    ` #scarf2 {fill: ${customSkin.id_scarf2.fill ?? nullColor}}`,
    ` #scarf3 {fill: ${customSkin.id_scarf3.fill ?? nullColor}}`,
    ` #scarf4 {fill: ${customSkin.id_scarf4.fill ?? nullColor}}`,
    ` #scarf5 {fill: ${customSkin.id_scarf5.fill ?? nullColor}}`,
    ` .hat .top {fill: ${customSkin.hatTop.fill ?? nullColor}}`,
    ` .hat .bottom {stroke: ${customSkin.hatBottom.stroke ?? nullColor}}`,
    ` .hat .ball {fill: ${customSkin.hatBall.fill ?? nullColor}}`,
    ` .flag {fill: ${customSkin.flag.fill ?? nullColor}}`,
  ].join("").replace(/\n/g, ""));

  // For some reason, the skin css array input is indexed +1 mod n
  customSkinStrings.unshift(customSkinStrings.pop() ?? "");

  return customSkinStrings;
}

/**
 * Converts a player index to a trigger timestamp
 * @param index Frame to convert to a timestamp
 * @returns A timestamp array containing [minutes, seconds, frames]
 */
export function retrieveTimestamp(index: number): TriggerTime {
  const frames = index % 40;
  const seconds = Math.floor(index / 40) % 60;
  const minutes = Math.floor(index / 2400);
  return [minutes, seconds, frames];
}

/**
 * Converts trigger timestamp to player index
 * @param timestamp Timestamp to convert to frame index
 * @returns Frame corresponding to the trigger time timestamp
 */
export function retrieveIndex(timestamp: TriggerTime): number {
  return timestamp[0] * 2400 + timestamp[1] * 40 + timestamp[2];
}

/**
 * Generates a Line Rider Web script from trigger data and a specific command id
 * @param command Command to generate a script for
 * @param triggerData Template information to use for the command
 * @returns The script as a string
 */
export function generateScript(command: TRIGGER_ID, triggerData: TriggerDataLookup): string {
  const currentHeader = (TRIGGER_METADATA[command]).FUNC;

  if (currentHeader === undefined) {
    return "";
  }

  switch (command) {
    case TRIGGER_ID.FOCUS:
    case TRIGGER_ID.PAN:
    case TRIGGER_ID.ZOOM: {
      const currentData = triggerData[command];
      return currentHeader
          .replace("{0}", JSON.stringify(currentData.triggers))
          .replace("{1}", String(currentData.smoothing))
          .replace(" ", "");
    }
    case TRIGGER_ID.TIME: {
      const currentData = triggerData[command];
      return currentHeader
          .replace("{0}", JSON.stringify(currentData.triggers))
          .replace("{1}", String(currentData.interpolate))
          .replace(" ", "");
    }
    case TRIGGER_ID.SKIN: {
      const currentData = triggerData[command];
      return currentHeader
          .replace("{0}", JSON.stringify(formatSkins(currentData.triggers)))
          .replace(" ", "");
    }
    default:
      return "";
  }
}
