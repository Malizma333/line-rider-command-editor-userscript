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
    width: '120px',
    height: '3ch'
}

const dropdownOptionStyle = {
    ...triggerTextStyle,
    textAlign: 'center'
}