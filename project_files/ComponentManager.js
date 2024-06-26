// eslint-disable-next-line no-unused-vars
class ComponentManager {
  constructor(rc, root) {
    this.rc = rc;
    this.root = root;
    this.state = root.state;
    this.computed = root.computed;
  }

  updateState(nextState) {
    this.state = nextState;
  }

  updateComputed(nextComputed) {
    this.computed = nextComputed;
  }

  main() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: Styles.theme.text },
      rc(
        'button',
        {
          style: {
            ...Styles.buttons.embedded,
            position: 'absolute',
            fontSize: '18px',
          },
          onClick: () => root.onActivate(),
        },
        state.active ? '-' : '+',
      ),
      state.active && rc(
        'div',
        { style: Styles.content },
        this.toolbar(),
        state.settings.active && this.settingsContainer(),
        !state.settings.active && this.tabContainer(),
        !state.settings.active && this.windowContainer(),
        !state.settings.active && this.actionPanel(),
      ),
    );
  }

  toolbar() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: Styles.toolbar.container },
      rc(
        'button',
        {
          style: Styles.buttons.embedded,
          onClick: () => root.onToggleSettings(!state.settings.active),
        },
        rc('span', { style: { position: 'relative' } }, '⚙'),
      ),
      rc(
        'button',
        {
          style: Styles.buttons.embedded,
          onClick: () => window.open(Constants.LINKS.REPORT),
        },
        rc('span', { style: { position: 'relative' } }, '⚑'),
      ),
      rc(
        'button',
        {
          style: Styles.buttons.embedded,
          onClick: () => window.open(Constants.LINKS.HELP),
        },
        rc('span', { style: { position: 'relative' } }, '?'),
      ),
    );
  }

  actionPanel() {
    const { rc, root, state } = this;
    return rc(
      'div',
      {
        style: {
          ...Styles.actionPanel.container,
          fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
        },
      },
      rc(
        'button',
        {
          style: Styles.actionPanel.button,
          onClick: () => root.onLoad(),
        },
        rc('text', null, 'Load'),
      ),
      rc(
        'button',
        {
          style: Styles.actionPanel.button,
          onClick: () => root.onTest(),
        },
        rc('text', null, 'Run'),
      ),
      rc(
        'button',
        {
          style: Styles.actionPanel.button,
          onClick: () => root.onPrint(),
        },
        rc('text', null, 'Print Code'),
      ),
      rc(
        'div',
        { style: Styles.actionPanel.outputContainer },
        rc(
          'div',
          { style: Styles.actionPanel.output },
          rc('text', {
            style: { color: state.actionPanelState.hasError ? 'Red' : 'Black' },
          }, state.actionPanelState.message),
        ),
        rc('button', {
          style: {
            ...Styles.buttons.filled,
            bottom: '0px',
            left: '0px',
            position: 'absolute',
            fontSize: '20px',
          },
          onClick: () => root.onCopyClipboard(),
        }, '🖶'),
        state.actionPanelState.copiedNotify
          && rc('div', { style: Styles.actionPanel.notification }, 'Copied!'),
      ),
    );
  }

  settingsContainer() {
    const { rc } = this;
    return rc(
      'div',
      { style: Styles.settings.window },
      this.settingsHeader(),
      this.settings(),
    );
  }

  settingsHeader() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: Styles.settings.header },
      rc(
        'button',
        {
          style: {
            ...Styles.buttons.embedded,
            position: 'absolute',
            fontSize: '32px',
            right: '0px',
          },
          onClick: () => root.onToggleSettings(false),
        },
        rc('span', { style: { fontWeight: 700 } }, 'X'),
      ),
      rc('text', {
        style: {
          fontSize: Styles.theme.textSizes.L[state.settings.fontSize],
        },
      }, 'Settings'),
      rc('button', {
        style: {
          ...Styles.buttons.settings,
          position: 'absolute',
          fontSize: Styles.theme.textSizes.M[state.settings.fontSize],
          left: '0px',
          background: state.unsavedSettings.dirty
            ? Styles.theme.light_gray3
            : Styles.theme.dark_gray1,
        },
        disabled: !state.unsavedSettings.dirty,
        onClick: () => root.onApplySettings(),
      }, 'Apply'),
    );
  }

  settings() {
    const { rc, root, state } = this;
    return rc(
      window.React.Fragment,
      { style: { fontSize: Styles.theme.textSizes.M[state.settings.fontSize] } },
      rc(
        'div',
        { style: Styles.settings.row },
        rc('text', {
          style: {
            ...Styles.settings.label,
            fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
          },
        }, 'Font Sizes'),
        rc(
          'div',
          {
            style: {
              ...Styles.settings.parameter,
              fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
            },
          },
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === Constants.SETTINGS.FONT_SIZES.SMALL
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeFontSize(Constants.SETTINGS.FONT_SIZES.SMALL),
          }, rc('text', null, 'Small')),
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === Constants.SETTINGS.FONT_SIZES.MEDIUM
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeFontSize(Constants.SETTINGS.FONT_SIZES.MEDIUM),
          }, rc('text', null, 'Medium')),
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.fontSize === Constants.SETTINGS.FONT_SIZES.LARGE
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeFontSize(Constants.SETTINGS.FONT_SIZES.LARGE),
          }, rc('text', null, 'Large')),
        ),
      ),
      rc(
        'div',
        { style: Styles.settings.row },
        rc('text', {
          style: {
            ...Styles.settings.label,
            fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
          },
        }, 'Viewport'),
        rc(
          'div',
          {
            style: {
              ...Styles.settings.parameter,
              fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
            },
          },
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.resolution === Constants.SETTINGS.VIEWPORT.HD.ID
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeViewport(Constants.SETTINGS.VIEWPORT.HD.ID),
          }, rc('text', null, Constants.SETTINGS.VIEWPORT.HD.NAME)),
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.resolution === Constants.SETTINGS.VIEWPORT.FHD.ID
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeViewport(Constants.SETTINGS.VIEWPORT.FHD.ID),
          }, rc('text', null, Constants.SETTINGS.VIEWPORT.FHD.NAME)),
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.resolution === Constants.SETTINGS.VIEWPORT.QHD.ID
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeViewport(Constants.SETTINGS.VIEWPORT.QHD.ID),
          }, rc('text', null, Constants.SETTINGS.VIEWPORT.QHD.NAME)),
          rc('button', {
            style: {
              ...Styles.buttons.settings,
              backgroundColor:
                state.unsavedSettings.resolution === Constants.SETTINGS.VIEWPORT.UHD.ID
                  ? Styles.theme.light_gray1 : Styles.theme.dark_gray1,
            },
            onClick: () => root.onChangeViewport(Constants.SETTINGS.VIEWPORT.UHD.ID),
          }, rc('text', null, Constants.SETTINGS.VIEWPORT.UHD.NAME)),
        ),
      ),
    );
  }

  tabContainer() {
    const { rc } = this;
    return rc(
      'div',
      { style: Styles.tabs.container },
      Object.keys(
        Constants.TRIGGER_PROPS,
      ).map((command) => rc(
        'div',
        null,
        this.tab(command),
      )),
    );
  }

  tab(tabID) {
    const { rc, root, state } = this;
    return rc('button', {
      style: {
        ...Styles.tabs.button,
        backgroundColor:
          state.activeTab === tabID
            ? Styles.theme.light_gray1
            : Styles.theme.dark_gray1,
      },
      onClick: () => root.onChangeTab(tabID),
    }, rc(
      'text',
      { style: { fontSize: Styles.theme.textSizes.S[state.settings.fontSize] } },
      Constants.TRIGGER_PROPS[tabID].DISPLAY_NAME,
    ));
  }

  windowContainer() {
    const { state } = this;
    return this.window(state.triggerData[state.activeTab]);
  }

  window(data) {
    const { rc, state } = this;
    if (data.id === Constants.TRIGGER_TYPES.SKIN) {
      return rc(
        'div',
        { style: Styles.window },
        this.skinEditorToolbar(data.triggers, state.skinEditorState.ddIndex),
        this.skinEditor(data),
      );
    }

    return rc(
      'div',
      { style: Styles.window },
      this.smoothTab(state.triggerData[state.activeTab]),
      rc(
        'div',
        null,
        Object.keys(data.triggers).map((i) => this.trigger(data, parseInt(i, 10))),
      ),
    );
  }

  smoothTab(data) {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: Styles.smooth.container },
      rc('label', {
        for: 'smoothTextInput',
        style: { fontSize: Styles.theme.textSizes.S[state.settings.fontSize] },
      }, 'Smoothing'),
      data.id !== Constants.TRIGGER_TYPES.TIME && rc('input', {
        id: 'smoothTextInput',
        style: {
          ...Styles.smooth.input,
          fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
          marginLeft: '5px',
        },
        value: data.smoothing,
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value,
          },
          ['smoothing'],
          Constants.CONSTRAINTS.SMOOTH,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value,
          },
          ['smoothing'],
          Constants.CONSTRAINTS.SMOOTH,
          true,
        ),
      }),
      data.id === Constants.TRIGGER_TYPES.TIME && rc(
        'div',
        { style: Styles.checkbox.container },
        rc('input', {
          id: 'smoothTextInput',
          style: Styles.checkbox.primary,
          type: 'checkbox',
          onChange: () => root.onUpdateTrigger(
            {
              prev: state.triggerData[state.activeTab].interpolate,
              new: !state.triggerData[state.activeTab].interpolate,
            },
            ['interpolate'],
            Constants.CONSTRAINTS.INTERPOLATE,
          ),
        }),
        data.interpolate && rc('square', { style: Styles.checkbox.fill }),
      ),
    );
  }

  trigger(data, index) {
    const { rc, root, state } = this;
    const triggerData = data.triggers[index];

    return rc(
      'div',
      {
        style: {
          ...Styles.trigger.container,
          fontSize: Styles.theme.textSizes.M[state.settings.fontSize],
          backgroundColor: index === 0 ? Styles.theme.gray : Styles.theme.white,
        },
      },
      rc(
        'button',
        {
          style: {
            ...Styles.buttons.embedded,
            fontSize: '22px',
            position: 'absolute',
            right: '0px',
          },
          disabled: index === 0,
          onClick: () => root.onDeleteTrigger(index),
        },
        rc('span', {
          style: {
            color: index === 0 ? Styles.theme.dark_gray2 : Styles.theme.black,
          },
        }, 'X'),
      ),
      this.timeStamp(triggerData[0], index),
      data.id === Constants.TRIGGER_TYPES.ZOOM && this.zoomTrigger(triggerData, index),
      data.id === Constants.TRIGGER_TYPES.PAN && this.cameraPanTrigger(triggerData, index),
      data.id === Constants.TRIGGER_TYPES.FOCUS && this.cameraFocusTrigger(triggerData, index),
      data.id === Constants.TRIGGER_TYPES.TIME && this.timeRemapTrigger(triggerData, index),
      data.id === Constants.TRIGGER_TYPES.SKIN && false,
      rc(
        'button',
        {
          style: Styles.trigger.createButton,
          onClick: () => root.onCreateTrigger(index),
        },
        rc('span', {
          style: {
            fontSize: '22px',
            fontWeight: 900,
          },
        }, '+'),
      ),
    );
  }

  timeStamp(data, index) {
    const { rc, root, computed } = this;
    const tProps = [
      Constants.CONSTRAINTS.MINUTE,
      Constants.CONSTRAINTS.SECOND,
      Constants.CONSTRAINTS.FRAME,
    ];

    if (!Array.isArray(data)) {
      return false;
    }

    return rc(
      'div',
      { style: Styles.trigger.property },
      data.map((timeValue, timeIndex) => rc(
        'div',
        null,
        rc(
          'text',
          { style: Styles.trigger.text },
          ['TIME', ':', ':'][timeIndex],
        ),
        rc('input', {
          style: {
            ...Styles.trigger.input,
            color: computed.invalidTimes[index] ? 'red' : 'black',
          },
          value: timeValue,
          onChange: (e) => root.onUpdateTrigger(
            {
              prev: timeValue,
              new: e.target.value,
            },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex],
          ),
          onBlur: (e) => root.onUpdateTrigger(
            {
              prev: timeValue,
              new: e.target.value,
            },
            ['triggers', index, 0, timeIndex],
            tProps[timeIndex],
            true,
          ),
        }),
      )),
    );
  }

  zoomTrigger(data, index) {
    const { rc, root } = this;
    const labels = ['ZOOM TO'];

    return rc(
      'div',
      { style: Styles.trigger.property },
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: Styles.trigger.text,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: Styles.trigger.input,
        value: data[1],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          Constants.CONSTRAINTS.ZOOM,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          Constants.CONSTRAINTS.ZOOM,
          true,
        ),
      }),
    );
  }

  cameraPanTrigger(data, index) {
    const { rc, root } = this;
    const cProps = [
      Constants.CONSTRAINTS.PAN_WIDTH,
      Constants.CONSTRAINTS.PAN_HEIGHT,
      Constants.CONSTRAINTS.PAN_X,
      Constants.CONSTRAINTS.PAN_Y,
    ];
    const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET'];

    return rc(
      window.React.Fragment,
      null,
      [['w', 'h'], ['x', 'y']].map((pair, pairIndex) => rc(
        'div',
        { style: { display: 'flex', flexDirection: 'row' } },
        pair.map((prop, propIndex) => rc(
          'div',
          { style: Styles.trigger.property },
          rc('label', {
            for: `triggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: Styles.trigger.text,
          }, labels[propIndex + 2 * pairIndex]),
          rc('input', {
            id: `triggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: Styles.trigger.input,
            value: data[1][prop],
            onChange: (e) => root.onUpdateTrigger(
              { prev: data[1][prop], new: e.target.value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex],
            ),
            onBlur: (e) => root.onUpdateTrigger(
              { prev: data[1][prop], new: e.target.value },
              ['triggers', index, 1, prop],
              cProps[propIndex + 2 * pairIndex],
              true,
            ),
          }),
        )),
      )),
    );
  }

  cameraFocusTrigger(data, index) {
    const { rc, root, state } = this;
    const ddIndex = state.focusDDIndices[index];
    const labels = ['WEIGHT'];

    return rc(
      'div',
      { style: Styles.trigger.property },
      rc(
        'select',
        {
          style: Styles.dropdown.head,
          value: ddIndex,
          onChange: (e) => root.onChangeFocusDD(index, e.target.value),
        },
        Object.keys(data[1]).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return rc('option', {
            style: Styles.dropdown.option,
            value: parseInt(riderIndex, 10),
          }, rc('text', null, `Rider ${riderNum}`));
        }),
      ),
      rc('label', {
        for: `triggerText_${labels[0]}_${ddIndex}_${index}`,
        style: Styles.trigger.text,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${ddIndex}_${index}`,
        style: Styles.trigger.input,
        value: data[1][ddIndex],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1][ddIndex],
            new: e.target.value,
          },
          ['triggers', index, 1, ddIndex],
          Constants.CONSTRAINTS.FOCUS_WEIGHT,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1][ddIndex],
            new: e.target.value,
          },
          ['triggers', index, 1, ddIndex],
          Constants.CONSTRAINTS.FOCUS_WEIGHT,
          true,
        ),
      }),
    );
  }

  timeRemapTrigger(data, index) {
    const { rc, root } = this;
    const labels = ['SPEED'];

    return rc(
      'div',
      { style: Styles.trigger.property },
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: Styles.trigger.text,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: Styles.trigger.input,
        value: data[1],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          Constants.CONSTRAINTS.TIME_SPEED,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          Constants.CONSTRAINTS.TIME_SPEED,
          true,
        ),
      }),
    );
  }

  skinEditor(data) {
    const { rc, root, state } = this;
    const { ddIndex } = state.skinEditorState;

    return rc(
      'div',
      { style: Styles.skinEditor.container },
      rc('div', { style: Styles.skinEditor.background }),
      rc(
        'div',
        {
          id: 'skinElementContainer',
          style: {
            ...Styles.skinEditor.canvas,
            transform: `scale(${state.skinEditorState.zoom.scale})`,
            transformOrigin: `${state.skinEditorState.zoom.xOffset}px ${state.skinEditorState.zoom.yOffset}px`,
          },
          onWheel: (e) => root.onZoomSkinEditor(e, true),
        },
        this.flagSvg(data.triggers[ddIndex], ddIndex),
        rc('svg', { width: '10vw' }),
        this.riderSvg(data.triggers[ddIndex], ddIndex),
      ),
      rc(
        'div',
        { style: Styles.skinEditor.zoomContainer },
        rc('input', {
          style: { height: '10px' },
          type: 'range',
          orient: 'vertical',
          min: Constants.CONSTRAINTS.SKIN_ZOOM.MIN,
          max: Constants.CONSTRAINTS.SKIN_ZOOM.MAX,
          step: 0.1,
          value: state.skinEditorState.zoom.scale,
          onChange: (e) => root.onZoomSkinEditor(e, false),
        }),
        rc(
          'text',
          { style: { fontSize: Styles.theme.textSizes.S[state.settings.fontSize] } },
          `x${Math.round(state.skinEditorState.zoom.scale * 10) / 10}`,
        ),
      ),
      rc(
        'div',
        { style: Styles.skinEditor.outlineColor.container },
        rc('text', { style: { fontSize: Styles.theme.textSizes.S[state.settings.fontSize] } }, 'Outline'),
        rc('div', {
          style: {
            ...Styles.skinEditor.outlineColor.input,
            backgroundColor: data.triggers[ddIndex].outline.stroke,
          },
          onClick: () => root.onUpdateTrigger(
            { new: state.skinEditorState.color },
            ['triggers', ddIndex, 'outline', 'stroke'],
          ),
        }),
      ),
    );
  }

  skinEditorToolbar(data, index) {
    const { rc, root, state } = this;
    const colorValue = state.skinEditorState.color.substring(0, 7);
    const alphaValue = parseInt(state.skinEditorState.color.substring(7), 16) / 255;

    return rc(
      'div',
      { style: Styles.skinEditor.toolbar },
      rc(
        'button',
        {
          style: {
            ...Styles.buttons.embedded,
            fontSize: '32px',
            position: 'absolute',
            right: '10px',
          },
          onClick: () => root.onResetSkin(index),
        },
        rc('span', {
          style: { color: 'red', fontWeight: 700 },
        }, 'X'),
      ),
      rc(
        'div',
        {
          style: {
            ...Styles.skinEditor.toolbarItem,
            ...Styles.alpha.container,
            fontSize: Styles.theme.textSizes.S[state.settings.fontSize],
          },
        },
        rc('label', { for: 'alphaSlider' }, 'Transparency'),
        rc(
          'div',
          { style: Styles.alpha.sliderContainer },
          rc('text', null, '0%'),
          rc('input', {
            id: 'alphaSlider',
            style: Styles.alpha.slider,
            type: 'range',
            min: Constants.CONSTRAINTS.ALPHA_SLIDER.MIN,
            max: Constants.CONSTRAINTS.ALPHA_SLIDER.MAX,
            step: 0.01,
            value: alphaValue,
            onChange: (e) => root.onChangeColor(null, e.target.value),
          }),
          rc('text', null, '100%'),
        ),
      ),
      rc('input', {
        style: {
          ...Styles.skinEditor.toolbarItem,
          height: '40px',
          width: '40px',
        },
        type: 'color',
        value: colorValue,
        onChange: (e) => root.onChangeColor(e.target.value, null),
      }),
      rc(
        'select',
        {
          style: {
            ...Styles.skinEditor.toolbarItem,
            ...Styles.dropdown.head,
            fontSize: Styles.theme.textSizes.M[state.settings.fontSize],
          },
          value: index,
          onChange: (e) => root.onChangeSkinDD(e.target.value),
        },
        Object.keys(data).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return rc('option', {
            style: Styles.dropdown.option,
            value: parseInt(riderIndex, 10),
          }, rc('text', null, `Rider ${riderNum}`));
        }),
      ),
    );
  }

  flagSvg(data, index) {
    const { rc, root, state } = this;
    return rc(
      'svg',
      { style: Styles.skinEditor.flagSvg },
      rc('path', {
        ...Styles.riderProps.flag,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'flag', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.flagOutline,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'flag', 'fill']),
      }),
    );
  }

  riderSvg(data, index) {
    const { rc, root, state } = this;
    return rc(
      'svg',
      { style: Styles.skinEditor.riderSvg },
      rc('rect', {
        ...Styles.riderProps.skin,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'skin', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.nose,
        stroke: data.outline.stroke,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'skin', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.hair,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'hair', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.faceOutline,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'hair', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.hairFill,
        fill: data.fill.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'fill', 'fill']),
      }),
      rc('polygon', {
        ...Styles.riderProps.eye,
        fill: data.eye.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'eye', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.sled,
        stroke: data.outline.stroke,
        fill: data.sled.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'sled', 'fill']),
      }),
      rc('line', {
        ...Styles.riderProps.string,
        stroke: data.string.stroke,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'string', 'stroke']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.armHand,
        stroke: data.outline.stroke,
        fill: data.armHand.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'armHand', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.legPants,
        stroke: data.outline.stroke,
        fill: data.legPants.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'legPants', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.legFoot,
        stroke: data.outline.stroke,
        fill: data.legFoot.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'legFoot', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfEven,
        ...Styles.riderProps.id_scarf0a,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf0', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfEven,
        ...Styles.riderProps.id_scarf0b,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf0', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfOdd,
        ...Styles.riderProps.id_scarf1,
        fill: data.id_scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf1', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfOdd,
        ...Styles.riderProps.id_scarf2,
        fill: data.id_scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf2', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfOdd,
        ...Styles.riderProps.id_scarf3,
        fill: data.id_scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf3', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfOdd,
        ...Styles.riderProps.id_scarf4,
        fill: data.id_scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf4', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.id_scarfOdd,
        ...Styles.riderProps.id_scarf5,
        fill: data.id_scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'id_scarf5', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.torso,
        stroke: data.outline.stroke,
        fill: data.torso.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'torso', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.scarfOdd,
        ...Styles.riderProps.scarf1,
        fill: data.scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'scarf1', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.scarfOdd,
        ...Styles.riderProps.scarf2,
        fill: data.scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'scarf2', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.scarfOdd,
        ...Styles.riderProps.scarf3,
        fill: data.scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'scarf3', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.scarfOdd,
        ...Styles.riderProps.scarf4,
        fill: data.scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'scarf4', 'fill']),
      }),
      rc('rect', {
        ...Styles.riderProps.scarfOdd,
        ...Styles.riderProps.scarf5,
        fill: data.scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'scarf5', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.hatTop,
        stroke: data.outline.stroke,
        fill: data.hatTop.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'hatTop', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.hatBottom,
        stroke: data.hatBottom.stroke,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'hatBottom', 'stroke']),
      }),
      rc('circle', {
        ...Styles.riderProps.hatBall,
        fill: data.hatBall.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'hatBall', 'fill']),
      }),
      rc('path', {
        ...Styles.riderProps.outline,
        ...Styles.riderProps.armSleeve,
        stroke: data.outline.stroke,
        fill: data.armSleeve.fill,
        onClick: () => root.onUpdateTrigger({ new: state.skinEditorState.color }, ['triggers', index, 'armSleeve', 'fill']),
      }),
    );
  }
}
