import { TRIGGER_METADATA } from '../TriggerDataManager';
import { TRIGGER_ID, TriggerDataLookup, SkinCssTrigger } from '../TriggerDataManager.types';
import { formatSkins } from '../util';

/**
 * Generates a Line Rider Web script from trigger data and a specific command id
 * @param command Command to generate a script for
 * @param triggerData Template information to use for the command
 * @returns The script as a string
 */
export function writeJsScript(command: TRIGGER_ID, triggerData: TriggerDataLookup): string {
  const currentData = triggerData[command];
  const currentHeader = (TRIGGER_METADATA[command]).FUNC;

  if (currentHeader === undefined) {
    return '';
  }

  switch (command) {
    case TRIGGER_ID.FOCUS:
    case TRIGGER_ID.PAN:
    case TRIGGER_ID.ZOOM:
      return currentHeader
          .replace('{0}', JSON.stringify(currentData.triggers))
          .replace('{1}', String(currentData.smoothing))
          .replace(' ', '');
    case TRIGGER_ID.TIME:
      return currentHeader
          .replace('{0}', JSON.stringify(currentData.triggers))
          .replace('{1}', String(currentData.interpolate))
          .replace(' ', '');
    case TRIGGER_ID.SKIN:
      return currentHeader
          .replace('{0}', JSON.stringify(formatSkins(currentData.triggers as SkinCssTrigger[])))
          .replace(' ', '');
    default:
      return '';
  }
}
