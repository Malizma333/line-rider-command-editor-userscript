// eslint-disable-next-line no-unused-vars
class CommandEditor {
  constructor(store, initState) {
    this.store = store;
    this.state = initState;

    this.parser = new Parser();

    this.script = Selectors.getCurrentScript(this.store.getState());
    this.riderCount = Selectors.getNumRiders(this.store.getState());

    store.subscribeImmediate(() => {
      this.onUpdate();
    });
  }

  get RiderCount() {
    return this.riderCount;
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

  onUpdate(nextState = this.state) {
    let shouldUpdate = false;

    if (this.state !== nextState) {
      this.state = nextState;
      shouldUpdate = true;
    }

    const script = Selectors.getCurrentScript(this.store.getState());

    if (this.script !== script) {
      this.script = script;
      shouldUpdate = true;
    }

    const riderCount = Selectors.getNumRiders(this.store.getState());

    if (this.riderCount !== riderCount) {
      this.riderCount = riderCount;
      shouldUpdate = true;
    }

    if (!shouldUpdate || !this.state.active) return;

    this.changed = true;
  }

  generateScript(command) {
    let scriptResult = '';

    const currentData = this.state.triggerData[command];
    let currentHeader = CONSTANTS.TRIGGER_PROPS[command].FUNC;

    switch (command) {
      case CONSTANTS.TRIGGER_TYPES.FOCUS:
      case CONSTANTS.TRIGGER_TYPES.PAN:
      case CONSTANTS.TRIGGER_TYPES.ZOOM:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.smoothing);
        break;
      case CONSTANTS.TRIGGER_TYPES.TIME:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.interpolate);
        break;
      case CONSTANTS.TRIGGER_TYPES.SKIN:
        currentHeader = currentHeader.replace('{0}', Validator.formatSkins(currentData.triggers));
        break;
      default:
        currentHeader = '';
    }

    scriptResult += currentHeader;

    return scriptResult.replace(' ', '');
  }
}
