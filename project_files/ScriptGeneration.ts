/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Generates a Line Rider Web script from trigger data and a specific command id
 */
function generateScript (command: TRIGGER_ID, triggerData: TriggerData): string {
  const currentData = triggerData[command]
  const currentHeader = (TRIGGER_PROPS[command]).FUNC

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

/**
 * Formats a list of `SkinCSSTriggers` into an array of css strings
 */
function formatSkins (customSkinData: SkinCssTrigger[]): string[] {
  const nullColor = '#ffffffff'
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
    ` .flag {fill: ${customSkin.flag.fill ?? nullColor}}`
  ].join('').replace(/\n/g, ''))

  // For some reason, the skin css array input is indexed +1 mod n
  customSkinStrings.unshift(customSkinStrings.pop() ?? '')

  return customSkinStrings
}
