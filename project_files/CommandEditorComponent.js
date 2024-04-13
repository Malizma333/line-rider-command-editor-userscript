// Entry point for the UI components

// eslint-disable-next-line no-unused-vars
class CommandEditorComponent extends window.React.Component {
  constructor() {
    super();

    this.state = {
      active: false,
      initialized: false,
      actionPanelState: {},
      activeTab: null,
      triggerData: {},
      focuserDropdownIndices: [],
      skinEditorState: {},
      settings: {},
      unsavedSettings: {},
    };

    this.componentManager = new ComponentManager(window.React.createElement, this);
    this.commandEditor = new CommandEditor(window.store, this.state);

    window.store.subscribeImmediate(() => {
      const { initialized } = this.state;
      if (initialized) {
        this.onAdjustFocuserDropdown();
        this.onAdjustSkinDropdown();
      }
    });

    window.store.subscribe(() => {
      const playerRunning = Selectors.getPlayerRunning(window.store.getState());
      const windowFocused = Selectors.getWindowFocused(window.store.getState());

      const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

      document.getElementById(Constants.ROOT_NODE_ID).style.opacity = shouldBeVisible ? 1 : 0;
      document.getElementById(Constants.ROOT_NODE_ID).style.pointerEvents = shouldBeVisible ? null : 'none';
    });
  }

  // Rendering events that handle the basic React component rendering

  componentDidMount() {
    Object.assign(document.getElementById(Constants.ROOT_NODE_ID).style, Styles.root);
    this.onInitializeState().then(() => {
      this.setState({ initialized: true });
      this.setState({ active: window.CMD_EDITOR_DEBUG });
    });
  }

  componentWillUpdate(_, nextState) {
    this.commandEditor.onUpdate(nextState);
  }

  // Trigger editing actions, follows a Create-Update-Delete structure

  onCreateTrigger(index) {
    const { triggerData, activeTab, focuserDropdownIndices } = this.state;
    const commandData = triggerData[activeTab];
    const newTrigger = JSON.parse(JSON.stringify(commandData.triggers[index]));

    commandData.triggers.splice(index, 0, newTrigger);
    commandData.triggers = Validator.validateTimes(commandData);

    this.setState({ triggerData });

    if (activeTab === Constants.TRIGGER_TYPES.FOCUS) {
      this.setState({
        focuserDropdownIndices: [...focuserDropdownIndices, 0],
      }, () => this.onAdjustFocuserDropdown());
    }
  }

  onUpdateTrigger(valueChange, path, constraints, bounded = false) {
    const { triggerData, activeTab } = this.state;
    const commandData = triggerData[activeTab];
    let pathPointer = triggerData[activeTab];

    for (let i = 0; i < path.length - 1; i += 1) {
      pathPointer = pathPointer[path[i]];
    }

    pathPointer[path[path.length - 1]] = Validator.validateData(
      valueChange,
      constraints,
      bounded,
    );

    if (bounded) {
      commandData.triggers = Validator.validateTimes(commandData);
    }

    this.setState({ triggerData });
  }

  onDeleteTrigger(index) {
    const { triggerData, activeTab } = this.state;

    triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
      (_, i) => index !== i,
    );

    this.setState({ triggerData });
  }

  // Interaction events, used when a UI component needs to change the state

  onRead() {
    const { actionPanelState } = this.state;
    try {
      if (actionPanelState.hasError) {
        actionPanelState.message = '';
      }

      const readInformation = this.commandEditor.load();
      this.setState({ triggerData: readInformation });
      actionPanelState.hasError = false;
    } catch (error) {
      actionPanelState.message = `Error: ${error.message}`;
      actionPanelState.hasError = true;
    }

    this.setState({ actionPanelState });
  }

  onTest(overrideTab = null) {
    const { activeTab, actionPanelState } = this.state;
    const targetTab = overrideTab || activeTab;
    try {
      this.commandEditor.test(targetTab);
      actionPanelState.hasError = false;
    } catch (error) {
      actionPanelState.message = `Error: ${error.message}`;
      actionPanelState.hasError = true;
    }

    this.setState({ actionPanelState });
  }

  onPrint() {
    const { activeTab, actionPanelState } = this.state;
    try {
      actionPanelState.message = this.commandEditor.print(activeTab);
      actionPanelState.hasError = false;
    } catch (error) {
      actionPanelState.message = `Error: ${error.message}`;
      actionPanelState.hasError = true;
    }

    this.setState({ actionPanelState });
  }

  onResetSkin(index) {
    const confirmReset = window.confirm('Are you sure you want to reset the current rider\'s skin?');

    if (confirmReset) {
      const { triggerData } = this.state;

      triggerData.CustomSkin.triggers[index] = JSON.parse(JSON.stringify(
        Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
      ));

      this.setState({ triggerData });
    }
  }

  onChangeColor(color, alpha) {
    const { skinEditorState } = this.state;

    const hexAlpha = alpha
      ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
        .toString(16).padStart(2, '0')
      : skinEditorState.color.substring(7);

    const hexColor = color
      ? color + hexAlpha
      : skinEditorState.color.substring(0, 7) + hexAlpha;

    skinEditorState.color = hexColor;

    this.setState({ skinEditorState });
  }

  onCopyClipboard() {
    const { actionPanelState } = this.state;

    if (actionPanelState.hasError) {
      console.error('Error copying text to clipboard: ', actionPanelState.message);
    }

    window.navigator.clipboard.writeText(actionPanelState.message)
      .then(() => {
        console.log('Text copied to clipboard successfully');
      })
      .catch((error) => {
        console.error('Error copying text to clipboard: ', error);
      });
  }

  onActivate() {
    const { active } = this.state;
    if (active) {
      this.setState({ active: false });
    } else {
      this.setState({ active: true });
    }
  }

  onChangeTab(tabName) {
    this.setState({ activeTab: tabName });
  }

  onToggleSettings(active) {
    const { unsavedSettings, settings } = this.state;

    if (!active && unsavedSettings.dirty) {
      if (!window.confirm('Discard changes?')) {
        return;
      }
      Object.assign(unsavedSettings, settings);
      unsavedSettings.dirty = false;
      this.setState({ unsavedSettings });
    }

    settings.active = active;

    this.setState({ settings });
  }

  onChangeFontSize(fontSize) {
    const { unsavedSettings, settings } = this.state;

    if (fontSize !== settings.fontSize) {
      unsavedSettings.dirty = true;
    }

    unsavedSettings.fontSize = fontSize;
    this.setState({ unsavedSettings });
  }

  onChangeViewport(resolution) {
    const { unsavedSettings, settings } = this.state;

    if (resolution !== settings.resolution) {
      unsavedSettings.dirty = true;
    }

    unsavedSettings.resolution = resolution;
    this.setState({ unsavedSettings });
    this.setState({ resolution });
  }

  onSaveViewport(factor = 0) {
    const { settings, triggerData } = this.state;
    const size = Constants.SETTINGS.VIEWPORT[settings.resolution].SIZE;
    this.commandEditor.changeViewport({ width: size[0], height: size[1] });

    triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers.forEach((_, i) => {
      triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] = Math.round((
        triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] + factor + Number.EPSILON
      ) * 10e6) / 10e6;
    });

    this.onTest(Constants.TRIGGER_TYPES.ZOOM);
  }

  onApplySettings() {
    const { unsavedSettings, settings } = this.state;

    const resFactor = Math.log2(
      Constants.SETTINGS.VIEWPORT[unsavedSettings.resolution].SIZE[0]
      / Constants.SETTINGS.VIEWPORT[settings.resolution].SIZE[0],
    );

    Object.keys(Constants.INIT_SETTINGS).forEach((setting) => {
      settings[setting] = unsavedSettings[setting];
    });

    this.setState({ settings }, () => this.onSaveViewport(resFactor));

    unsavedSettings.dirty = false;

    this.setState({ unsavedSettings });
  }

  onChangeFocuserDropdown(index, value) {
    const { focuserDropdownIndices } = this.state;
    focuserDropdownIndices[index] = parseInt(value, 10);
    this.setState({ focuserDropdownIndices });
  }

  onChangeSkinDropdown(value) {
    const { skinEditorState } = this.state;
    skinEditorState.dropdownIndex = parseInt(value, 10);
    this.setState({ skinEditorState });
  }

  onAdjustFocuserDropdown() {
    const { triggerData } = this.state;
    const focusTriggers = triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers;
    const clamp = this.commandEditor.RiderCount;

    focusTriggers.forEach((e, i) => {
      for (let j = focusTriggers[i][1].length; j < clamp; j += 1) {
        focusTriggers[i][1] = [...focusTriggers[i][1], 0];
      }

      for (let j = focusTriggers[i][1].length; j > clamp; j -= 1) {
        focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1);
      }
    });

    triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers = focusTriggers;
    this.setState({ triggerData });

    const { focuserDropdownIndices } = this.state;

    focuserDropdownIndices.forEach((e, i) => {
      if (focuserDropdownIndices[i] >= clamp) {
        focuserDropdownIndices[i] = clamp - 1;
      }
    });

    this.setState({ focuserDropdownIndices });
  }

  onAdjustSkinDropdown() {
    const { triggerData } = this.state;
    let skinTriggers = triggerData[Constants.TRIGGER_TYPES.SKIN].triggers;
    const clamp = this.commandEditor.RiderCount;

    for (let j = skinTriggers.length; j < clamp; j += 1) {
      skinTriggers = [...skinTriggers, JSON.parse(JSON.stringify(
        Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
      ))];
    }

    for (let j = skinTriggers.length; j > clamp; j -= 1) {
      skinTriggers = skinTriggers.slice(0, -1);
    }

    triggerData[Constants.TRIGGER_TYPES.SKIN].triggers = skinTriggers;
    this.setState({ triggerData });

    const { skinEditorState } = this.state;

    if (skinEditorState.dropdownIndex >= clamp) {
      skinEditorState.dropdownIndex = clamp - 1;
    }

    this.setState({ skinEditorState });
  }

  onZoomSkinEditor(event, isMouseAction) {
    const rect = document.getElementById('skinElementContainer').getBoundingClientRect();
    const { skinEditorState } = this.state;

    if (isMouseAction) {
      if (skinEditorState.zoom.scale < Constants.CONSTRAINTS.SKIN_ZOOM.MAX) {
        skinEditorState.zoom.xOffset = (event.clientX - rect.x) / skinEditorState.zoom.scale;
        skinEditorState.zoom.yOffset = (event.clientY - rect.y) / skinEditorState.zoom.scale;
      }
      skinEditorState.zoom.scale = Math.max(Math.min(
        skinEditorState.zoom.scale - event.deltaY * Constants.SCROLL_DELTA,
        Constants.CONSTRAINTS.SKIN_ZOOM.MAX,
      ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN);
    } else {
      skinEditorState.zoom.scale = Math.max(Math.min(
        event.target.value,
        Constants.CONSTRAINTS.SKIN_ZOOM.MAX,
      ), Constants.CONSTRAINTS.SKIN_ZOOM.MIN);
    }

    this.setState({ skinEditorState });
  }

  // State initialization, populates the triggers with base data

  async onInitializeState() {
    const commands = Object.keys(Constants.TRIGGER_PROPS);

    if (commands.length === 0) {
      return;
    }

    this.onChangeTab(commands[0]);
    this.setState({ triggerData: this.commandEditor.parser.commandData });
    this.setState({ focuserDropdownIndices: [0] });
    this.setState({
      actionPanel: {
        hasError: false,
        message: '',
      },
    });
    this.setState({
      skinEditorState: {
        dropdownIndex: 0,
        zoom: { scale: 1 },
        color: '#000000ff',
      },
    });
    this.setState({
      settings: {
        ...Constants.INIT_SETTINGS,
        active: false,
      },
    }, this.onSaveViewport);
    this.setState({
      unsavedSettings: {
        ...Constants.INIT_SETTINGS,
        dirty: false,
      },
    });
  }

  render() {
    const { initialized } = this.state;
    if (!initialized) return false;
    this.componentManager.updateState(this.state);
    return this.componentManager.main();
  }
}
