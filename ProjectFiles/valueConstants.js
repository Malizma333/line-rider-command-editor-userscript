const DEBUG = false

const fps = 40
const secondsInMinute = 60

const Triggers = {
  Zoom: 'Zoom',
  CameraPan: 'CameraPan',
  CameraFocus: 'CameraFocus',
  TimeRemap: 'TimeRemap',
  CustomSkin: 'CustomSkin'
}

const constraintProps = {
  interpolateProps: { default: true, type: 'Boolean' },
  smoothProps: { default: 10, min: 0, max: 20, type: 'Integer' },
  frameProps: { default: 0, min: 0, max: 39, type: 'Integer' },
  secondProps: { default: 0, min: 0, max: 59, type: 'Integer' },
  minuteProps: { default: 0, min: 0, max: 99, type: 'Integer' },
  zoomProps: { default: 2, min: -50, max: 50, type: 'Float' },
  xProps: { default: 0, min: -100, max: 100, type: 'Float' },
  yProps: { default: 0, min: -100, max: 100, type: 'Float' },
  wProps: { default: 0.4, min: 0, max: 2, type: 'Float' },
  hProps: { default: 0.4, min: 0, max: 2, type: 'Float' },
  fWeightProps: { default: 0, min: 0, max: 1, type: 'Float' },
  timeProps: { default: 1, min: 0.01, max: 10, type: 'Float' }
}

const constraintTypes = {
  bool: 'Boolean',
  int: 'Integer',
  float: 'Float'
}

const commandDataTypes = {
  Zoom: {
    displayName: 'Zoom',
    template: [[0, 0, 0], 2],
    header: 'getAutoZoom=createZoomer({0},{1});'
  },
  CameraPan: {
    displayName: 'Camera Pan',
    template: [[0, 0, 0], { w: 0.4, h: 0.4, x: 0, y: 0 }],
    header: 'getCamBounds=createBoundsPanner({0},{1});'
  },
  CameraFocus: {
    displayName: 'Camera Focus',
    template: [[0, 0, 0], [1]],
    header: 'getCamFocus=createFocuser({0},{1});'
  },
  TimeRemap: {
    displayName: 'Time Remap',
    template: [[0, 0, 0], 1],
    header: 'timeRemapper=createTimeRemapper({0},{1});'
  },
  CustomSkin: {
    displayName: 'Custom Skin',
    template: ['',
      '.flag { fill: #FD4F38; opacity: 0.4; } .scarfOdd { fill: #FD4F38; }',
      '.flag { fill: #06A725; opacity: 0.4; } .scarfOdd { fill: #06A725; }',
      '.flag { fill: #3995FD; opacity: 0.4; } .scarfOdd { fill: #3995FD; }',
      '.flag { fill: #FFD54B; opacity: 0.4; } .scarfOdd { fill: #FFD54B; }',
      '.flag { fill: #62DAD4; opacity: 0.4; } .scarfOdd { fill: #62DAD4; }',
      '.flag { fill: #D171DF; opacity: 0.4; } .scarfOdd { fill: #D171DF; }'],
    header: 'setCustomRiders({0})'
  }
}