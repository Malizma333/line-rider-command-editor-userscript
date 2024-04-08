class CommandEditor {
  constructor(store, initState) {
    this.store = store;
    this.state = initState;

    this.parser = new Parser();

    this.script = getCurrentScript(this.store.getState());
    this.riderCount = getNumRiders(this.store.getState());

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

    const script = getCurrentScript(this.store.getState());

    if (this.script !== script) {
      this.script = script;
      shouldUpdate = true;
    }

    const riderCount = getNumRiders(this.store.getState());

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
    let currentHeader = commandDataTypes[command].header;

    switch (command) {
      case Triggers.CameraFocus:
      case Triggers.CameraPan:
      case Triggers.Zoom:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.smoothing);
        break;
      case Triggers.TimeRemap:
        currentHeader = currentHeader.replace('{0}', JSON.stringify(currentData.triggers));
        currentHeader = currentHeader.replace('{1}', currentData.interpolate);
        break;
      case Triggers.CustomSkin:
        currentHeader = currentHeader.replace('{0}', Validator.formatSkins(currentData.triggers));
        break;
      default:
        currentHeader = '';
    }

    scriptResult += currentHeader;

    return scriptResult.replace(' ', '');
  }
}
