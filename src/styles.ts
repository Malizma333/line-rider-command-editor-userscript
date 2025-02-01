import { FONT_SIZE_SETTING } from "./lib/settings-storage.types";

export const THEME = {
  dark: "#0D1321",
  midDark: "#7F838B",
  midLight: "#B7BBC0",
  light: "#FCFCFC",
} as const;

export const TEXT_SIZES = {
  S: {[FONT_SIZE_SETTING.SMALL]: "12px", [FONT_SIZE_SETTING.MEDIUM]: "14px", [FONT_SIZE_SETTING.LARGE]: "18px"},
  M: {[FONT_SIZE_SETTING.SMALL]: "18px", [FONT_SIZE_SETTING.MEDIUM]: "22px", [FONT_SIZE_SETTING.LARGE]: "24px"},
  L: {[FONT_SIZE_SETTING.SMALL]: "28px", [FONT_SIZE_SETTING.MEDIUM]: "32px", [FONT_SIZE_SETTING.LARGE]: "36px"}
} as const;

export const GLOBAL_STYLES: Record<string, React.CSSProperties> = {
  rowCenter: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },
  root: {
    backgroundColor: THEME.light,
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
    width: "clamp(475px, 40vw, 650px)"
  },
  toolbarContainer: {
    alignItems: "start",
    display: "flex",
    flex: 1,
    fontSize: "25px",
    width: "100%"
  },
  tabContainer: {
    alignItems: "end",
    display: "flex",
    justifyContent: "start",
    flexDirection: "row",
    overflowX: "auto",
    width: "100%"
  },
  tab: {
    border: "2px solid black",
    borderBottom: "none",
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px"
  },
  smoothContainer: {
    alignItems: "center",
    backgroundColor: THEME.light,
    borderBottom: "2px solid black",
    display: "flex",
    height: "5vh",
    justifyContent: "start",
    padding: ".5em"
  },
  window: {
    backgroundColor: THEME.light,
    border: "2px solid black",
    display: "flex",
    flexDirection: "column",
    flex: 9,
    overflowY: "scroll",
    width: "100%"
  },
  triggerContainer: {
    alignItems: "start",
    backgroundColor: THEME.light,
    borderBottom: "2px solid black",
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    position: "relative"
  },
  triggerActionContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    direction: "ltr",
    justifyContent: "space-between",
    position: "absolute",
    right: "5px"
  },
  triggerPropContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    marginBottom: "0.25em",
    width: "100%",
    whiteSpace: "nowrap",
  },
  newTriggerButton: {
    alignItems: "center",
    backgroundColor: THEME.light,
    bottom: "-0.75em",
    border: "2px solid black",
    borderRadius: "5px",
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
} as const;
