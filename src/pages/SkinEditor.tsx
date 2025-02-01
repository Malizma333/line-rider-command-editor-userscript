const { React, store } = window;
import EmbeddedButton from "../components/EmbeddedButton";
import { GLOBAL_STYLES, TEXT_SIZES, THEME } from "../styles";
import * as FICONS from "../components/Icons";
import { SkinCssTrigger, TRIGGER_ID } from "../lib/TriggerDataManager.types";
import { App } from "../App";
import * as Selectors from "../lib/redux-selectors";

const styles: Record<string, React.CSSProperties> = {
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
  gridBackground: {
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
    backgroundColor: THEME.light,
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
  outlineContainer: {
    alignItems: "center",
    display: "flex",
    position: "absolute",
    bottom: "10px",
    left: "10px"
  },
  colorInput: {
    border: "1px solid black",
    borderRadius: "10px",
    height: "20px",
    marginLeft: "5px",
    width: "20px"
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
  },
  zoomSlider: {
    accentColor: "black",
    appearance: "none",
    border: "2px solid black",
    borderRadius: "5px",
    height: "10px"
  },
  alphaContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative"
  },
  alphaSliderContainer: {
    alignItems: "center",
    display: "flex",
    position: "relative"
  },
  alphaSlider: {
    accentColor: "black",
    appearance: "none",
    background: "linear-gradient(to left, black, white)",
    border: "2px solid black",
    borderRadius: "5px",
    height: "10px",
    margin: "5px",
    marginTop: "10px",
    width: "100px"
  },
  dropdownHead: {
    border: "2px solid black",
    borderRadius: "5px",
    height: "3ch",
    marginRight: "10px",
    textAlign: "right"
  },
  dropdownOption: {
    border: "2px solid black",
    height: "2ch",
    textAlign: "center"
  }
};

function SkinEditorToolbar({skinEditor, root}: {skinEditor: SkinEditor, root: App}) {
  const data = root.triggerManager.data[TRIGGER_ID.SKIN].triggers;
  const colorValue = skinEditor.state.selectedColor.substring(0, 7);
  const alphaValue = parseInt(skinEditor.state.selectedColor.substring(7), 16) / 255;

  return <div style={styles.toolbar}>
    <EmbeddedButton
      onClick={() => root.onResetSkin(skinEditor.state.selectedRider)}
      icon={FICONS.TRASH2}
      style={{position: "absolute", right: "10px"}}
    />
    <div style={{ ...styles.toolbarItem, ...styles.alphaContainer }}>
      <label htmlFor="alphaSlider">Transparency</label>
      <div style={styles.alphaSliderContainer}>
        <input
          id="alphaSlider"
          style={styles.alphaSlider}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={alphaValue}
          onChange={(e: React.ChangeEvent) => skinEditor.onChangeColor(undefined, (e.target as HTMLInputElement).value)}
        ></input>
      </div>
    </div>
    <input
      style={{ ...styles.toolbarItem, height: "40px", width: "40px" }}
      type="color"
      value={colorValue}
      onChange={(e: React.ChangeEvent) => skinEditor.onChangeColor((e.target as HTMLInputElement).value, undefined)}
    ></input>
    <select
      style={{ ...styles.toolbarItem, ...styles.dropdownHead }}
      value={skinEditor.state.selectedRider}
      onChange={(e: React.ChangeEvent) => skinEditor.onChooseRider((e.target as HTMLInputElement).value)}
    >
      {...Object.keys(data).map((riderIndex) =>
        <option style={styles.dropdownOption} value={parseInt(riderIndex, 10)}>
          Rider {1 + parseInt(riderIndex, 10)}
        </option>
      )}
    </select>
  </div>;
}

const svgProps: Record<string, React.SVGProps<SVGPathElement & SVGRectElement & SVGPolygonElement & SVGLineElement & SVGCircleElement>> = {
  flag: { transform: "translate(-5, -3)", d: "M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z" },
  flagOutline: { transform: "translate(-5, -3)", d: "M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z" },
  skinFill: {transform: "translate(13,8) rotate(-90)", width: "3.1", height: "4.5"},
  skinOutlineFill: {strokeWidth: "0.3", transform: "translate(17.3,8.1) rotate(-90)", d: "M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4"},
  hair: {transform: "translate(12.4, 5.15) rotate(-90)", width: "0.3", height: "5.1"},
  hair2: {transform: "translate(12.2, 8.1) rotate(-90)", width: "3.1", height: "0.3"},
  fill: {transform: "translate(12.2,4.2) scale(0.8,0.8)", width: "3.1", height: "4.8"},
  eye: {transform: "translate(16.3,6.7)", points: "0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0"},
  sled: {strokeWidth: "0.3", transform: "translate(9.7, 15.9) scale(1.04,1)", d: "M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z"},
  string: {transform: "translate(21.5, 10.5) rotate(40)", x1: "0", y1: "0", x2: "8", y2: "0", strokeWidth: "0.3"},
  armHand: {strokeWidth: "0.3", transform: "translate(15, 10) rotate(5)", d: "M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0"},
  legPants: {strokeWidth: "0.3", transform: "translate(15, 16) rotate(45)", d: "M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8"},
  legFoot: {strokeWidth: "0.3", transform: "translate(15, 16) rotate(45)", d: "M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8"},
  idScarf: { transform: "translate(10.5, 8.5)", strokeWidth: "0", width: "2", height: "2" },
  torso: {strokeWidth: "0.3", transform: "translate(16.9, 8.1) rotate(90)", width: "7.8", height: "4.4"},
  scarf: { transform: "translate(14.8, 15.2) rotate(-90)", width: "2", height: "1", strokeWidth: "0", x: "5.2" },
  hatTop: {strokeWidth: "0.3", transform: "translate(14.8,5) rotate(-90) translate(-10,0)", d: "M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z"},
  hatBottom: {transform: "translate(14.8,5) rotate(-90) translate(-10,0)", strokeWidth: "1", strokeLinecap: "round", d: "M10.6-2.6 v5.2"},
  hatBall: {transform: "translate(14.8,5) rotate(-90) translate(-10,0)", cx: "13.9", cy: "0", r: "0.7"},
  armSleeve: {strokeWidth: "0.3", transform: "translate(15, 10) rotate(5)", d: "M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5"}
};

function SkinEditorCanvas({skinEditor, root, skinTriggers}: {skinEditor: SkinEditor, root: App, skinTriggers: SkinCssTrigger[]}) {
  const currentSkinTrigger = skinTriggers[skinEditor.state.selectedRider];
  const updateColor = (target: string, stroke = false) => {
    root.onUpdateTrigger(skinEditor.state.selectedColor, ["triggers", skinEditor.state.selectedRider.toString(), target, stroke ? "stroke" : "fill"]);
  };

  return <div
    id="skinElementContainer"
    style={{
      ...styles.canvas,
      transform: `scale(${skinEditor.state.zoom})`,
      transformOrigin: `${skinEditor.state.xOffset}px ${skinEditor.state.yOffset}px`
    }}
    onWheel={(e: React.WheelEvent) => skinEditor.onZoom(e, true)}
  >
    <svg height="18" width="15" style={{ transform: "scale(5)" }}>
      <path {...svgProps.flag} fill={currentSkinTrigger.flag.fill} onClick={() => updateColor("flag")} />
      <path {...svgProps.flagOutline} fill={currentSkinTrigger.flag.fill} onClick={() => updateColor("flag")} />
    </svg>
    <svg width="10vw"></svg>
    <svg height="25" width="31" style={{ transform: "scale(5)" }}>
      <rect {...svgProps.skinFill} fill={currentSkinTrigger.skin.fill} onClick={() => updateColor("skin")} />
      <path {...svgProps.skinOutlineFill} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.skin.fill} onClick={() => updateColor("skin")} />
      <rect {...svgProps.hair} fill={currentSkinTrigger.hair.fill} onClick={() => updateColor("hair")} />
      <rect {...svgProps.hair2} fill={currentSkinTrigger.hair.fill} onClick={() => updateColor("hair")} />
      <rect {...svgProps.fill} fill={currentSkinTrigger.fill.fill} onClick={() => updateColor("fill")} />
      <polygon {...svgProps.eye} fill={currentSkinTrigger.eye.fill} onClick={() => updateColor("eye")} />
      <path {...svgProps.sled} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.sled.fill} onClick={() => updateColor("sled")} />
      <line {...svgProps.string} stroke={currentSkinTrigger.string.stroke} onClick={() => updateColor("string", true)} />
      <path {...svgProps.armHand} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.armHand.fill} onClick={() => updateColor("armHand")} />
      <path {...svgProps.legPants} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.legPants.fill} onClick={() => updateColor("legPants")} />
      <path {...svgProps.legFoot} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.legFoot.fill} onClick={() => updateColor("legFoot")} />
      <rect {...svgProps.idScarf} x="2" fill={currentSkinTrigger.id_scarf0.fill} onClick={() => updateColor("id_scarf0")} />
      <rect {...svgProps.idScarf} x="0" fill={currentSkinTrigger.id_scarf0.fill} onClick={() => updateColor("id_scarf0")} />
      <rect {...svgProps.idScarf} x="-2" fill={currentSkinTrigger.id_scarf1.fill} onClick={() => updateColor("id_scarf1")} />
      <rect {...svgProps.idScarf} x="-4" fill={currentSkinTrigger.id_scarf2.fill} onClick={() => updateColor("id_scarf2")} />
      <rect {...svgProps.idScarf} x="-6" fill={currentSkinTrigger.id_scarf3.fill} onClick={() => updateColor("id_scarf3")} />
      <rect {...svgProps.idScarf} x="-8" fill={currentSkinTrigger.id_scarf4.fill} onClick={() => updateColor("id_scarf4")} />
      <rect {...svgProps.idScarf} x="-10" fill={currentSkinTrigger.id_scarf5.fill} onClick={() => updateColor("id_scarf5")} />
      <rect {...svgProps.torso} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.torso.fill} onClick={() => updateColor("torso")} />
      <rect {...svgProps.scarf} y="1.5" fill={currentSkinTrigger.scarf1.fill} onClick={() => updateColor("scarf1")} />
      <rect {...svgProps.scarf} y="0.5" fill={currentSkinTrigger.scarf2.fill} onClick={() => updateColor("scarf2")} />
      <rect {...svgProps.scarf} y="-0.5" fill={currentSkinTrigger.scarf3.fill} onClick={() => updateColor("scarf3")} />
      <rect {...svgProps.scarf} y="-1.5" fill={currentSkinTrigger.scarf4.fill} onClick={() => updateColor("scarf4")} />
      <rect {...svgProps.scarf} y="-2.5" fill={currentSkinTrigger.scarf5.fill} onClick={() => updateColor("scarf5")} />
      <path {...svgProps.hatTop} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.hatTop.fill} onClick={() => updateColor("hatTop")} />
      <path {...svgProps.hatBottom} stroke={currentSkinTrigger.hatBottom.stroke} onClick={() => updateColor("hatBottom", true)} />
      <circle {...svgProps.hatBall} fill={currentSkinTrigger.hatBall.fill} onClick={() => updateColor("hatBall")} />
      <path {...svgProps.armSleeve} stroke={currentSkinTrigger.outline.stroke} fill={currentSkinTrigger.armSleeve.fill} onClick={() => updateColor("armSleeve")} />
    </svg>
  </div>;
}

interface Props { root: App, skinTriggers: SkinCssTrigger[] }
interface State { selectedRider: number, selectedColor: string, zoom: number, xOffset: number, yOffset: number }

export default class SkinEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedRider: 0,
      selectedColor: "#000000ff",
      zoom: 1,
      xOffset: 0,
      yOffset: 0
    };

    store.subscribe(() => this.updateStore());
  }

  updateStore(): void {
    const riderCount = Selectors.getNumRiders(store.getState());
    if (this.state.selectedRider >= riderCount) {
      this.setState({ selectedRider: riderCount - 1 });
    }
  }

  onChooseRider(value: string): void {
    this.setState({ selectedRider: parseInt(value, 10) });
  }

  onChangeColor(color?: string, alpha?: string): void {
    const { selectedColor } = this.state;

    const hexAlpha: string = alpha != null
      ? Math.round(Math.min(Math.max(parseFloat(alpha), 0), 1) * 255)
        .toString(16).padStart(2, "0")
      : selectedColor.substring(7);

    const hexColor = color != null
      ? color + hexAlpha
      : selectedColor.substring(0, 7) + hexAlpha;

    this.setState({ selectedColor: hexColor });
  }

  onZoom(e: React.ChangeEvent | React.WheelEvent, isMouseAction: boolean): void {
    const ZOOM_MIN = 1, ZOOM_MAX = 4;

    const { zoom, xOffset, yOffset } = this.state;
    const rect = (document.getElementById("skinElementContainer") as HTMLElement).getBoundingClientRect();
    const newState = { zoom, xOffset, yOffset };

    if (isMouseAction) {
      const eWheel = e as React.WheelEvent;
      if (zoom < ZOOM_MAX) {
        newState.xOffset = (eWheel.clientX - rect.x) / zoom;
        newState.yOffset = (eWheel.clientY - rect.y) / zoom;
      }
      newState.zoom = Math.max(Math.min(zoom - eWheel.deltaY * 1e-3, ZOOM_MAX), ZOOM_MIN);
    } else {
      newState.zoom = Math.max(Math.min(parseInt((e.target as HTMLInputElement).value), ZOOM_MAX), ZOOM_MIN);
    }

    this.setState(newState);
  }

  render () {
    const {
      root,
      skinTriggers
    } = this.props;

    return <div style={{ ...GLOBAL_STYLES.window, fontSize: TEXT_SIZES.M[root.state.fontSize] }}>
      <SkinEditorToolbar skinEditor={this} root={root}/>
      <div style={styles.container}>
        <div style={styles.gridBackground}></div>
        <SkinEditorCanvas skinEditor={this} root={root} skinTriggers={skinTriggers}/>
        <div style={styles.zoomContainer}>
          <input
            style={styles.zoomSlider}
            type="range"
            min={1}
            max={4}
            step={0.1}
            value={this.state.zoom}
            onChange={(e: React.ChangeEvent) => this.onZoom(e, false)}
          ></input>
          <text>
            x{Math.round(this.state.zoom * 10) / 10}
          </text>
        </div>
        <div style={styles.outlineContainer}>
          <text>Outline</text>
          <div
            style={{ ...styles.colorInput, backgroundColor: skinTriggers[this.state.selectedRider].outline.stroke }}
            onClick={() => root.onUpdateTrigger(this.state.selectedColor, ["triggers", this.state.selectedRider.toString(), "outline", "stroke"])}
          ></div>
        </div>
      </div>
    </div>;
  }
}