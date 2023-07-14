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
    direction: 'ltr',
    fontFamily: 'Helvetica',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  M: {
    direction: 'ltr',
    fontFamily: 'Helvetica',
    fontSize: '22px',
    fontWeight: 'bold'
  },
  L: {
    direction: 'ltr',
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
  height: '440px',
  width: '575px'
}

const squareButtonStyle = {
  backgroundColor: '#ffffff00',
  border: 'none',
  height: '35px',
  width: '35px'
}

const toolbarStyle = {
  alignItems: 'center',
  display: 'flex',
  height: '20px',
  justifyContent: 'right',
  position: 'absolute',
  right: '0px',
  top: '2px',
  width: '30%'
}

const toolbarButtonStyle = {
  backgroundColor: colorTheme.white,
  borderRadius: '10px',
  height: '20px',
  margin: '5px',
  padding: '0px',
  width: '20px'
}

const toolbarButtonText = {
  top: '3px',
  position: 'relative',
  ...textStyle.M
}

const readWriteContainerStyle = {
  alignItems: 'center',
  bottom: '0px',
  display: 'flex',
  height: '25%',
  justifyContent: 'center',
  position: 'absolute',
  width: '100%'
}

const readWriteButtonStyle = {
  backgroundColor: colorTheme.lightgray1,
  border: '2px solid black',
  borderRadius: '10px',
  bottom: '35px',
  flex: 1,
  height: '50px',
  margin: '10px'
}

const dataContainerStyle = {
  backgroundColor: colorTheme.white,
  border: '2px solid black',
  bottom: '20px',
  display: 'flex',
  flex: 3,
  height: '80px',
  margin: '10px',
  overflowY: 'scroll',
  whiteSpace: 'normal',
  wordWrap: 'break-word'
}

const dataTextStyle = {
  textAlign: 'center',
  ...textStyle.S,
  width: '90%'
}

const tabHeaderStyle = {
  display: 'flex',
  left: '5%',
  position: 'absolute',
  top: '35px'
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
  top: '35px',
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
  top: '65px',
  width: '90%'
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

const triggerDropdownHeaderStyle = {
  ...triggerTextStyle,
  marginRight: '10px',
  height: '3ch',
  width: '120px'
}

const triggerDropdownOptionStyle = {
  ...triggerTextStyle,
  textAlign: 'center'
}

const customSkinWindowStyle = {
  ...triggerWindowStyle,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden'
}

const customSkinBackgroundStyle = {
  background: `
  linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%),
  linear-gradient(-45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)`,
  backgroundSize: '10px 10px',
  height: '210%',
  position: 'absolute',
  transform: 'rotate(45deg)',
  width: '200%'
}

const customSkinToolbarStyle = {
  alignItems: 'center',
  backgroundColor: colorTheme.lightgray1,
  borderBottom: '3px solid black',
  display: 'flex',
  justifyContent: 'left',
  left: '0px',
  padding: '10px',
  position: 'absolute',
  top: '0px',
  width: '100%'
}

const colorPickerStyle = {
  height: '40px',
  marginRight: '10px',
  width: '40px'
}

const alphaContainerStyle = {
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginRight: '10px',
  position: 'relative'
}

const alphaSliderContainerStyle = {
  alignItems: 'center',
  display: 'flex',
  position: 'relative',
  left: '7px'
}

const alphaSliderStyle = {
  appearance: 'none',
  background: 'linear-gradient(to left, #000000, #ffffff)',
  border: '1px solid #000000',
  borderRadius: '5px',
  direction: 'ltr',
  height: '8px',
  margin: '5px',
  marginTop: '10px',
  opacity: '0.7',
  width: '100px'
}

const outlineColorDivStyle = {
  alignItems: 'center',
  display: 'flex',
  position: 'absolute',
  bottom: '10px',
  left: '10px'
}

const outlineColorPickerStyle = {
  border: '1px solid black',
  borderRadius: '10px',
  height: '20px',
  marginLeft: '5px',
  width: '20px'
}

const flagSVG = {
  height: '18',
  marginTop: '40px',
  transform: 'scale(5)',
  width: '15'
}

const riderSVG = {
  height: '25',
  marginTop: '40px',
  transform: 'scale(5)',
  width: '31'
}

const riderStyle = {
  outline: { strokeWidth: 0.3 },
  flag: { opacity: 0.4, transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z' },
  flagOutline: { opacity: 0.4, transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z' },
  skin: { transform: 'translate(13,8) rotate(-90)', width: '3.1', height: '4.5' },
  hair: { transform: 'translate(12.4, 5.15) rotate(-90)', width: '0.3', height: '5.1' },
  faceOutline: { transform: 'translate(12.2, 8.1) rotate(-90)', width: '3.1', height: '0.3' },
  hairFill: { transform: 'translate(12.2,4.2) scale(0.8,0.8)', width: '3.1', height: '4.8' },
  eye: { transform: 'translate(16.3,6.7)', points: '0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0' },
  nose: { transform: 'translate(17.3,8.1) rotate(-90)', d: 'M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4' },
  sled: { transform: 'translate(9.7, 15.9) scale(1.04,1)', d: 'M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z' },
  string: { transform: 'translate(21.5, 10.5) rotate(40)', x1: '0', y1: '0', x2: '8', y2: '0', strokeWidth: '0.3' },
  armSleeve: { transform: 'translate(15, 10) rotate(5)', d: 'M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5' },
  armHand: { transform: 'translate(15, 10) rotate(5)', d: 'M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0' },
  legPants: { transform: 'translate(15, 16) rotate(45)', d: 'M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8' },
  legFoot: { transform: 'translate(15, 16) rotate(45)', d: 'M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8' },
  torso: { transform: 'translate(16.9, 8.1) rotate(90)', width: '7.8', height: '4.4' },
  scarfEven: { transform: 'translate(14.8, 15.2) rotate(-90)' },
  scarfOdd: { transform: 'translate(14.8, 15.2) rotate(-90)' },
  scarf1: { strokeWidth: '0', x: '5.2', y: '1.5', width: '2', height: '1' },
  scarf2: { strokeWidth: '0', x: '5.2', y: '0.5', width: '2', height: '1' },
  scarf3: { strokeWidth: '0', x: '5.2', y: '-0.5', width: '2', height: '1' },
  scarf4: { strokeWidth: '0', x: '5.2', y: '-1.5', width: '2', height: '1' },
  scarf5: { strokeWidth: '0', x: '5.2', y: '-2.5', width: '2', height: '1' },
  hatTop: { transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', d: 'M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z' },
  hatBottom: { transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', strokeWidth: 1, strokeLinecap: 'round', d: 'M10.6-2.6 v5.2' },
  hatBall: { transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', cx: '13.9', cy: '0', r: '0.7' },
  scarfEvenb: { transform: 'translate(10.5, 8.5)' },
  scarfOddb: { transform: 'translate(10.5, 8.5)' },
  scarf0b: { strokeWidth: '0', x: '0', width: '2', height: '2' },
  scarf1b: { strokeWidth: '0', x: '-2', width: '2', height: '2' },
  scarf2b: { strokeWidth: '0', x: '-4', width: '2', height: '2' },
  scarf3b: { strokeWidth: '0', x: '-6', width: '2', height: '2' },
  scarf4b: { strokeWidth: '0', x: '-8', width: '2', height: '2' },
  scarf5b: { strokeWidth: '0', x: '-10', width: '2', height: '2' }
}
