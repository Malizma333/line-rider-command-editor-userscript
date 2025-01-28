export const GLOBAL_STYLES = {
  black: "#000000",
  dark_gray1: "#b7b7b7",
  dark_gray2: "#999999",
  dark_gray3: "#666666",
  dark_gray4: "#434343",
  gray: "#cccccc",
  light_gray1: "#d9d9d9",
  light_gray2: "#efefef",
  light_gray3: "#f3f3f3",
  white: "#ffffff",
  text: {
    fontFamily: "Helvetica",
    fontWeight: "bold"
  },
  textSizes: {
    S: ["12px", "14px", "18px"],
    M: ["18px", "22px", "24px"],
    L: ["28px", "32px", "36px"]
  },
  centerX: {
    left: "0px",
    right: "0px",
    marginLeft: "auto",
    marginRight: "auto"
  }
} as const;

export const STYLES = {
  root: {
    backgroundColor: GLOBAL_STYLES.light_gray3,
    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    border: "2px solid black",
    left: "50px",
    opacity: 0,
    overflow: "hidden",
    padding: "1vh",
    pointerEvents: "none",
    position: "fixed",
    top: "12.5px"
  },
  content: {
    alignItems: "center",
    display: "flex",
    height: "clamp(250px, 60vh, 450px)",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: "1vh",
    width: "clamp(425px, 40vw, 650px)"
  },
  button: {
    embedded: {
      alignItems: "center",
      background: "none",
      bgColor: ["transparent", GLOBAL_STYLES.dark_gray1, GLOBAL_STYLES.light_gray1],
      borderRadius: "0.5em",
      border: "none",
      display: "flex",
      height: "1.5em",
      justifyContent: "center",
      userSelect: "none",
      width: "1.5em"
    },
    filled: {
      alignItems: "center",
      backgroundColor: GLOBAL_STYLES.white,
      border: "2px solid black",
      display: "flex",
      height: "1.5em",
      justifyContent: "center",
      userSelect: "none",
      width: "1.5em"
    },
    settings: {
      border: "2px solid black",
      borderRadius: "5px",
      margin: "5px"
    }
  },
  toolbar: {
    container: {
      alignItems: "start",
      display: "flex",
      flex: 1,
      fontSize: "25px",
      width: "100%"
    }
  },
  settings: {
    window: {
      backgroundColor: GLOBAL_STYLES.white,
      border: "2px solid black",
      display: "flex",
      flexDirection: "column",
      flex: 9,
      overflow: "auto",
      position: "relative",
      width: "100%"
    },
    header: {
      alignItems: "center",
      display: "flex",
      justifyContent: "center",
      minHeight: "3em",
      margin: "10px",
      position: "relative"
    },
    row: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      height: "1.5em",
      minHeight: "3em",
      padding: "1em"
    },
    label: {
      position: "absolute",
      left: "5px"
    },
    parameter: {
      position: "absolute",
      right: "5px"
    }
  },
  tabs: {
    container: {
      alignItems: "end",
      display: "flex",
      justifyContent: "start",
      flexDirection: "row",
      overflowX: "auto",
      width: "100%"
    },
    button: {
      border: "2px solid black",
      borderBottom: "0px solid black",
      borderTopLeftRadius: "8px",
      borderTopRightRadius: "8px"
    }
  },
  smooth: {
    container: {
      alignItems: "center",
      backgroundColor: GLOBAL_STYLES.white,
      borderBottom: "1px solid black",
      display: "flex",
      height: "3em",
      justifyContent: "start",
      padding: ".5em"
    },
    input: {
      backgroundColor: GLOBAL_STYLES.white,
      overflow: "hidden",
      textAlign: "center",
      width: "3em",
      marginLeft: "5px"
    }
  },
  checkbox: {
    container: {
      alignItems: "center",
      display: "flex",
      height: "20px",
      justifyContent: "center",
      marginLeft: "5px",
      position: "relative",
      width: "20px"
    },
    primary: {
      appearance: "none",
      background: "#FFF",
      border: "2px solid black",
      height: "100%",
      position: "absolute",
      width: "100%"
    },
    fill: {
      backgroundColor: "#000",
      height: "60%",
      pointerEvents: "none",
      position: "absolute",
      width: "60%"
    }
  },
  window: {
    backgroundColor: GLOBAL_STYLES.white,
    border: "2px solid black",
    display: "flex",
    flexDirection: "column",
    flex: 9,
    overflowY: "scroll",
    width: "100%"
  },
  trigger: {
    container: {
      alignItems: "start",
      border: "1px solid black",
      display: "flex",
      flexDirection: "column",
      padding: "12px",
      position: "relative"
    },
    property: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      justifyContent: "start",
      marginBottom: "0.25em",
      width: "100%",
      whiteSpace: "nowrap"
    },
    input: {
      height: "2ch",
      padding: "5px",
      textAlign: "right",
      width: "3em"
    },
    text: {
      margin: "0em .5em"
    },
    createButton: {
      ...GLOBAL_STYLES.centerX,
      alignItems: "center",
      backgroundColor: GLOBAL_STYLES.white,
      bottom: "-0.75em",
      border: "2px solid black",
      display: "flex",
      fontSize: "18px",
      height: "1.5em",
      justifyContent: "center",
      position: "absolute",
      userSelect: "none",
      width: "1.5em",
      zIndex: 1
    }
  },
  dropdown: {
    head: {
      height: "3ch",
      marginRight: "10px",
      textAlign: "right"
    },
    option: {
      height: "2ch",
      textAlign: "center"
    }
  },
  skinEditor: {
    container: {
      alignItems: "center",
      display: "flex",
      flex: 5,
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
      userSelect: "none",
      width: "100%"
    },
    background: {
      background: "linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), " +
      "linear-gradient(-45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)",
      backgroundSize: "10px 10px",
      height: "100vh",
      position: "absolute",
      transform: "rotate(45deg)",
      width: "100vw"
    },
    toolbar: {
      alignItems: "center",
      backgroundColor: GLOBAL_STYLES.light_gray1,
      borderBottom: "3px solid black",
      flex: 1,
      display: "flex",
      justifyContent: "left",
      position: "relative",
      userSelect: "none"
    },
    toolbarItem: {
      margin: "0px 5px"
    },
    canvas: {
      alignItems: "center",
      display: "flex",
      height: "100%",
      justifyContent: "center",
      position: "absolute",
      width: "100%"
    },
    outlineColor: {
      container: {
        alignItems: "center",
        display: "flex",
        position: "absolute",
        bottom: "10px",
        left: "10px"
      },
      input: {
        border: "1px solid black",
        borderRadius: "10px",
        height: "20px",
        marginLeft: "5px",
        width: "20px"
      }
    },
    zoomContainer: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      left: "20px",
      position: "absolute",
      top: "20px",
      height: "0px"
    }
  },
  alpha: {
    container: {
      alignItems: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      position: "relative"
    },
    sliderContainer: {
      alignItems: "center",
      display: "flex",
      position: "relative"
    },
    slider: {
      appearance: "none",
      background: "linear-gradient(to left, black, white)",
      border: "1px solid black",
      borderRadius: "5px",
      height: "8px",
      margin: "5px",
      marginTop: "10px",
      opacity: 0.7,
      width: "100px"
    }
  },
  riderProps: {
    outline: { strokeWidth: 0.3 },
    scarfEven: { transform: "translate(14.8, 15.2) rotate(-90)", width: "2", height: "1", strokeWidth: "0", x: "5.2" },
    scarfOdd: { transform: "translate(14.8, 15.2) rotate(-90)", width: "2", height: "1", strokeWidth: "0", x: "5.2" },
    id_scarfEven: { transform: "translate(10.5, 8.5)", strokeWidth: "0", width: "2", height: "2" },
    id_scarfOdd: { transform: "translate(10.5, 8.5)", strokeWidth: "0", width: "2", height: "2" },
  }
} as const;
