function mainComp(create, root) {
  return create('div', { style: textGlobal },
    create(
      'div',
      root.state.active && { style: expandedWindow },
      create(
        'button',
        {
          style: squareButtonStyle,
          onClick: () => root.onActivate(),
        },
        create(
          'text',
          { style: textStyle.L },
          root.state.active ? '-' : '+',
        ),
      ),
      create(
        'div',
        !root.state.active && { style: { display: 'none' } },
        toolbarComps(create, root),
        activeAreaComp(create, root),
        readWriteComps(create, root),
      ),
    )
  );
}

function toolbarComps(create, root) {
  return create(
    'div',
    { style: toolbarStyle },
    create(
      'button',
      {
        style: squareButtonStyle,
        onClick: () => root.onToggleSettings(true),
      },
      create('text', { style: toolbarButtonText }, '⚙'),
    ),
    create(
      'button',
      {
        style: squareButtonStyle,
        onClick: () => window.open(reportLink),
      },
      create('text', { style: toolbarButtonText }, '⚑'),
    ),
    create(
      'button',
      {
        style: squareButtonStyle,
        onClick: () => window.open(helpLink),
      },
      create('text', { style: toolbarButtonText }, '?'),
    ),
  );
}

function readWriteComps(create, root) {
  return create(
    'div',
    {
      style: {
        ...readWriteContainerStyle,
      },
    },
    create(
      'button',
      {
        style: {
          ...readWriteButtonStyle,
        },
        onClick: () => root.onRead(),
      },
      create('text', { style: textStyle.S }, 'Load'),
    ),
    create(
      'button',
      {
        style: {
          ...readWriteButtonStyle,
        },
        onClick: () => root.onTest(),
      },
      create('text', { style: textStyle.S }, 'Run'),
    ),
    create(
      'button',
      {
        style: {
          ...readWriteButtonStyle,
        },
        onClick: () => root.onPrint(),
      },
      create('text', { style: textStyle.S }, 'Print Code'),
    ),
    create(
      'div',
      { style: dataContainerStyle },
      create('text', {
        style: {
          ...dataTextStyle,
          color: root.state.hasError ? 'Red' : 'Black',
        },
      }, root.state.message),
      create('button', {
        style: { ...squareFilledButtonStyle, bottom: '17px' },
        onClick: () => root.onCopyClipboard(root.state.message),
      }, '🖶'),
    ),
  );
}

function activeAreaComp(create, root) {
  return create(
    'div',
    null,
    !root.state.settingsActive && tabComps(create, root),
    !root.state.settingsActive && windowComps(create, root),
    root.state.settingsActive && settingsComp(create, root),
  );
}

function settingsComp(create, root) {
  return create(
    'div',
    { style: settingsWindowStyle },
    create(
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
      create('text', { style: { ...textStyle.L, fontWeight: 700 } }, 'X'),
    ),
    create('text', { style: settingsTitleStyle }, 'Settings'),
    settingsFeatureComps(create, root),
  );
}

function settingsFeatureComps(create, root) {
  return create(
    'div',
    null,
    create(
      'div',
      { style: settingsRowStyle },
      create('text', { style: settingsLabelStyle }, 'TEXT SIZE'),
      create(
        'div',
        { style: settingsParameterStyle },
        create('text', { style: textStyle.S }, 'Small'),
        create('input', {
          style: { margin: '5px' },
          type: 'range',
          min: constraintProps.textSizeProps.min,
          max: constraintProps.textSizeProps.max,
          step: 1,
          value: root.state.fontSizePreset,
          onChange: (e) => root.onChangeFontSizePreset(e.target.value),
        }),
        create('text', { style: textStyle.S }, 'Large'),
      ),
    ),
    create(
      'div',
      { style: settingsRowStyle },
      create('text', { style: settingsLabelStyle }, 'VIEWPORT'),
      create(
        'div',
        { style: settingsParameterStyle },
        create('button', {
          style: {
            ...settingsButtonStyle,
            backgroundColor:
              root.state.resolution === viewportSizes.HD ? colorTheme.lightgray1 : colorTheme.darkgray1,
          },
          onClick: () => root.onChangeViewport(viewportSizes.HD),
        }, create('text', { style: textStyle.S }, viewportSizes.HD)),
        create('button', {
          style: {
            ...settingsButtonStyle,
            backgroundColor:
              root.state.resolution === viewportSizes.FHD ? colorTheme.lightgray1 : colorTheme.darkgray1,
          },
          onClick: () => root.onChangeViewport(viewportSizes.FHD),
        }, create('text', { style: textStyle.S }, viewportSizes.FHD)),
        create('button', {
          style: {
            ...settingsButtonStyle,
            backgroundColor:
              root.state.resolution === viewportSizes.QHD ? colorTheme.lightgray1 : colorTheme.darkgray1,
          },
          onClick: () => root.onChangeViewport(viewportSizes.QHD),
        }, create('text', { style: textStyle.S }, viewportSizes.QHD)),
        create('button', {
          style: {
            ...settingsButtonStyle,
            backgroundColor:
              root.state.resolution === viewportSizes.UHD ? colorTheme.lightgray1 : colorTheme.darkgray1,
          },
          onClick: () => root.onChangeViewport(viewportSizes.UHD),
        }, create('text', { style: textStyle.S }, viewportSizes.UHD)),
      ),
    ),
  );
}

function tabComps(create, root) {
  return create(
    'div',
    { style: tabHeaderStyle },
    Object.keys(
      commandDataTypes,
    ).map((command) => create(
      'div',
      null,
      tabComp(create, root, command),
    )),
  );
}

function tabComp(create, root, tab) {
  return create('button', {
    style: {
      ...tabButtonStyle,
      backgroundColor:
        root.state.activeTab === tab
          ? colorTheme.lightgray1
          : colorTheme.darkgray1,
    },
    onClick: () => root.onChangeTab(tab),
  }, create('text', { style: textStyle.S }, commandDataTypes[tab].displayName));
}

function windowComps(create, root) {
  return windowComp(create, root, root.state.triggerData[root.state.activeTab]);
}

function windowComp(create, root, data) {
  if (data.id === Triggers.CustomSkin) {
    return skinEditorComp(create, root, data);
  }

  return create(
    'div',
    null,
    smoothTabComp(create, root, data),
    create(
      'div',
      { style: triggerWindowStyle },
      Object.keys(data.triggers).map((i) => triggerComp(create, root, data, parseInt(i))),
    ),
  );
}

function smoothTabComp(create, root, data) {
  return create(
    'div',
    { style: smoothTabStyle },
    create('text', { style: textStyle.S }, 'Smoothing'),
    data.id !== Triggers.TimeRemap && create('input', {
      style: {
        ...smoothTextInputStyle,
        marginLeft: '5px',
      },
      value: data.smoothing,
      onChange: (e) => root.updateTrigger(
        {
          prev: data.smoothing,
          new: e.target.value,
        },
        ['smoothing'],
        constraintProps.smoothProps,
      ),
      onBlur: (e) => root.updateTrigger(
        {
          prev: data.smoothing,
          new: e.target.value,
        },
        ['smoothing'],
        constraintProps.smoothProps,
        true,
      ),
    }),
    data.id === Triggers.TimeRemap && create(
      'div',
      { style: checkboxDivStyle },
      create('input', {
        style: checkboxStyle,
        type: 'checkbox',
        onChange: () => root.updateTrigger(
          {
            prev: root.state.triggerData[root.state.activeTab].interpolate,
            new: !root.state.triggerData[root.state.activeTab].interpolate,
          },
          ['interpolate'],
          constraintProps.interpolateProps,
        ),
      }),
      data.interpolate && create('square', { style: checkboxFillStyle }),
    ),
  );
}

function triggerComp(create, root, data, index) {
  const triggerData = data.triggers[index];

  return create(
    'div',
    {
      style: {
        ...triggerStyle,
        backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white,
      },
    },
    triggerHeaderComp(create, root, triggerData, index),
    data.id === Triggers.Zoom && zoomTriggerComp(create, root, triggerData, index),
    data.id === Triggers.CameraPan && camPanTriggerComp(create, root, triggerData, index),
    data.id === Triggers.CameraFocus && camFocusTriggerComp(create, root, triggerData, index),
    data.id === Triggers.TimeRemap && timeRemapTriggerComp(create, root, triggerData, index),
    data.id === Triggers.CustomSkin && false,
    create(
      'button',
      {
        style: smallCenteredButton,
        onClick: () => root.createTrigger(index),
      },
      create('text', {
        style: {
          ...textStyle.M,
          fontWeight: 900,
        },
      }, '+'),
    ),
  );
}

function triggerHeaderComp(create, root, data, index) {
  return create(
    'div',
    { style: triggerDivStyle },
    create('text', {
      style: {
        ...textStyle.L,
        paddingRight: '10px',
      },
    }, index + 1),
    timeStampComp(create, root, data[0], index),
    create(
      'button',
      {
        style: {
          ...squareButtonStyle,
          position: 'absolute',
          right: '10px',
        },
        disabled: index === 0,
        onClick: () => root.deleteTrigger(index),
      },
      create('text', {
        style: {
          ...textStyle.M,
          color: index === 0 ? colorTheme.darkgray2 : colorTheme.black,
          fontWeight: 900,
        },
      }, 'X'),
    ),
  );
}

function timeStampComp(create, root, data, index) {
  const tProps = [
    constraintProps.minuteProps,
    constraintProps.secondProps,
    constraintProps.frameProps,
  ];

  if (!Array.isArray(data)) {
    return null;
  }

  return data.map((timeValue, timeIndex) => create(
    'div',
    null,
    create(
      'text',
      { style: triggerTextStyle },
      ['TIME', ':', ':'][timeIndex],
    ),
    create('input', {
      style: {
        ...triggerTextStyle,
        backgroundColor:
            index === 0
              ? colorTheme.darkgray2
              : colorTheme.white,
      },
      disabled: index === 0,
      value: timeValue,
      onChange: (e) => root.updateTrigger(
        {
          prev: timeValue,
          new: e.target.value,
        },
        ['triggers', index, 0, timeIndex],
        tProps[timeIndex],
      ),
      onBlur: (e) => root.updateTrigger(
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

function zoomTriggerComp(create, root, data, index) {
  const label = 'ZOOM TO';

  return create(
    'div',
    null,
    create('text', { style: triggerTextStyle }, label),
    create('input', {
      style: triggerTextStyle,
      value: data[1],
      onChange: (e) => root.updateTrigger(
        {
          prev: data[1],
          new: e.target.value,
        },
        ['triggers', index, 1],
        constraintProps.zoomProps,
      ),
      onBlur: (e) => root.updateTrigger(
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

function camPanTriggerComp(create, root, data, index) {
  const cProps = [
    constraintProps.wProps,
    constraintProps.hProps,
    constraintProps.xProps,
    constraintProps.yProps,
  ];
  const labels = ['WIDTH', 'HEIGHT', 'X OFFSET', 'Y OFFSET'];

  return create(
    'div',
    null,
    Object.keys(data[1]).map((prop, propIndex) => create(
      'div',
      {
        style: {
          alignItems: 'center',
          display: 'inline-block',
        },
      },
      create('text', { style: triggerTextStyle }, labels[propIndex]),
      create('input', {
        style: triggerTextStyle,
        value: data[1][prop],
        onChange: (e) => root.updateTrigger(
          {
            prev: data[1][prop],
            new: e.target.value,
          },
          ['triggers', index, 1, prop],
          cProps[propIndex],
        ),
        onBlur: (e) => root.updateTrigger(
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

function camFocusTriggerComp(create, root, data, index) {
  const dropdownIndex = root.state.focuserDropdownIndices[index];

  return create(
    'div',
    null,
    create(
      'select',
      {
        style: triggerDropdownHeaderStyle,
        value: dropdownIndex,
        onChange: (e) => root.onChangeFocuserDropdown(index, e.target.value),
      },
      Object.keys(data[1]).map((riderIndex) => {
        const riderNum = 1 + parseInt(riderIndex);

        return create('option', {
          style: triggerDropdownOptionStyle,
          value: parseInt(riderIndex),
        }, create('text', null, `Rider ${riderNum}`));
      }),
    ),
    create('text', { style: triggerTextStyle }, 'WEIGHT'),
    create('input', {
      style: triggerTextStyle,
      value: data[1][dropdownIndex],
      onChange: (e) => root.updateTrigger(
        {
          prev: data[1][dropdownIndex],
          new: e.target.value,
        },
        ['triggers', index, 1, dropdownIndex],
        constraintProps.fWeightProps,
      ),
      onBlur: (e) => root.updateTrigger(
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

function timeRemapTriggerComp(create, root, data, index) {
  const label = 'SPEED';

  return create(
    'div',
    null,
    create('text', { style: triggerTextStyle }, label),
    create('input', {
      style: triggerTextStyle,
      value: data[1],
      onChange: (e) => root.updateTrigger(
        {
          prev: data[1],
          new: e.target.value,
        },
        ['triggers', index, 1],
        constraintProps.timeProps,
      ),
      onBlur: (e) => root.updateTrigger(
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

function skinEditorComp(create, root, data) {
  const dropdownIndex = root.state.skinDropdownIndex;

  return create(
    'div',
    { style: customSkinWindowStyle },
    create('div', { style: customSkinBackgroundStyle }),
    create(
      'div',
      {
        id: 'skinElementContainer',
        style: {
          ...skinElementContainerStyle,
          transform: `scale(${root.state.skinEditorZoomProps.scale})`,
          transformOrigin: `${root.state.skinEditorZoomProps.xOffset}px ${root.state.skinEditorZoomProps.yOffset}px`,
        },
        onWheel: (e) => root.onZoomSkinEditor(e, true),
      },
      FlagComponent(create, root, data.triggers[dropdownIndex], dropdownIndex),
      create('svg', { width: '200' }),
      RiderComponent(create, root, data.triggers[dropdownIndex], dropdownIndex),
    ),
    create(
      'div',
      { style: skinZoomScrollContainerStyle },
      create('input', {
        style: { appearance: 'slider-vertical' },
        type: 'range',
        orient: 'vertical',
        min: constraintProps.skinZoomProps.min,
        max: constraintProps.skinZoomProps.max,
        step: 0.1,
        value: root.state.skinEditorZoomProps.scale,
        onChange: (e) => root.onZoomSkinEditor(e, false),
      }),
      create('text', { style: textStyle.S }, `x${Math.round(root.state.skinEditorZoomProps.scale * 10) / 10}`),
    ),
    create(
      'div',
      { style: outlineColorDivStyle },
      create('div', {
        style: {
          ...outlineColorPickerStyle,
          backgroundColor: data.triggers[dropdownIndex].outline.stroke,
        },
        onClick: () => root.updateTrigger(
          { new: root.state.selectedColor },
          ['triggers', dropdownIndex, 'outline', 'stroke'],
        ),
      }),
      create('text', { style: textStyle.S }, 'Outline:'),
    ),
    skinEditorToolbar(create, root, data.triggers, dropdownIndex),
  );
}

function skinEditorToolbar(create, root, data, index) {
  const colorValue = root.state.selectedColor.substring(0, 7);
  const alphaValue = parseInt(root.state.selectedColor.substring(7), 16) / 255;

  return create(
    'div',
    { style: customSkinToolbarStyle },
    create(
      'button',
      {
        style: {
          ...squareButtonStyle,
          position: 'absolute',
          right: '10px',
        },
        onClick: () => root.onResetSkin(index),
      },
      create('text', {
        style: { ...textStyle.L, color: 'red', fontWeight: 700 },
      }, 'X'),
    ),
    create(
      'div',
      { style: alphaContainerStyle },
      create('text', { style: textStyle.S }, 'Transparency'),
      create(
        'div',
        { style: alphaSliderContainerStyle },
        create('text', { style: textStyle.S }, '100%'),
        create('input', {
          style: alphaSliderStyle,
          type: 'range',
          min: 0,
          max: 1,
          step: 0.01,
          value: alphaValue,
          onChange: (e) => root.onChangeColor(null, e.target.value),
        }),
        create('text', { style: textStyle.S }, '0%'),
      ),
    ),
    create('input', {
      style: colorPickerStyle,
      type: 'color',
      value: colorValue,
      onChange: (e) => root.onChangeColor(e.target.value, null),
    }),
    create(
      'select',
      {
        style: triggerDropdownHeaderStyle,
        value: index,
        onChange: (e) => root.onChangeSkinDropdown(e.target.value),
      },
      Object.keys(data).map((riderIndex) => {
        const riderNum = 1 + parseInt(riderIndex);

        return create('option', {
          style: triggerDropdownOptionStyle,
          value: parseInt(riderIndex),
        }, create('text', null, `Rider ${riderNum}`));
      }),
    ),
  );
}

function FlagComponent(create, root, data, index) {
  return create(
    'svg',
    { style: flagSVG },
    create('path', {
      ...riderStyle.flag,
      fill: data.flag.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'flag', 'fill']),
    }),
    create('path', {
      ...riderStyle.flagOutline,
      fill: data.flag.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'flag', 'fill']),
    }),
  );
}

function RiderComponent(create, root, data, index) {
  return create(
    'svg',
    { style: riderSVG },
    create('rect', {
      ...riderStyle.skin,
      fill: data.skin.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'skin', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.nose,
      stroke: data.outline.stroke,
      fill: data.skin.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'skin', 'fill']),
    }),
    create('rect', {
      ...riderStyle.hair,
      fill: data.hair.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hair', 'fill']),
    }),
    create('rect', {
      ...riderStyle.faceOutline,
      fill: data.hair.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hair', 'fill']),
    }),
    create('rect', {
      ...riderStyle.hairFill,
      fill: data.fill.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'fill', 'fill']),
    }),
    create('polygon', {
      ...riderStyle.eye,
      fill: data.eye.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'eye', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.sled,
      stroke: data.outline.stroke,
      fill: data.sled.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'sled', 'fill']),
    }),
    create('line', {
      ...riderStyle.string,
      stroke: data.string.stroke,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'string', 'stroke']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.armHand,
      stroke: data.outline.stroke,
      fill: data.armHand.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'armHand', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.legPants,
      stroke: data.outline.stroke,
      fill: data.legPants.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'legPants', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.legFoot,
      stroke: data.outline.stroke,
      fill: data.legFoot.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'legFoot', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfEven,
      ...riderStyle._scarf0a,
      fill: data._scarf0.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf0', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfEven,
      ...riderStyle._scarf0b,
      fill: data._scarf0.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf0', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfOdd,
      ...riderStyle._scarf1,
      fill: data._scarf1.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf1', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfOdd,
      ...riderStyle._scarf2,
      fill: data._scarf2.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf2', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfOdd,
      ...riderStyle._scarf3,
      fill: data._scarf3.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf3', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfOdd,
      ...riderStyle._scarf4,
      fill: data._scarf4.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf4', 'fill']),
    }),
    create('rect', {
      ...riderStyle._scarfOdd,
      ...riderStyle._scarf5,
      fill: data._scarf5.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, '_scarf5', 'fill']),
    }),
    create('rect', {
      ...riderStyle.outline,
      ...riderStyle.torso,
      stroke: data.outline.stroke,
      fill: data.torso.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'torso', 'fill']),
    }),
    create('rect', {
      ...riderStyle.scarfOdd,
      ...riderStyle.scarf1,
      fill: data.scarf1.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf1', 'fill']),
    }),
    create('rect', {
      ...riderStyle.scarfOdd,
      ...riderStyle.scarf2,
      fill: data.scarf2.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf2', 'fill']),
    }),
    create('rect', {
      ...riderStyle.scarfOdd,
      ...riderStyle.scarf3,
      fill: data.scarf3.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf3', 'fill']),
    }),
    create('rect', {
      ...riderStyle.scarfOdd,
      ...riderStyle.scarf4,
      fill: data.scarf4.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf4', 'fill']),
    }),
    create('rect', {
      ...riderStyle.scarfOdd,
      ...riderStyle.scarf5,
      fill: data.scarf5.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf5', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.hatTop,
      stroke: data.outline.stroke,
      fill: data.hatTop.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatTop', 'fill']),
    }),
    create('path', {
      ...riderStyle.hatBottom,
      stroke: data.hatBottom.stroke,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatBottom', 'stroke']),
    }),
    create('circle', {
      ...riderStyle.hatBall,
      fill: data.hatBall.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatBall', 'fill']),
    }),
    create('path', {
      ...riderStyle.outline,
      ...riderStyle.armSleeve,
      stroke: data.outline.stroke,
      fill: data.armSleeve.fill,
      onClick: () => root.updateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'armSleeve', 'fill']),
    }),
  );
}
