// eslint-disable-next-line no-unused-vars
class Styles {
  static get theme() {
    return {
      black: '#000000',
      dark_gray1: '#b7b7b7',
      dark_gray2: '#999999',
      dark_gray3: '#666666',
      dark_gray4: '#434343',
      gray: '#cccccc',
      light_gray1: '#d9d9d9',
      light_gray2: '#efefef',
      light_gray3: '#f3f3f3',
      white: '#ffffff',
      text: {
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
      },
      textSizes: {
        S: ['12px', '14px', '18px'],
        M: ['18px', '22px', '24px'],
        L: ['28px', '32px', '36px'],
      },
      centerX: {
        left: '0px',
        right: '0px',
        marginLeft: 'auto',
        marginRight: 'auto',
      },
    };
  }

  static get root() {
    return {
      backgroundColor: Styles.theme.light_gray3,
      border: '2px solid black',
      left: '50px',
      minHeight: '30px',
      minWidth: '30px',
      opacity: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      position: 'fixed',
      top: '12.5px',
    };
  }

  static get content() {
    return {
      alignItems: 'center',
      display: 'flex',
      height: '60vh',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2%',
      width: '40vw',
    };
  }

  static get buttons() {
    return {
      embedded: {
        alignItems: 'center',
        background: 'none',
        border: 'none',
        display: 'flex',
        height: '1.5em',
        justifyContent: 'center',
        userSelect: 'none',
        width: '1.5em',
      },
      filled: {
        alignItems: 'center',
        backgroundColor: Styles.theme.white,
        border: '2px solid black',
        display: 'flex',
        height: '1.5em',
        justifyContent: 'center',
        userSelect: 'none',
        width: '1.5em',
      },
      settings: {
        border: '2px solid black',
        borderRadius: '5px',
        margin: '5px',
      },
    };
  }

  static get toolbar() {
    return {
      container: {
        alignItems: 'start',
        display: 'flex',
        flex: 1,
        fontSize: '20px',
        justifyContent: 'end',
        width: '100%',
      },
    };
  }

  static get actionPanel() {
    return {
      container: {
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        width: '100%',
      },
      button: {
        backgroundColor: Styles.theme.light_gray1,
        border: '2px ridge black',
        borderRadius: '5px',
        flex: 1,
        height: '50px',
        margin: '10px',
      },
      outputContainer: {
        backgroundColor: Styles.theme.white,
        border: '2px solid black',
        display: 'flex',
        flex: 3,
        height: '80px',
        margin: '10px',
        overflow: 'none',
        position: 'relative',
      },
      output: {
        overflowY: 'scroll',
        textAlign: 'center',
        wordBreak: 'break-all',
        userSelect: 'text',
      },
    };
  }

  static get settings() {
    return {
      window: {
        backgroundColor: Styles.theme.white,
        border: '2px solid black',
        display: 'flex',
        flexDirection: 'column',
        flex: 9,
        overflow: 'auto',
        position: 'relative',
        width: '100%',
      },
      header: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '3em',
        margin: '10px',
        position: 'relative',
      },
      row: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: '1.5em',
        minHeight: '3em',
        padding: '1em',
      },
      label: {
        position: 'absolute',
        left: '5px',
      },
      parameter: {
        position: 'absolute',
        right: '5px',
      },
    };
  }

  static get tabs() {
    return {
      container: {
        alignItems: 'end',
        display: 'flex',
        justifyContent: 'start',
        flexDirection: 'row',
        overflowX: 'auto',
        width: '100%',
      },
      button: {
        border: '2px solid black',
        borderBottom: '0px solid black',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      },
    };
  }

  static get smooth() {
    return {
      container: {
        alignItems: 'center',
        backgroundColor: Styles.theme.white,
        borderBottom: '1px solid black',
        display: 'flex',
        height: '3em',
        justifyContent: 'start',
        padding: '.5em',
      },
      input: {
        backgroundColor: Styles.theme.white,
        overflow: 'hidden',
        textAlign: 'center',
        width: '3em',
      },
    };
  }

  static get checkbox() {
    return {
      container: {
        alignItems: 'center',
        display: 'flex',
        height: '20px',
        justifyContent: 'center',
        marginLeft: '5px',
        position: 'relative',
        width: '20px',
      },
      primary: {
        appearance: 'none',
        background: '#FFF',
        border: '2px solid black',
        height: '100%',
        position: 'absolute',
        width: '100%',
      },
      fill: {
        backgroundColor: '#000',
        height: '60%',
        pointerEvents: 'none',
        position: 'absolute',
        width: '60%',
      },
    };
  }

  static get window() {
    return {
      backgroundColor: Styles.theme.white,
      border: '2px solid black',
      display: 'flex',
      flexDirection: 'column',
      flex: 9,
      overflowY: 'auto',
      width: '100%',
    };
  }

  static get trigger() {
    return {
      container: {
        alignItems: 'start',
        border: '1px solid black',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        position: 'relative',
      },
      property: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        marginBottom: '0.25em',
        width: '100%',
        whiteSpace: 'nowrap',
      },
      input: {
        height: '2ch',
        padding: '5px',
        textAlign: 'right',
        width: '3em',
      },
      text: {
        margin: '0em .5em',
      },
      createButton: {
        ...Styles.buttons.filled,
        ...Styles.theme.centerX,
        bottom: '-0.75em',
        fontSize: '15px',
        position: 'absolute',
        zIndex: 1,
      },
    };
  }

  static get dropdown() {
    return {
      head: {
        height: '3ch',
        marginRight: '10px',
        textAlign: 'right',
      },
      option: {
        height: '2ch',
        textAlign: 'center',
      },
    };
  }

  static get skinEditor() {
    return {
      container: {
        alignItems: 'center',
        display: 'flex',
        flex: 5,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      },
      background: {
        background: 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), '
        + 'linear-gradient(-45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)',
        backgroundSize: '10px 10px',
        height: '100vh',
        position: 'absolute',
        transform: 'rotate(45deg)',
        width: '100vw',
      },
      toolbar: {
        alignItems: 'center',
        backgroundColor: Styles.theme.light_gray1,
        borderBottom: '3px solid black',
        flex: 1,
        display: 'flex',
        justifyContent: 'left',
        padding: '0.5em',
        position: 'relative',
      },
      toolbarItem: {
        margin: '0px 5px',
      },
      canvas: {
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
      },
      outlineColor: {
        container: {
          alignItems: 'center',
          display: 'flex',
          position: 'absolute',
          bottom: '10px',
          left: '10px',
        },
        input: {
          border: '1px solid black',
          borderRadius: '10px',
          height: '20px',
          marginLeft: '5px',
          width: '20px',
        },
      },
      zoomContainer: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        left: '20px',
        position: 'absolute',
        top: '20px',
        height: '0px',
      },
      flagSvg: {
        height: '18',
        transform: `scale(${Constants.VIEWPORT_DIMENSIONS.WIDTH / 256})`,
        width: '15',
      },
      riderSvg: {
        height: '25',
        transform: `scale(${Constants.VIEWPORT_DIMENSIONS.WIDTH / 256})`,
        width: '31',
      },
    };
  }

  static get alpha() {
    return {
      container: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
      },
      sliderContainer: {
        alignItems: 'center',
        display: 'flex',
        position: 'relative',
      },
      slider: {
        appearance: 'none',
        background: 'linear-gradient(to left, black, white)',
        border: '1px solid black',
        borderRadius: '5px',
        height: '8px',
        margin: '5px',
        marginTop: '10px',
        opacity: 0.7,
        width: '100px',
      },
    };
  }

  static get riderProps() {
    return {
      outline: { strokeWidth: 0.3 },
      flag: { transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z' },
      flagOutline: { transform: 'translate(-5, -3)', d: 'M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z' },
      skin: { transform: 'translate(13,8) rotate(-90)', width: '3.1', height: '4.5' },
      hair: { transform: 'translate(12.4, 5.15) rotate(-90)', width: '0.3', height: '5.1' },
      faceOutline: { transform: 'translate(12.2, 8.1) rotate(-90)', width: '3.1', height: '0.3' },
      hairFill: { transform: 'translate(12.2,4.2) scale(0.8,0.8)', width: '3.1', height: '4.8' },
      eye: { transform: 'translate(16.3,6.7)', points: '0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0' },
      nose: { transform: 'translate(17.3,8.1) rotate(-90)', d: 'M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4' },
      sled: { transform: 'translate(9.7, 15.9) scale(1.04,1)', d: 'M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z' },
      string: {
        transform: 'translate(21.5, 10.5) rotate(40)', x1: '0', y1: '0', x2: '8', y2: '0', strokeWidth: '0.3',
      },
      armSleeve: { transform: 'translate(15, 10) rotate(5)', d: 'M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5' },
      armHand: { transform: 'translate(15, 10) rotate(5)', d: 'M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0' },
      legPants: { transform: 'translate(15, 16) rotate(45)', d: 'M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8' },
      legFoot: { transform: 'translate(15, 16) rotate(45)', d: 'M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8' },
      torso: { transform: 'translate(16.9, 8.1) rotate(90)', width: '7.8', height: '4.4' },
      scarfEven: { transform: 'translate(14.8, 15.2) rotate(-90)' },
      scarfOdd: { transform: 'translate(14.8, 15.2) rotate(-90)' },
      scarf1: {
        strokeWidth: '0', x: '5.2', y: '1.5', width: '2', height: '1',
      },
      scarf2: {
        strokeWidth: '0', x: '5.2', y: '0.5', width: '2', height: '1',
      },
      scarf3: {
        strokeWidth: '0', x: '5.2', y: '-0.5', width: '2', height: '1',
      },
      scarf4: {
        strokeWidth: '0', x: '5.2', y: '-1.5', width: '2', height: '1',
      },
      scarf5: {
        strokeWidth: '0', x: '5.2', y: '-2.5', width: '2', height: '1',
      },
      hatTop: { transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', d: 'M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z' },
      hatBottom: {
        transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', strokeWidth: 1, strokeLinecap: 'round', d: 'M10.6-2.6 v5.2',
      },
      hatBall: {
        transform: 'translate(14.8,5) rotate(-90) translate(-10,0)', cx: '13.9', cy: '0', r: '0.7',
      },
      id_scarfEven: { transform: 'translate(10.5, 8.5)' },
      id_scarfOdd: { transform: 'translate(10.5, 8.5)' },
      id_scarf0a: {
        strokeWidth: '0', x: '2', width: '2', height: '2',
      },
      id_scarf0b: {
        strokeWidth: '0', x: '0', width: '2', height: '2',
      },
      id_scarf1: {
        strokeWidth: '0', x: '-2', width: '2', height: '2',
      },
      id_scarf2: {
        strokeWidth: '0', x: '-4', width: '2', height: '2',
      },
      id_scarf3: {
        strokeWidth: '0', x: '-6', width: '2', height: '2',
      },
      id_scarf4: {
        strokeWidth: '0', x: '-8', width: '2', height: '2',
      },
      id_scarf5: {
        strokeWidth: '0', x: '-10', width: '2', height: '2',
      },
    };
  }
}
