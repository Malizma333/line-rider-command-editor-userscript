import { FONT_SIZE_SETTING } from "../lib/settings-storage.types";

export const THEME = {
  black: "#000000",
  dark_gray: "#b7b7b7",
  gray: "#cccccc",
  light_gray: "#d9d9d9",
  white: "#ffffff",
} as const;

export const TEXT_SIZES = {
  S: {[FONT_SIZE_SETTING.SMALL]: "12px", [FONT_SIZE_SETTING.MEDIUM]: "14px", [FONT_SIZE_SETTING.LARGE]: "18px"},
  M: {[FONT_SIZE_SETTING.SMALL]: "18px", [FONT_SIZE_SETTING.MEDIUM]: "22px", [FONT_SIZE_SETTING.LARGE]: "24px"},
  L: {[FONT_SIZE_SETTING.SMALL]: "28px", [FONT_SIZE_SETTING.MEDIUM]: "32px", [FONT_SIZE_SETTING.LARGE]: "36px"}
} as const;

export const STYLES = {
  root: {
    backgroundColor: THEME.white,
    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    border: "2px solid black",
    fontFamily: "Helvetica",
    fontWeight: "bold",
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
      backgroundColor: THEME.white,
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
      backgroundColor: THEME.white,
      borderBottom: "1px solid black",
      display: "flex",
      height: "3em",
      justifyContent: "start",
      padding: ".5em"
    },
    input: {
      backgroundColor: THEME.white,
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
    backgroundColor: THEME.white,
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
    buttonContainer: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      direction: "ltr",
      justifyContent: "space-between",
      position: "absolute",
      right: "5px"
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
      alignItems: "center",
      backgroundColor: THEME.white,
      bottom: "-0.75em",
      border: "2px solid black",
      display: "flex",
      fontSize: "18px",
      height: "1.5em",
      justifyContent: "center",
      left: "0px",
      marginLeft: "auto",
      marginRight: "auto",
      position: "absolute",
      right: "0px",
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
  }
} as const;
