// eslint-disable-next-line no-unused-vars
function InitComponentClass() {
  const { store, React } = window;

  return class CommandEditorComponent extends React.Component {
    constructor() {
      super();

      this.state = {
        active: false,
        initialized: false,
        actionPanelState: {
          hasError: false,
          message: '',
          copiedNotify: false,
        },
        activeTab: Constants.TRIGGER_TYPES.ZOOM,
        triggerData: {},
        focuserDropdownIndices: [0],
        skinEditorState: {
          dropdownIndex: 0,
          zoom: { scale: 1 },
          color: '#000000ff',
        },
        settings: {
          fontSize: Constants.SETTINGS.FONT_SIZES.MEDIUM,
          resolution: Constants.SETTINGS.VIEWPORT.HD.ID,
          active: false,
        },
        unsavedSettings: {
          fontSize: Constants.SETTINGS.FONT_SIZES.MEDIUM,
          resolution: Constants.SETTINGS.VIEWPORT.HD.ID,
          dirty: false,
        },
      };

      this.computed = {
        invalidTimes: [],
        riderCount: 1,
        script: '',
      };

      this.componentManager = new ComponentManager(React.createElement, this);
      this.parser = new Parser();

      store.subscribe(() => {
        const riderCount = Selectors.getNumRiders(store.getState());

        if (this.computed.riderCount !== riderCount) {
          this.computed.riderCount = riderCount;
          this.onAdjustFocuserWeightArrays(riderCount);
          this.onAdjustFocuserDropdownLengths(riderCount);
          this.onAdjustSkinArray(riderCount);
          this.onAdjustSkinDropdownLength(riderCount);
        }

        const script = Selectors.getCurrentScript(store.getState());

        if (this.computed.script !== script) {
          this.computed.script = script;
        }

        const sidebarOpen = Selectors.getSidebarOpen(store.getState());

        if (sidebarOpen) {
          this.setState({ active: false });
        }

        const playerRunning = Selectors.getPlayerRunning(store.getState());
        const windowFocused = Selectors.getWindowFocused(store.getState());

        const shouldBeVisible = window.CMD_EDITOR_DEBUG || (!playerRunning && windowFocused);

        document.getElementById(Constants.ROOT_NODE_ID).style.opacity = shouldBeVisible ? 1 : 0;
        document.getElementById(Constants.ROOT_NODE_ID).style.pointerEvents = shouldBeVisible ? null : 'none';
      });
    }

    componentDidMount() {
      Object.assign(document.getElementById(Constants.ROOT_NODE_ID).style, Styles.root);
      this.onInitializeState().then(() => {
        this.setState({ initialized: true });
      });
    }

    async onInitializeState() {
      this.setState({ triggerData: this.parser.commandData });
    }

    onCreateTrigger(index) {
      const { triggerData, activeTab } = this.state;
      const commandData = triggerData[activeTab];
      const newTrigger = structuredClone(commandData.triggers[index]);

      const currentIndex = Selectors.getPlayerIndex(store.getState());
      newTrigger[0] = [
        Math.floor(currentIndex / 2400),
        Math.floor((currentIndex % 2400) / 40),
        Math.floor(currentIndex % 40),
      ];

      triggerData[activeTab].triggers.splice(index + 1, 0, newTrigger);

      if (activeTab === Constants.TRIGGER_TYPES.FOCUS) {
        this.onAdjustDropdownArrayIndexLength(triggerData[activeTab].triggers.length);
      }

      this.setState({ triggerData });
    }

    onUpdateTrigger(valueChange, path, constraints, bounded = false) {
      const { triggerData, activeTab } = this.state;
      let pathPointer = triggerData[activeTab];

      for (let i = 0; i < path.length - 1; i += 1) {
        pathPointer = pathPointer[path[i]];
      }

      pathPointer[path[path.length - 1]] = Validator.validateData(
        valueChange,
        constraints,
        bounded,
      );

      this.setState({ triggerData });
    }

    onDeleteTrigger(index) {
      const { triggerData, activeTab } = this.state;

      triggerData[activeTab].triggers = triggerData[activeTab].triggers.filter(
        (_, i) => index !== i,
      );

      if (activeTab === Constants.TRIGGER_TYPES.FOCUS) {
        this.onAdjustDropdownArrayIndexLength(triggerData[activeTab].triggers.length);
      }

      this.setState({ triggerData });
    }

    onRead() {
      const { actionPanelState } = this.state;
      try {
        if (actionPanelState.hasError) {
          actionPanelState.message = '';
        }

        this.parser.parseScript(this.computed.script);
        const triggerData = this.parser.commandData;
        this.onAdjustDropdownArrayIndexLength(
          triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers.length,
        );
        this.setState({ triggerData });
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onTest() {
      const { activeTab, triggerData, actionPanelState } = this.state;
      try {
        const script = ScriptGenerator.generateScript(activeTab, triggerData);
        // HACK: Already evaluated script, execute it directly
        // eslint-disable-next-line no-eval
        eval.call(window, script);
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onPrint() {
      const { activeTab, triggerData, actionPanelState } = this.state;
      try {
        actionPanelState.message = ScriptGenerator.generateScript(activeTab, triggerData);
        actionPanelState.hasError = false;
      } catch (error) {
        actionPanelState.message = `Error: ${error.message}`;
        actionPanelState.hasError = true;
      }

      this.setState({ actionPanelState });
    }

    onResetSkin(index) {
      const { triggerData } = this.state;
      if (!window.confirm('Are you sure you want to reset the current rider\'s skin?')) return;

      triggerData.CustomSkin.triggers[index] = structuredClone(
        Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
      );

      this.setState({ triggerData });
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
        return;
      }

      window.navigator.clipboard.writeText(actionPanelState.message);

      actionPanelState.copiedNotify = true;

      if (this.computed.timer) {
        clearTimeout(this.computed.timer);
      }

      this.computed.timer = window.setTimeout(() => this.onDisableCopyNotification(), 1000);

      this.setState({ actionPanelState });
    }

    onDisableCopyNotification() {
      const { actionPanelState } = this.state;
      actionPanelState.copiedNotify = false;
      this.setState({ actionPanelState });
    }

    onActivate() {
      const { active } = this.state;
      const sidebarOpen = Selectors.getSidebarOpen(store.getState());

      if (!active && sidebarOpen) {
        store.dispatch(Actions.closeSidebar());
      }

      this.setState({ active: !active });
    }

    onChangeTab(tabName) {
      this.setState({ activeTab: tabName });
    }

    onToggleSettings(active) {
      const { unsavedSettings, settings } = this.state;

      if (!active && unsavedSettings.dirty) {
        if (!window.confirm('Discard changes?')) return;
        Object.assign(unsavedSettings, settings);
        unsavedSettings.dirty = false;
      }

      settings.active = active;

      this.setState({ unsavedSettings });
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
    }

    onSaveViewport(oldResolution, newResolution) {
      const { triggerData } = this.state;

      const factor = Math.log2(
        Constants.SETTINGS.VIEWPORT[newResolution].SIZE[0]
        / Constants.SETTINGS.VIEWPORT[oldResolution].SIZE[0],
      );

      const size = Constants.SETTINGS.VIEWPORT[newResolution].SIZE;
      store.dispatch(Actions.setPlaybackDimensions({ width: size[0], height: size[1] }));

      triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers.forEach((_, i) => {
        triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] = Math.round((
          triggerData[Constants.TRIGGER_TYPES.ZOOM].triggers[i][1] + factor + Number.EPSILON
        ) * 10e6) / 10e6;
      });

      this.setState({ triggerData });
    }

    onApplySettings() {
      const { unsavedSettings, settings } = this.state;

      this.onSaveViewport(settings.resolution, unsavedSettings.resolution);

      settings.fontSize = unsavedSettings.fontSize;
      settings.resolution = unsavedSettings.resolution;
      unsavedSettings.dirty = false;

      this.setState({ settings });
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

    onAdjustFocuserWeightArrays(riderCount) {
      const { triggerData } = this.state;
      const focusTriggers = triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers;

      focusTriggers.forEach((_, i) => {
        const oldLength = focusTriggers[i][1].length;

        if (oldLength < riderCount) {
          focusTriggers[i][1].push(...Array(riderCount - oldLength).fill(0));
        }
        if (oldLength > riderCount) {
          focusTriggers[i][1].splice(riderCount, oldLength - riderCount);
        }
      });

      triggerData[Constants.TRIGGER_TYPES.FOCUS].triggers = focusTriggers;
      this.setState({ triggerData });
    }

    onAdjustFocuserDropdownLengths(riderCount) {
      const { focuserDropdownIndices } = this.state;

      focuserDropdownIndices.forEach((_, i) => {
        if (focuserDropdownIndices[i] >= riderCount) {
          focuserDropdownIndices[i] = riderCount - 1;
        }
      });

      this.setState({ focuserDropdownIndices });
    }

    onAdjustDropdownArrayIndexLength(triggerLength) {
      const { focuserDropdownIndices } = this.state;
      const oldLength = focuserDropdownIndices.length;

      if (oldLength < triggerLength) {
        focuserDropdownIndices.push(...Array(triggerLength - oldLength).fill(0));
      }
      if (oldLength > triggerLength) {
        focuserDropdownIndices.splice(triggerLength, oldLength - triggerLength);
      }

      this.setState({ focuserDropdownIndices });
    }

    onAdjustSkinArray(riderCount) {
      const { triggerData } = this.state;
      const skinTriggers = triggerData[Constants.TRIGGER_TYPES.SKIN].triggers;
      const oldLength = skinTriggers.length;

      if (oldLength < riderCount) {
        skinTriggers.push(...Array(riderCount - oldLength).fill(structuredClone(
          Constants.TRIGGER_PROPS[Constants.TRIGGER_TYPES.SKIN].TEMPLATE,
        )));
      }

      if (oldLength > riderCount) {
        skinTriggers.splice(riderCount, oldLength - riderCount);
      }

      triggerData[Constants.TRIGGER_TYPES.SKIN].triggers = skinTriggers;
      this.setState({ triggerData });
    }

    onAdjustSkinDropdownLength(riderCount) {
      const { skinEditorState } = this.state;

      if (skinEditorState.dropdownIndex >= riderCount) {
        skinEditorState.dropdownIndex = riderCount - 1;
      }

      this.setState({ skinEditorState });
    }

    onZoomSkinEditor(event, isMouseAction) {
      const { skinEditorState } = this.state;
      const rect = document.getElementById('skinElementContainer').getBoundingClientRect();

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

    updateComputed() {
      const { triggerData, activeTab } = this.state;
      if (activeTab !== Constants.TRIGGER_TYPES.SKIN) {
        this.computed.invalidTimes = Validator.validateTimes(triggerData[activeTab]);
      }
    }

    render() {
      const { initialized } = this.state;
      if (!initialized) return false;

      this.updateComputed();

      this.componentManager.updateState(this.state);
      this.componentManager.updateComputed(this.computed);

      return this.componentManager.main();
    }
  };
}
