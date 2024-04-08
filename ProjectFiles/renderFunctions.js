let mainComp = (rc, root) => {};
let toolbarComps = (rc, root) => {};
let readWriteComps = (rc, root) => {};
let activeAreaComp = (rc, root) => {};
let settingsComp = (rc, root) => {};
let settingsFeatureComps = (rc, root) => {};
let tabComps = (rc, root) => {};
let tabComp = (rc, root, tab) => {};
let windowComps = (rc, root) => {};
let windowComp = (rc, root, data) => {};
let smoothTabComp = (rc, root, data) => {};
let triggerComp = (rc, root, data, index) => {};
let triggerHeaderComp = (rc, root, data, index) => {};
let timeStampComp = (rc, root, data, index) => {};
let zoomTriggerComp = (rc, root, data, index) => {};
let camPanTriggerComp = (rc, root, data, index) => {};
let camFocusTriggerComp = (rc, root, data, index) => {};
let timeRemapTriggerComp = (rc, root, data, index) => {};
let skinEditorComp = (rc, root, data) => {};
let flagComponent = (rc, root, data, index) => {};
let riderComponent = (rc, root, data, index) => {};

mainComp = (rc, root) => rc(
  'div',
  { style: textGlobal },
  rc(
    'div',
    root.state.active && { style: expandedWindow },
    rc(
      'button',
      {
        style: squareButtonStyle,
        onClick: () => root.onActivate(),
      },
      rc(
        'span',
        { style: { fontSize: '32px' } },
        root.state.active ? '-' : '+',
      ),
    ),
    rc(
      'div',
      !root.state.active && { style: { display: 'none' } },
      toolbarComps(rc, root),
      activeAreaComp(rc, root),
      readWriteComps(rc, root),
    ),
  ),
);

toolbarComps = (rc, root) => rc(
  'div',
  { style: toolbarStyle },
  rc(
    'button',
    {
      style: squareButtonStyle,
      onClick: () => root.onToggleSettings(!root.state.settingsActive),
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

readWriteComps = (rc, root) => rc(
  'div',
  {
    style: {
      ...readWriteContainerStyle,
      fontSize: textStyle.S[root.state.fontSizePreset],
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
        color: root.state.hasError ? 'Red' : 'Black',
      },
    }, root.state.message),
    rc('button', {
      style: { ...squareFilledButtonStyle, bottom: '17px' },
      onClick: () => root.onCopyClipboard(),
    }, '🖶'),
  ),
);

activeAreaComp = (rc, root) => rc(
  'div',
  null,
  !root.state.settingsActive && tabComps(rc, root),
  !root.state.settingsActive && windowComps(rc, root),
  root.state.settingsActive && settingsComp(rc, root),
);

settingsComp = (rc, root) => rc(
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
      fontSize: textStyle.L[root.state.fontSizePreset],
    },
  }, 'Settings'),
  settingsFeatureComps(rc, root),
);

settingsFeatureComps = (rc, root) => rc(
  'div',
  { style: { fontSize: textStyle.M[root.state.fontSizePreset] } },
  rc(
    'div',
    { style: settingsRowStyle },
    rc('label', { for: 'fontSizePreset', style: settingsLabelStyle }, 'Font Sizes'),
    rc(
      'div',
      { style: settingsParameterStyle },
      rc('text', { style: { fontSize: textStyle.S[root.state.fontSizePreset] } }, 'Small'),
      rc('input', {
        id: 'fontSizePreset',
        style: { margin: '5px' },
        type: 'range',
        min: constraintProps.textSizeProps.min,
        max: constraintProps.textSizeProps.max,
        step: 1,
        value: root.state.fontSizePreset,
        onChange: (e) => root.onChangeFontSizePreset(e.target.value),
      }),
      rc('text', { style: { fontSize: textStyle.S[root.state.fontSizePreset] } }, 'Large'),
    ),
  ),
  rc(
    'div',
    { style: settingsRowStyle },
    rc('text', { style: settingsLabelStyle }, 'Viewport'),
    rc(
      'div',
      { style: { ...settingsParameterStyle, fontSize: textStyle.S[root.state.fontSizePreset] } },
      rc('button', {
        style: {
          ...settingsButtonStyle,
          backgroundColor:
              root.state.resolution === viewportSizes.HD
                ? colorTheme.lightgray1 : colorTheme.darkgray1,
        },
        onClick: () => root.onChangeViewport(viewportSizes.HD),
      }, rc('text', null, viewportSizes.HD)),
      rc('button', {
        style: {
          ...settingsButtonStyle,
          backgroundColor:
              root.state.resolution === viewportSizes.FHD
                ? colorTheme.lightgray1 : colorTheme.darkgray1,
        },
        onClick: () => root.onChangeViewport(viewportSizes.FHD),
      }, rc('text', null, viewportSizes.FHD)),
      rc('button', {
        style: {
          ...settingsButtonStyle,
          backgroundColor:
              root.state.resolution === viewportSizes.QHD
                ? colorTheme.lightgray1 : colorTheme.darkgray1,
        },
        onClick: () => root.onChangeViewport(viewportSizes.QHD),
      }, rc('text', null, viewportSizes.QHD)),
      rc('button', {
        style: {
          ...settingsButtonStyle,
          backgroundColor:
              root.state.resolution === viewportSizes.UHD
                ? colorTheme.lightgray1 : colorTheme.darkgray1,
        },
        onClick: () => root.onChangeViewport(viewportSizes.UHD),
      }, rc('text', null, viewportSizes.UHD)),
    ),
  ),
);

tabComps = (rc, root) => rc(
  'div',
  { style: tabHeaderStyle },
  Object.keys(
    commandDataTypes,
  ).map((command) => rc(
    'div',
    null,
    tabComp(rc, root, command),
  )),
);

tabComp = (rc, root, tab) => rc('button', {
  style: {
    ...tabButtonStyle,
    backgroundColor:
        root.state.activeTab === tab
          ? colorTheme.lightgray1
          : colorTheme.darkgray1,
  },
  onClick: () => root.onChangeTab(tab),
}, rc(
  'text',
  { style: { fontSize: textStyle.S[root.state.fontSizePreset] } },
  commandDataTypes[tab].displayName,
));

windowComps = (rc, root) => windowComp(rc, root, root.state.triggerData[root.state.activeTab]);

windowComp = (rc, root, data) => {
  if (data.id === Triggers.CustomSkin) {
    return skinEditorComp(rc, root, data);
  }

  return rc(
    'div',
    null,
    smoothTabComp(rc, root, data),
    rc(
      'div',
      { style: triggerWindowStyle },
      Object.keys(data.triggers).map((i) => triggerComp(rc, root, data, parseInt(i, 10))),
    ),
  );
};

smoothTabComp = (rc, root, data) => rc(
  'div',
  { style: smoothTabStyle },
  rc('label', {
    for: 'smoothTextInput',
    style: { fontSize: textStyle.S[root.state.fontSizePreset] },
  }, 'Smoothing'),
  data.id !== Triggers.TimeRemap && rc('input', {
    id: 'smoothTextInput',
    style: {
      ...smoothTextInputStyle,
      fontSize: textStyle.S[root.state.fontSizePreset],
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
          prev: root.state.triggerData[root.state.activeTab].interpolate,
          new: !root.state.triggerData[root.state.activeTab].interpolate,
        },
        ['interpolate'],
        constraintProps.interpolateProps,
      ),
    }),
    data.interpolate && rc('square', { style: checkboxFillStyle }),
  ),
);

triggerComp = (rc, root, data, index) => {
  const triggerData = data.triggers[index];

  return rc(
    'div',
    {
      style: {
        ...triggerStyle,
        fontSize: textStyle.M[root.state.fontSizePreset],
        backgroundColor: index === 0 ? colorTheme.gray : colorTheme.white,
      },
    },
    triggerHeaderComp(rc, root, triggerData, index),
    data.id === Triggers.Zoom && zoomTriggerComp(rc, root, triggerData, index),
    data.id === Triggers.CameraPan && camPanTriggerComp(rc, root, triggerData, index),
    data.id === Triggers.CameraFocus && camFocusTriggerComp(rc, root, triggerData, index),
    data.id === Triggers.TimeRemap && timeRemapTriggerComp(rc, root, triggerData, index),
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
};

triggerHeaderComp = (rc, root, data, index) => rc(
  'div',
  { style: triggerDivStyle },
  rc('text', {
    style: {
      fontSize: textStyle.L[root.state.fontSizePreset],
      paddingRight: '10px',
    },
  }, index + 1),
  timeStampComp(rc, root, data[0], index),
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

timeStampComp = (rc, root, data, index) => {
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
};

zoomTriggerComp = (rc, root, data, index) => {
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
};

camPanTriggerComp = (rc, root, data, index) => {
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
};

camFocusTriggerComp = (rc, root, data, index) => {
  const dropdownIndex = root.state.focuserDropdownIndices[index];
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
};

timeRemapTriggerComp = (rc, root, data, index) => {
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
};

skinEditorComp = (rc, root, data) => {
  const dropdownIndex = root.state.skinDropdownIndex;

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
          transform: `scale(${root.state.skinEditorZoomProps.scale})`,
          transformOrigin: `${root.state.skinEditorZoomProps.xOffset}px ${root.state.skinEditorZoomProps.yOffset}px`,
        },
        onWheel: (e) => root.onZoomSkinEditor(e, true),
      },
      flagComponent(rc, root, data.triggers[dropdownIndex], dropdownIndex),
      rc('svg', { width: '200' }),
      riderComponent(rc, root, data.triggers[dropdownIndex], dropdownIndex),
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
        value: root.state.skinEditorZoomProps.scale,
        onChange: (e) => root.onZoomSkinEditor(e, false),
      }),
      rc(
        'text',
        { style: { fontSize: textStyle.S[root.state.fontSizePreset] } },
        `x${Math.round(root.state.skinEditorZoomProps.scale * 10) / 10}`,
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
          { new: root.state.selectedColor },
          ['triggers', dropdownIndex, 'outline', 'stroke'],
        ),
      }),
      rc('text', { style: { fontSize: textStyle.S[root.state.fontSizePreset] } }, 'Outline'),
    ),
    skinEditorToolbar(rc, root, data.triggers, dropdownIndex),
  );
};

skinEditorToolbar = (rc, root, data, index) => {
  const colorValue = root.state.selectedColor.substring(0, 7);
  const alphaValue = parseInt(root.state.selectedColor.substring(7), 16) / 255;

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
      { style: { ...alphaContainerStyle, fontSize: textStyle.S[root.state.fontSizePreset] } },
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
        style: { ...triggerDropdownHeaderStyle, fontSize: textStyle.M[root.state.fontSizePreset] },
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
};

flagComponent = (rc, root, data, index) => rc(
  'svg',
  { style: flagSVG },
  rc('path', {
    ...riderStyle.flag,
    fill: data.flag.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'flag', 'fill']),
  }),
  rc('path', {
    ...riderStyle.flagOutline,
    fill: data.flag.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'flag', 'fill']),
  }),
);

riderComponent = (rc, root, data, index) => rc(
  'svg',
  { style: riderSVG },
  rc('rect', {
    ...riderStyle.skin,
    fill: data.skin.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'skin', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.nose,
    stroke: data.outline.stroke,
    fill: data.skin.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'skin', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.hair,
    fill: data.hair.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hair', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.faceOutline,
    fill: data.hair.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hair', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.hairFill,
    fill: data.fill.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'fill', 'fill']),
  }),
  rc('polygon', {
    ...riderStyle.eye,
    fill: data.eye.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'eye', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.sled,
    stroke: data.outline.stroke,
    fill: data.sled.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'sled', 'fill']),
  }),
  rc('line', {
    ...riderStyle.string,
    stroke: data.string.stroke,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'string', 'stroke']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.armHand,
    stroke: data.outline.stroke,
    fill: data.armHand.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'armHand', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.legPants,
    stroke: data.outline.stroke,
    fill: data.legPants.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'legPants', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.legFoot,
    stroke: data.outline.stroke,
    fill: data.legFoot.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'legFoot', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfEven,
    ...riderStyle.id_scarf0a,
    fill: data.id_scarf0.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf0', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfEven,
    ...riderStyle.id_scarf0b,
    fill: data.id_scarf0.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf0', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfOdd,
    ...riderStyle.id_scarf1,
    fill: data.id_scarf1.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf1', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfOdd,
    ...riderStyle.id_scarf2,
    fill: data.id_scarf2.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf2', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfOdd,
    ...riderStyle.id_scarf3,
    fill: data.id_scarf3.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf3', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfOdd,
    ...riderStyle.id_scarf4,
    fill: data.id_scarf4.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf4', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.id_scarfOdd,
    ...riderStyle.id_scarf5,
    fill: data.id_scarf5.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'id_scarf5', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.outline,
    ...riderStyle.torso,
    stroke: data.outline.stroke,
    fill: data.torso.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'torso', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.scarfOdd,
    ...riderStyle.scarf1,
    fill: data.scarf1.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf1', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.scarfOdd,
    ...riderStyle.scarf2,
    fill: data.scarf2.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf2', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.scarfOdd,
    ...riderStyle.scarf3,
    fill: data.scarf3.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf3', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.scarfOdd,
    ...riderStyle.scarf4,
    fill: data.scarf4.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf4', 'fill']),
  }),
  rc('rect', {
    ...riderStyle.scarfOdd,
    ...riderStyle.scarf5,
    fill: data.scarf5.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'scarf5', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.hatTop,
    stroke: data.outline.stroke,
    fill: data.hatTop.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatTop', 'fill']),
  }),
  rc('path', {
    ...riderStyle.hatBottom,
    stroke: data.hatBottom.stroke,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatBottom', 'stroke']),
  }),
  rc('circle', {
    ...riderStyle.hatBall,
    fill: data.hatBall.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'hatBall', 'fill']),
  }),
  rc('path', {
    ...riderStyle.outline,
    ...riderStyle.armSleeve,
    stroke: data.outline.stroke,
    fill: data.armSleeve.fill,
    onClick: () => root.onUpdateTrigger({ new: root.state.selectedColor }, ['triggers', index, 'armSleeve', 'fill']),
  }),
);
