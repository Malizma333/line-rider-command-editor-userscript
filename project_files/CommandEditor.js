// eslint-disable-next-line no-unused-vars
class CommandEditor {
  constructor(store, initState) {
    this.store = store;
    this.state = initState;

    this.parser = new Parser();

    this.script = Selectors.getCurrentScript(this.store.getState());

    store.subscribeImmediate(() => {
      this.onUpdate();
    });
  }

  load() {
    this.parser.parseScript(this.script);
    this.state.triggerData = this.parser.commandData;
    return this.state.triggerData;
  }

  test(command) {
    const script = this.generateScript(command);
    // HACK: Already evaluated script, execute string instead of figuring out how to execute locally
    // eslint-disable-next-line no-eval
    eval.call(window, script);
  }

  print(command) {
    return this.generateScript(command);
  }

  changeViewport(nextViewport) {
    this.store.dispatch(Actions.setPlaybackDimensions(nextViewport));
  }

  onUpdate(nextState = this.state) {
    if (this.state !== nextState) {
      this.state = nextState;
    }

    const script = Selectors.getCurrentScript(this.store.getState());

    if (this.script !== script) {
      this.script = script;
    }
  }

  generateScript(command) {
    let scriptResult = '';

    const currentData = this.state.triggerData[command];
    let currentHeader = Constants.TRIGGER_PROPS[command].FUNC;

    switch (command) {
      case Constants.TRIGGER_TYPES.FOCUS:
      case Constants.TRIGGER_TYPES.PAN:
      case Constants.TRIGGER_TYPES.ZOOM:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.smoothing);
        break;
      case Constants.TRIGGER_TYPES.TIME:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.interpolate);
        break;
      case Constants.TRIGGER_TYPES.SKIN:
        currentHeader = currentHeader.replace('{0}', this.formatSkins(currentData.triggers));
        break;
      default:
        currentHeader = '';
    }

    scriptResult += currentHeader;

    return scriptResult.replace(' ', '');
  }

  static formatSkins(customSkinData) {
    const customSkinStrings = customSkinData.map((customSkin) => [
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
      ` .flag {fill: ${customSkin.flag.fill}}`,
    ].join('').replace(/\n/g, ''));

    customSkinStrings.unshift(customSkinStrings.pop());

    return JSON.stringify(customSkinStrings);
  }
}
