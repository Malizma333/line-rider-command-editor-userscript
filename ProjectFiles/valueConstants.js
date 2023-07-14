const DEBUG = true

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
  smoothProps: { default: 20, min: 0, max: 40, type: 'Integer' },
  frameProps: { default: 0, min: 0, max: 39, type: 'Integer' },
  secondProps: { default: 0, min: 0, max: 59, type: 'Integer' },
  minuteProps: { default: 0, min: 0, max: 99, type: 'Integer' },
  zoomProps: { default: 1, min: -50, max: 50, type: 'Float' },
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
    template: [[0, 0, 0], 1],
    header: 'getAutoZoom=createZoomer({0},{1});'
  },
  CameraPan: {
    displayName: 'Pan',
    template: [[0, 0, 0], { w: 0.4, h: 0.4, x: 0, y: 0 }],
    header: 'getCamBounds=createBoundsPanner({0},{1});'
  },
  CameraFocus: {
    displayName: 'Focus',
    template: [[0, 0, 0], [1]],
    header: 'getCamFocus=createFocuser({0},{1});'
  },
  TimeRemap: {
    displayName: 'Speed',
    template: [[0, 0, 0], 1],
    header: 'timeRemapper=createTimeRemapper({0},{1});'
  },
  CustomSkin: {
    displayName: 'Skin',
    template: {
      outline: { stroke: 'black' },
      flag: { fill: '#00000066' },
      skin: { fill: 'white' },
      hair: { fill: 'black' },
      fill: { fill: 'black' },
      eye: { fill: 'black' },
      sled: { fill: 'white' },
      string: { stroke: 'black' },
      armSleeve: { fill: 'black' },
      armHand: { fill: 'white' },
      legPants: { fill: 'black' },
      legFoot: { fill: 'white' },
      torso: { fill: 'white' },
      hatTop: { fill: 'white' },
      hatBottom: { stroke: 'black' },
      hatBall: { fill: 'black' },
      scarf0: { fill: 'white' },
      scarf1: { fill: '#FD4F38' },
      scarf2: { fill: 'white' },
      scarf3: { fill: '#06A725' },
      scarf4: { fill: 'white' },
      scarf5: { fill: '#3995FD' }
    },
    header: 'setCustomRiders({0});'
  }
}
