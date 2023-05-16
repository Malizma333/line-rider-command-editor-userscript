const colorTheme = {
  black: '#000000',
  darkgray1: '#b7b7b7',
  darkgray2: '#999999',
  darkgray3: '#666666',
  darkgray4: '#434343',
  gray: '#cccccc',
  lightgray1: '#d9d9d9',
  lightgray2: '#efefef',
  lightgray3: '#f3f3f3',
  white: '#ffffff'
}

const textStyle = {
  S: {
    fontFamily: 'Helvetica',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  M: {
    fontFamily: 'Helvetica',
    fontSize: '22px',
    fontWeight: 'bold'
  },
  L: {
    fontFamily: 'Helvetica',
    fontSize: '32px',
    fontWeight: 'bold'
  }
}

const parentStyle = {
  backgroundColor: colorTheme.lightgray3,
  border: '1px solid black',
  left: '55px',
  opacity: 0,
  overflowX: 'hidden',
  overflowY: 'hidden',
  pointerEvents: 'none',
  position: 'fixed',
  top: '20px'
}

const expandedWindow = {
  height: '400px',
  width: '575px'
}

const squareButtonStyle = {
  backgroundColor: '#ffffff00',
  border: 'none',
  height: '35px',
  width: '35px'
}

const readWriteButtonStyle = {
  backgroundColor: colorTheme.lightgray1,
  border: '2px solid black',
  borderRadius: '10px',
  bottom: '35px',
  height: '50px',
  position: 'absolute',
  width: '24%'
}

const errorTextStyle = {
  textAlign: 'center',
  ...textStyle.M,
  width: '90%'
}

const tabHeaderStyle = {
  display: 'flex',
  left: '5%',
  position: 'absolute',
  top: '25px'
}

const tabButtonStyle = {
  border: '2px solid black',
  borderBottom: '0px solid black',
  borderTopLeftRadius: '8px',
  borderTopRightRadius: '8px',
  height: '30px'
}

const smoothTabStyle = {
  alignItems: 'center',
  backgroundColor: colorTheme.lightgray1,
  border: '2px solid black',
  borderBottom: '0px solid black',
  display: 'flex',
  height: '30px',
  justifyContent: 'center',
  right: '5%',
  position: 'absolute',
  top: '25px',
  width: '130px'
}

const triggerWindowStyle = {
  backgroundColor: colorTheme.white,
  border: '2px solid black',
  borderBottom: '2px solid black',
  direction: 'rtl',
  height: '60%',
  left: '5%',
  overflowY: 'scroll',
  position: 'absolute',
  top: '55px',
  width: '90%'
}

const errorContainerStyle = {
  alignItems: 'center',
  backgroundColor: colorTheme.white,
  border: '2px solid black',
  bottom: '20px',
  display: 'flex',
  height: '80px',
  justifyContent: 'center',
  left: '30%',
  position: 'absolute',
  width: '40%'
}

const smoothTextInputStyle = {
  backgroundColor: colorTheme.white,
  height: '20px',
  overflow: 'hidden',
  textAlign: 'center',
  ...textStyle.S,
  width: '40px'
}

const checkboxDivStyle = {
  alignItems: 'center',
  display: 'flex',
  height: '20px',
  justifyContent: 'center',
  marginLeft: '5px',
  width: '20px'
}

const checkboxStyle = {
  appearance: 'none',
  background: '#FFF',
  border: '2px solid black',
  height: '100%',
  position: 'relative',
  width: '100%'
}

const checkboxFillStyle = {
  backgroundColor: '#000',
  height: '12px',
  pointerEvents: 'none',
  position: 'absolute',
  width: '12px'
}

const triggerDivStyle = {
  alignItems: 'center',
  display: 'flex'
}

const triggerStyle = {
  borderBottom: '2px solid black',
  borderLeft: '2px solid black',
  direction: 'ltr',
  padding: '10px',
  width: '100%'
}

const triggerTextStyle = {
  height: '2ch',
  padding: '5px',
  textAlign: 'right',
  ...textStyle.M,
  width: '4ch'
}

const dropdownHeaderStyle = {
  ...triggerTextStyle,
  height: '3ch',
  width: '120px'
}

const dropdownOptionStyle = {
  ...triggerTextStyle,
  textAlign: 'center'
}

const riderStyle = {
  flagFill: { transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z' },
  flagOutline: { transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z' },
  outline: {
    stroke: 'black',
    strokeWidth: 0.3
  },
  skin: { x: '7', y: '-2.25', width: '3.1', height: '4.5' },
  hair: { x: '9.95', y: '-2.25', width: '0.3', height: '4.5' },
  faceOutline: { x: '7', y: '-0.15', width: '3.1', height: '0.3' },
  hairFill: { y: '-2.4', width: '3.1', height: '4.8' },
  eye: { points: '0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0' },
  nose: { d: 'M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4' },
  sled: { transform: 'translate(.7, 12)', d: 'M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z' },
  string: { x1: '0', y1: '0', x2: '8', y2: '0', strokeWidth: '0.3' },
  arm: {
    sleeve: { d: 'M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5' },
    hand: { d: 'M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0' }
  },
  leg: {
    pants: { d: 'M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8' },
    foot: { d: 'M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8' }
  },
  torso: { x: '0', y: '-2.2', width: '7', height: '4.4' },
  scarfEven: { fill: 'white' },
  scarfOdd: { },
  scarf1: { strokeWidth: '0', x: '5.2', y: '1.5', width: '2', height: '1' },
  scarf2: { strokeWidth: '0', x: '5.2', y: '0.5', width: '2', height: '1' },
  scarf3: { strokeWidth: '0', x: '5.2', y: '-0.5', width: '2', height: '1' },
  scarf4: { strokeWidth: '0', x: '5.2', y: '-1.5', width: '2', height: '1' },
  scarf5: { strokeWidth: '0', x: '5.2', y: '-2.5', width: '2', height: '1' },
  hat: {
    top: { d: 'M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z' },
    bottom: { strokeWidth: 1, strokeLinecap: 'round', d: 'M10.6-2.6 v5.2' },
    ball: { cx: '13.9', cy: '0', r: '0.7' }
  },
  scarf: { x: '0', y: '-1', width: '2', height: '2' }
}