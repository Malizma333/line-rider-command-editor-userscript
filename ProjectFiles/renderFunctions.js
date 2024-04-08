class ComponentManager {
  constructor(rc, root) {
    this.rc = rc;
    this.root = root;
    this.state = root.state;
  }

  updateState(nextState) {
    this.state = nextState;
  }

  main() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: textGlobal },
      rc(
        'div',
        state.active && { style: expandedWindow },
        rc(
          'button',
          {
            style: squareButtonStyle,
            onClick: () => root.onActivate(),
          },
          rc(
            'span',
            { style: { fontSize: '32px' } },
            state.active ? '-' : '+',
          ),
        ),
        rc(
          'div',
          !state.active && { style: { display: 'none' } },
          this.toolbar(),
          this.activeArea(),
          this.readWrite(),
        ),
      ),
    );
  }

  toolbar() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: toolbarStyle },
      rc(
        'button',
        {
          style: squareButtonStyle,
          onClick: () => root.onToggleSettings(!state.settingsActive),
        },
        rc('span', { style: toolbarButtonText }, '⚙'),
      ),
      rc(
        'button',
        {
          style: squareButtonStyle,
          onClick: () => window.open(reportLink),
        },
        rc('span', { style: toolbarButtonText }, '⚑'),
      ),
      rc(
        'button',
        {
          style: squareButtonStyle,
          onClick: () => window.open(helpLink),
        },
        rc('span', { style: toolbarButtonText }, '?'),
      ),
    );
  }

  readWrite() {
    const { rc, root, state } = this;
    return rc(
      'div',
      {
        style: {
          ...readWriteContainerStyle,
          fontSize: textStyle.S[state.fontSizePreset],
        },
      },
      rc(
        'button',
        {
          style: {
            ...readWriteButtonStyle,
          },
          onClick: () => root.onRead(),
        },
        rc('text', null, 'Load'),
      ),
      rc(
        'button',
        {
          style: {
            ...readWriteButtonStyle,
          },
          onClick: () => root.onTest(),
        },
        rc('text', null, 'Run'),
      ),
      rc(
        'button',
        {
          style: {
            ...readWriteButtonStyle,
          },
          onClick: () => root.onPrint(),
        },
        rc('text', null, 'Print Code'),
      ),
      rc(
        'div',
        { style: dataContainerStyle },
        rc('text', {
          style: {
            ...dataTextStyle,
            color: state.hasError ? 'Red' : 'Black',
          },
        }, state.message),
        rc('button', {
          style: { ...squareFilledButtonStyle, bottom: '17px' },
          onClick: () => root.onCopyClipboard(),
        }, '🖶'),
      ),
    );
  }

  activeArea() {
    const { rc, state } = this;
    return rc(
      'div',
      null,
      !state.settingsActive && this.tabContainer(),
      !state.settingsActive && this.activeWindow(),
      state.settingsActive && this.settingsContainer(),
    );
  }

  settingsContainer() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: settingsWindowStyle },
      rc(
        'button',
        {
          style: {
            ...squareButtonStyle,
            margin: '5px',
            position: 'absolute',
            right: '0px',
          },
          onClick: () => root.onToggleSettings(false),
        },
        rc('span', { style: { fontSize: '32px', fontWeight: 700 } }, 'X'),
      ),
      rc('text', {
        style: {
          ...settingsTitleStyle,
          fontSize: textStyle.L[state.fontSizePreset],
        },
      }, 'Settings'),
      this.settings(),
    );
  }

  settings() {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: { fontSize: textStyle.M[state.fontSizePreset] } },
      rc(
        'div',
        { style: settingsRowStyle },
        rc('label', { for: 'fontSizePreset', style: settingsLabelStyle }, 'Font Sizes'),
        rc(
          'div',
          { style: settingsParameterStyle },
          rc('text', { style: { fontSize: textStyle.S[state.fontSizePreset] } }, 'Small'),
          rc('input', {
            id: 'fontSizePreset',
            style: { margin: '5px' },
            type: 'range',
            min: constraintProps.textSizeProps.min,
            max: constraintProps.textSizeProps.max,
            step: 1,
            value: state.fontSizePreset,
            onChange: (e) => root.onChangeFontSizePreset(e.target.value),
          }),
          rc('text', { style: { fontSize: textStyle.S[state.fontSizePreset] } }, 'Large'),
        ),
      ),
      rc(
        'div',
        { style: settingsRowStyle },
        rc('text', { style: settingsLabelStyle }, 'Viewport'),
        rc(
          'div',
          {
            style: {
              ...settingsParameterStyle,
              fontSize: textStyle.S[state.fontSizePreset],
            },
          },
          rc('button', {
            style: {
              ...settingsButtonStyle,
              backgroundColor:
                state.resolution === viewportSizes.HD
                  ? colorTheme.lightgray1 : colorTheme.darkgray1,
            },
            onClick: () => root.onChangeViewport(viewportSizes.HD),
          }, rc('text', null, viewportSizes.HD)),
          rc('button', {
            style: {
              ...settingsButtonStyle,
              backgroundColor:
                state.resolution === viewportSizes.FHD
                  ? colorTheme.lightgray1 : colorTheme.darkgray1,
            },
            onClick: () => root.onChangeViewport(viewportSizes.FHD),
          }, rc('text', null, viewportSizes.FHD)),
          rc('button', {
            style: {
              ...settingsButtonStyle,
              backgroundColor:
                state.resolution === viewportSizes.QHD
                  ? colorTheme.lightgray1 : colorTheme.darkgray1,
            },
            onClick: () => root.onChangeViewport(viewportSizes.QHD),
          }, rc('text', null, viewportSizes.QHD)),
          rc('button', {
            style: {
              ...settingsButtonStyle,
              backgroundColor:
                state.resolution === viewportSizes.UHD
                  ? colorTheme.lightgray1 : colorTheme.darkgray1,
            },
            onClick: () => root.onChangeViewport(viewportSizes.UHD),
          }, rc('text', null, viewportSizes.UHD)),
        ),
      ),
    );
  }

  tabContainer() {
    const { rc } = this;
    return rc(
      'div',
      { style: tabHeaderStyle },
      Object.keys(
        commandDataTypes,
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
        ...tabButtonStyle,
        backgroundColor:
          state.activeTab === tabID
            ? colorTheme.lightgray1
            : colorTheme.darkgray1,
      },
      onClick: () => root.onChangeTab(tabID),
    }, rc(
      'text',
      { style: { fontSize: textStyle.S[state.fontSizePreset] } },
      commandDataTypes[tabID].displayName,
    ));
  }

  activeWindow() {
    const { state } = this;
    return this.window(state.triggerData[state.activeTab]);
  }

  window(data) {
    const { rc } = this;
    if (data.id === Triggers.CustomSkin) {
      return this.skinEditor(data);
    }

    return rc(
      'div',
      null,
      this.smoothTab(data),
      rc(
        'div',
        { style: triggerWindowStyle },
        Object.keys(data.triggers).map((i) => this.trigger(data, parseInt(i, 10))),
      ),
    );
  }

  smoothTab(data) {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: smoothTabStyle },
      rc('label', {
        for: 'smoothTextInput',
        style: { fontSize: textStyle.S[state.fontSizePreset] },
      }, 'Smoothing'),
      data.id !== Triggers.TimeRemap && rc('input', {
        id: 'smoothTextInput',
        style: {
          ...smoothTextInputStyle,
          fontSize: textStyle.S[state.fontSizePreset],
          marginLeft: '5px',
        },
        value: data.smoothing,
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value,
          },
          ['smoothing'],
          constraintProps.smoothProps,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: e.target.value,
          },
          ['smoothing'],
          constraintProps.smoothProps,
          true,
        ),
      }),
      data.id === Triggers.TimeRemap && rc(
        'div',
        { style: checkboxDivStyle },
        rc('input', {
          style: checkboxStyle,
          type: 'checkbox',
          onChange: () => root.onUpdateTrigger(
            {
              prev: state.triggerData[state.activeTab].interpolate,
              new: !state.triggerData[state.activeTab].interpolate,
            },
            ['interpolate'],
            constraintProps.interpolateProps,
          ),
        }),
        data.interpolate && rc('square', { style: checkboxFillStyle }),
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
          ...triggerStyle,
          fontSize: textStyle.M[state.fontSizePreset],
          backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white,
        },
      },
      this.triggerHeader(triggerData, index),
      data.id === Triggers.Zoom && this.zoomTrigger(triggerData, index),
      data.id === Triggers.CameraPan && this.cameraPanTrigger(triggerData, index),
      data.id === Triggers.CameraFocus && this.cameraFocusTrigger(triggerData, index),
      data.id === Triggers.TimeRemap && this.timeRemapTrigger(triggerData, index),
      data.id === Triggers.CustomSkin && false,
      rc(
        'button',
        {
          style: smallCenteredButton,
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

  triggerHeader(data, index) {
    const { rc, root, state } = this;
    return rc(
      'div',
      { style: triggerDivStyle },
      rc('text', {
        style: {
          fontSize: textStyle.L[state.fontSizePreset],
          paddingRight: '10px',
        },
      }, index + 1),
      this.timeStamp(data[0], index),
      rc(
        'button',
        {
          style: {
            ...squareButtonStyle,
            position: 'absolute',
            right: '10px',
          },
          disabled: index === 0,
          onClick: () => root.onDeleteTrigger(index),
        },
        rc('span', {
          style: {
            fontSize: '22px',
            color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
            fontWeight: 900,
          },
        }, 'X'),
      ),
    );
  }

  timeStamp(data, index) {
    const { rc, root } = this;
    const tProps = [
      constraintProps.minuteProps,
      constraintProps.secondProps,
      constraintProps.frameProps,
    ];

    if (!Array.isArray(data)) {
      return false;
    }

    return data.map((timeValue, timeIndex) => rc(
      'div',
      null,
      rc(
        'text',
        { style: triggerTextStyle },
        ['TIME', ':', ':'][timeIndex],
      ),
      rc('input', {
        style: {
          ...triggerTextStyle,
          backgroundColor:
              index === 0
                ? colorTheme.darkgray2
                : colorTheme.white,
        },
        disabled: index === 0,
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
    ));
  }

  zoomTrigger(data, index) {
    const { rc, root } = this;
    const labels = ['ZOOM TO'];

    return rc(
      'div',
      null,
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: triggerTextStyle,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: triggerTextStyle,
        value: data[1],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          constraintProps.zoomProps,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          constraintProps.zoomProps,
          true,
        ),
      }),
    );
  }

  cameraPanTrigger(data, index) {
    const { rc, root } = this;
    const cProps = [
      constraintProps.wProps,
      constraintProps.hProps,
      constraintProps.xProps,
      constraintProps.yProps,
    ];
    const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET'];

    return rc(
      'div',
      null,
      Object.keys(data[1]).map((prop, propIndex) => rc(
        'div',
        {
          style: {
            alignItems: 'center',
            display: 'inline-block',
          },
        },
        rc('label', {
          for: `triggerText_${labels[propIndex]}_${index}`,
          style: triggerTextStyle,
        }, labels[propIndex]),
        rc('input', {
          id: `triggerText_${labels[propIndex]}_${index}`,
          style: triggerTextStyle,
          value: data[1][prop],
          onChange: (e) => root.onUpdateTrigger(
            {
              prev: data[1][prop],
              new: e.target.value,
            },
            ['triggers', index, 1, prop],
            cProps[propIndex],
          ),
          onBlur: (e) => root.onUpdateTrigger(
            {
              prev: data[1][prop],
              new: e.target.value,
            },
            ['triggers', index, 1, prop],
            cProps[propIndex],
            true,
          ),
        }),
      )),
    );
  }

  cameraFocusTrigger(data, index) {
    const { rc, root, state } = this;
    const dropdownIndex = state.focuserDropdownIndices[index];
    const labels = ['WEIGHT'];

    return rc(
      'div',
      null,
      rc(
        'select',
        {
          style: triggerDropdownHeaderStyle,
          value: dropdownIndex,
          onChange: (e) => root.onChangeFocuserDropdown(index, e.target.value),
        },
        Object.keys(data[1]).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return rc('option', {
            style: triggerDropdownOptionStyle,
            value: parseInt(riderIndex, 10),
          }, rc('text', null, `Rider ${riderNum}`));
        }),
      ),
      rc('label', {
        for: `triggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: triggerTextStyle,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: triggerTextStyle,
        value: data[1][dropdownIndex],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1][dropdownIndex],
            new: e.target.value,
          },
          ['triggers', index, 1, dropdownIndex],
          constraintProps.fWeightProps,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1][dropdownIndex],
            new: e.target.value,
          },
          ['triggers', index, 1, dropdownIndex],
          constraintProps.fWeightProps,
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
      null,
      rc('label', {
        for: `triggerText_${labels[0]}_${index}`,
        style: triggerTextStyle,
      }, labels[0]),
      rc('input', {
        id: `triggerText_${labels[0]}_${index}`,
        style: triggerTextStyle,
        value: data[1],
        onChange: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          constraintProps.timeProps,
        ),
        onBlur: (e) => root.onUpdateTrigger(
          {
            prev: data[1],
            new: e.target.value,
          },
          ['triggers', index, 1],
          constraintProps.timeProps,
          true,
        ),
      }),
    );
  }

  skinEditor(data) {
    const { rc, root, state } = this;
    const dropdownIndex = state.skinDropdownIndex;

    return rc(
      'div',
      { style: customSkinWindowStyle },
      rc('div', { style: customSkinBackgroundStyle }),
      rc(
        'div',
        {
          id: 'skinElementContainer',
          style: {
            ...skinElementContainerStyle,
            transform: `scale(${state.skinEditorZoomProps.scale})`,
            transformOrigin: `${state.skinEditorZoomProps.xOffset}px ${state.skinEditorZoomProps.yOffset}px`,
          },
          onWheel: (e) => root.onZoomSkinEditor(e, true),
        },
        this.flagSvg(data.triggers[dropdownIndex], dropdownIndex),
        rc('svg', { width: '200' }),
        this.riderSvg(data.triggers[dropdownIndex], dropdownIndex),
      ),
      rc(
        'div',
        { style: skinZoomScrollContainerStyle },
        rc('input', {
          style: { appearance: 'slider-vertical' },
          type: 'range',
          orient: 'vertical',
          min: constraintProps.skinZoomProps.min,
          max: constraintProps.skinZoomProps.max,
          step: 0.1,
          value: state.skinEditorZoomProps.scale,
          onChange: (e) => root.onZoomSkinEditor(e, false),
        }),
        rc(
          'text',
          { style: { fontSize: textStyle.S[state.fontSizePreset] } },
          `x${Math.round(state.skinEditorZoomProps.scale * 10) / 10}`,
        ),
      ),
      rc(
        'div',
        { style: outlineColorDivStyle },
        rc('div', {
          style: {
            ...outlineColorPickerStyle,
            backgroundColor: data.triggers[dropdownIndex].outline.stroke,
          },
          onClick: () => root.onUpdateTrigger(
            { new: state.selectedColor },
            ['triggers', dropdownIndex, 'outline', 'stroke'],
          ),
        }),
        rc('text', { style: { fontSize: textStyle.S[state.fontSizePreset] } }, 'Outline'),
      ),
      this.skinEditorToolbar(data.triggers, dropdownIndex),
    );
  }

  skinEditorToolbar(data, index) {
    const { rc, root, state } = this;
    const colorValue = state.selectedColor.substring(0, 7);
    const alphaValue = parseInt(state.selectedColor.substring(7), 16) / 255;

    return rc(
      'div',
      { style: customSkinToolbarStyle },
      rc(
        'button',
        {
          style: {
            ...squareButtonStyle,
            position: 'absolute',
            right: '10px',
          },
          onClick: () => root.onResetSkin(index),
        },
        rc('span', {
          style: { fontSize: '32px', color: 'red', fontWeight: 700 },
        }, 'X'),
      ),
      rc(
        'div',
        { style: { ...alphaContainerStyle, fontSize: textStyle.S[state.fontSizePreset] } },
        rc('label', { for: 'alphaSlider' }, 'Transparency'),
        rc(
          'div',
          { style: alphaSliderContainerStyle },
          rc('text', null, '100%'),
          rc('input', {
            id: 'alphaSlider',
            style: alphaSliderStyle,
            type: 'range',
            min: 0,
            max: 1,
            step: 0.01,
            value: alphaValue,
            onChange: (e) => root.onChangeColor(null, e.target.value),
          }),
          rc('text', null, '0%'),
        ),
      ),
      rc('input', {
        style: colorPickerStyle,
        type: 'color',
        value: colorValue,
        onChange: (e) => root.onChangeColor(e.target.value, null),
      }),
      rc(
        'select',
        {
          style: { ...triggerDropdownHeaderStyle, fontSize: textStyle.M[state.fontSizePreset] },
          value: index,
          onChange: (e) => root.onChangeSkinDropdown(e.target.value),
        },
        Object.keys(data).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return rc('option', {
            style: triggerDropdownOptionStyle,
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
      { style: flagSVG },
      rc('path', {
        ...riderStyle.flag,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'flag', 'fill']),
      }),
      rc('path', {
        ...riderStyle.flagOutline,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'flag', 'fill']),
      }),
    );
  }

  riderSvg(data, index) {
    const { rc, root, state } = this;
    return rc(
      'svg',
      { style: riderSVG },
      rc('rect', {
        ...riderStyle.skin,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'skin', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.nose,
        stroke: data.outline.stroke,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'skin', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.hair,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'hair', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.faceOutline,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'hair', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.hairFill,
        fill: data.fill.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'fill', 'fill']),
      }),
      rc('polygon', {
        ...riderStyle.eye,
        fill: data.eye.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'eye', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.sled,
        stroke: data.outline.stroke,
        fill: data.sled.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'sled', 'fill']),
      }),
      rc('line', {
        ...riderStyle.string,
        stroke: data.string.stroke,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'string', 'stroke']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.armHand,
        stroke: data.outline.stroke,
        fill: data.armHand.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'armHand', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.legPants,
        stroke: data.outline.stroke,
        fill: data.legPants.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'legPants', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.legFoot,
        stroke: data.outline.stroke,
        fill: data.legFoot.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'legFoot', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfEven,
        ...riderStyle.id_scarf0a,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf0', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfEven,
        ...riderStyle.id_scarf0b,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf0', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfOdd,
        ...riderStyle.id_scarf1,
        fill: data.id_scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf1', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfOdd,
        ...riderStyle.id_scarf2,
        fill: data.id_scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf2', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfOdd,
        ...riderStyle.id_scarf3,
        fill: data.id_scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf3', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfOdd,
        ...riderStyle.id_scarf4,
        fill: data.id_scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf4', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.id_scarfOdd,
        ...riderStyle.id_scarf5,
        fill: data.id_scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'id_scarf5', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.outline,
        ...riderStyle.torso,
        stroke: data.outline.stroke,
        fill: data.torso.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'torso', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.scarfOdd,
        ...riderStyle.scarf1,
        fill: data.scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'scarf1', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.scarfOdd,
        ...riderStyle.scarf2,
        fill: data.scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'scarf2', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.scarfOdd,
        ...riderStyle.scarf3,
        fill: data.scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'scarf3', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.scarfOdd,
        ...riderStyle.scarf4,
        fill: data.scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'scarf4', 'fill']),
      }),
      rc('rect', {
        ...riderStyle.scarfOdd,
        ...riderStyle.scarf5,
        fill: data.scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'scarf5', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.hatTop,
        stroke: data.outline.stroke,
        fill: data.hatTop.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'hatTop', 'fill']),
      }),
      rc('path', {
        ...riderStyle.hatBottom,
        stroke: data.hatBottom.stroke,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'hatBottom', 'stroke']),
      }),
      rc('circle', {
        ...riderStyle.hatBall,
        fill: data.hatBall.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'hatBall', 'fill']),
      }),
      rc('path', {
        ...riderStyle.outline,
        ...riderStyle.armSleeve,
        stroke: data.outline.stroke,
        fill: data.armSleeve.fill,
        onClick: () => root.onUpdateTrigger({ new: state.selectedColor }, ['triggers', index, 'armSleeve', 'fill']),
      }),
    );
  }
}
