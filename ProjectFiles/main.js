/* Main function, entry point of the application */

function main() {
  window.V2 = window.V2 || Selectors.getWindowStart(window.store.getState());

  const {
    React,
    ReactDOM,
    store,
  } = window;

  let playerRunning = Selectors.getPlayerRunning(store.getState());
  let windowFocused = Selectors.getWindowFocused(store.getState());
  const commandEditorParent = document.createElement('div');

  // Listens for changes in window state to update UI accordingly

  store.subscribe(() => {
    playerRunning = Selectors.getPlayerRunning(store.getState());
    windowFocused = Selectors.getWindowFocused(store.getState());

    const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

    commandEditorParent.style.opacity = shouldBeVisible ? 1 : 0;
    commandEditorParent.style.pointerEvents = shouldBeVisible ? null : 'none';
  });

  // Entry point for the UI components

  class CommandEditorComponent extends React.Component {
    constructor() {
      super();

      this.state = {
        active: false,
        initialized: false,
        hasError: false,
        message: '',
        activeTab: null,
        settingsActive: false,
        triggerData: {},
        focuserDropdownIndices: [],
        skinDropdownIndex: 0,
        skinEditorZoomProps: {},
        selectedColor: opaqueWhite,
        fontSizePreset: constraintProps.textSizeProps.default,
        resolution: viewportSizes.FHD,
      };

      this.componentManager = new ComponentManager(React.createElement, this);
      this.commandEditor = new CommandEditor(store, this.state);

      store.subscribeImmediate(() => {
        const { initialized } = this.state;
        if (initialized) {
          this.onAdjustFocuserDropdown();
          this.onAdjustSkinDropdown();
        }
      });
    }

    // Rendering events that handle the basic React component rendering

    componentDidMount() {
      Object.assign(commandEditorParent.style, parentStyle);
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

      if (activeTab === Triggers.CameraFocus) {
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
      const { hasError } = this.state;
      try {
        if (hasError) {
          this.setState({ message: '' });
        }

        const readInformation = this.commandEditor.load();
        this.setState({ triggerData: readInformation });
        this.setState({ hasError: false });
      } catch (error) {
        this.setState({ message: `Error: ${error.message}` });
        this.setState({ hasError: true });
      }
    }

    onTest() {
      const { activeTab } = this.state;
      try {
        this.commandEditor.test(activeTab);
        this.setState({ hasError: false });
      } catch (error) {
        this.setState({ message: `Error: ${error.message}` });
        this.setState({ hasError: true });
      }
    }

    onPrint() {
      const { activeTab } = this.state;
      try {
        const printInformation = this.commandEditor.print(activeTab);
        this.setState({ message: printInformation });
        this.setState({ hasError: false });
      } catch (error) {
        this.setState({ message: `Error: ${error.message}` });
        this.setState({ hasError: true });
      }
    }

    onResetSkin(index) {
      const confirmReset = window.confirm('Are you sure you want to reset the current rider\'s skin?');

      if (confirmReset) {
        const { triggerData } = this.state;

        triggerData.CustomSkin.triggers[index] = JSON.parse(JSON.stringify(
          commandDataTypes.CustomSkin.template,
        ));

        this.setState({ triggerData });
      }
    }

    onChangeColor(color, alpha) {
      const { selectedColor } = this.state;
      const hexAlpha = alpha
        ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
          .toString(16).padStart(2, '0')
        : selectedColor.substring(7);

      const hexColor = color
        ? color + hexAlpha
        : selectedColor.substring(0, 7) + hexAlpha;

      this.setState({ selectedColor: hexColor });
    }

    onCopyClipboard() {
      const { message, hasError } = this.state;

      if (hasError) {
        console.error('Error copying text to clipboard: ', message);
      }

      window.navigator.clipboard.writeText(message)
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

    onToggleSettings(settingsActive) {
      this.setState({ settingsActive });
    }

    onChangeFocuserDropdown(index, value) {
      const { focuserDropdownIndices } = this.state;
      focuserDropdownIndices[index] = parseInt(value, 10);
      this.setState({ focuserDropdownIndices });
    }

    onChangeSkinDropdown(value) {
      this.setState({ skinDropdownIndex: parseInt(value, 10) });
    }

    onAdjustFocuserDropdown() {
      const { triggerData } = this.state;
      const focusTriggers = triggerData[Triggers.CameraFocus].triggers;
      const clamp = this.commandEditor.RiderCount;

      focusTriggers.forEach((e, i) => {
        for (let j = focusTriggers[i][1].length; j < clamp; j += 1) {
          focusTriggers[i][1] = [...focusTriggers[i][1], 0];
        }

        for (let j = focusTriggers[i][1].length; j > clamp; j -= 1) {
          focusTriggers[i][1] = focusTriggers[i][1].slice(0, -1);
        }
      });

      triggerData[Triggers.CameraFocus].triggers = focusTriggers;
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
      let skinTriggers = triggerData[Triggers.CustomSkin].triggers;
      const clamp = this.commandEditor.RiderCount;

      for (let j = skinTriggers.length; j < clamp; j += 1) {
        skinTriggers = [...skinTriggers, JSON.parse(JSON.stringify(
          commandDataTypes.CustomSkin.template,
        ))];
      }

      for (let j = skinTriggers.length; j > clamp; j -= 1) {
        skinTriggers = skinTriggers.slice(0, -1);
      }

      triggerData[Triggers.CustomSkin].triggers = skinTriggers;
      this.setState({ triggerData });

      let { skinDropdownIndex } = this.state;

      if (skinDropdownIndex >= clamp) {
        skinDropdownIndex = clamp - 1;
      }

      this.setState({ skinDropdownIndex });
    }

    onZoomSkinEditor(event, isMouseAction) {
      const rect = document.getElementById('skinElementContainer').getBoundingClientRect();
      const { skinEditorZoomProps } = this.state;

      if (isMouseAction) {
        if (skinEditorZoomProps.scale < constraintProps.skinZoomProps.max) {
          skinEditorZoomProps.xOffset = (event.clientX - rect.x) / skinEditorZoomProps.scale;
          skinEditorZoomProps.yOffset = (event.clientY - rect.y) / skinEditorZoomProps.scale;
        }
        skinEditorZoomProps.scale = Math.max(Math.min(
          skinEditorZoomProps.scale - event.deltaY * scrollMultiplier,
          constraintProps.skinZoomProps.max,
        ), constraintProps.skinZoomProps.min);
      } else {
        skinEditorZoomProps.scale = Math.max(Math.min(
          event.target.value,
          constraintProps.skinZoomProps.max,
        ), constraintProps.skinZoomProps.min);
      }

      this.setState({ skinEditorZoomProps });
    }

    onChangeFontSizePreset(fontSizePreset) {
      this.setState({ fontSizePreset });
    }

    onChangeViewport(resolution) {
      this.setState({ resolution });
    }

    // State initialization, populates the triggers with base data

    async onInitializeState() {
      const commands = Object.keys(commandDataTypes);

      if (commands.length === 0) {
        return;
      }

      this.onChangeTab(commands[0]);
      this.setState({ triggerData: this.commandEditor.parser.commandData });
      this.setState({ focuserDropdownIndices: [0] });
      this.setState({ skinEditorZoomProps: { scale: 1 } });
    }

    render() {
      const { initialized } = this.state;
      if (!initialized) return false;
      this.componentManager.updateState(this.state);
      return this.componentManager.main();
    }
  }

  // Adds the mod component to the root UI element

  document.getElementById('content').appendChild(commandEditorParent);

  ReactDOM.render(
    React.createElement(CommandEditorComponent),
    commandEditorParent,
  );
}

if (window.store) {
  main();
} else {
  window.onAppReady = main;
}
