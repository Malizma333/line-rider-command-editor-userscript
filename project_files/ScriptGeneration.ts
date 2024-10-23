/* eslint-disable @typescript-eslint/no-unused-vars */

function generateScript (command: TRIGGER_TYPES, triggerData: any): string {
  const currentData = triggerData[command]
  const currentHeader = (TRIGGER_PROPS[command]).FUNC

  switch (command) {
    case TRIGGER_TYPES.FOCUS:
    case TRIGGER_TYPES.PAN:
    case TRIGGER_TYPES.ZOOM:
      return currentHeader
        .replace('{0}', JSON.stringify(currentData.triggers))
        .replace('{1}', currentData.smoothing)
        .replace(' ', '')
    case TRIGGER_TYPES.TIME:
      return currentHeader
        .replace('{0}', JSON.stringify(currentData.triggers))
        .replace('{1}', currentData.interpolate)
        .replace(' ', '')
    case TRIGGER_TYPES.SKIN:
      return currentHeader
        .replace('{0}', formatSkins(currentData.triggers))
        .replace(' ', '')
    default:
      return ''
  }
}

function formatSkins (customSkinData: SKIN_MAP_STRUCT[]): string {
  const customSkinStrings = customSkinData.map((customSkin: SKIN_MAP_STRUCT) => [
    ` .outline {stroke: ${customSkin.outline.stroke}}`,
    ` .skin {fill: ${customSkin.skin.fill}}`,
    ` .hair {fill: ${customSkin.hair.fill}}`,
    ` .fill {fill: ${customSkin.fill.fill}}`,
    ` #eye {fill: ${customSkin.eye.fill}}`,
    ` .sled {fill: ${customSkin.sled.fill}}`,
    ` #string {stroke: ${customSkin.string.stroke}}`,
    ` .arm .sleeve {fill: ${customSkin.armSleeve.fill}}`,
    ` .arm .hand {fill: ${customSkin.armHand.fill}}`,
    ` .leg .pants {fill: ${customSkin.legPants.fill}}`,
    ` .leg .foot {fill: ${customSkin.legFoot.fill}}`,
    ` .torso {fill: ${customSkin.torso.fill}}`,
    ` .scarf1 {fill: ${customSkin.scarf1.fill}}`,
    ` .scarf2 {fill: ${customSkin.scarf2.fill}}`,
    ` .scarf3 {fill: ${customSkin.scarf3.fill}}`,
    ` .scarf4 {fill: ${customSkin.scarf4.fill}}`,
    ` .scarf5 {fill: ${customSkin.scarf5.fill}}`,
    ` #scarf0 {fill: ${customSkin.id_scarf0.fill}}`,
    ` #scarf1 {fill: ${customSkin.id_scarf1.fill}}`,
    ` #scarf2 {fill: ${customSkin.id_scarf2.fill}}`,
    ` #scarf3 {fill: ${customSkin.id_scarf3.fill}}`,
    ` #scarf4 {fill: ${customSkin.id_scarf4.fill}}`,
    ` #scarf5 {fill: ${customSkin.id_scarf5.fill}}`,
    ` .hat .top {fill: ${customSkin.hatTop.fill}}`,
    ` .hat .bottom {stroke: ${customSkin.hatBottom.stroke}}`,
    ` .hat .ball {fill: ${customSkin.hatBall.fill}}`,
    ` .flag {fill: ${customSkin.flag.fill}}`
  ].join('').replace(/\n/g, ''))

  customSkinStrings.unshift(customSkinStrings.pop() ?? '')

  return JSON.stringify(customSkinStrings)
}