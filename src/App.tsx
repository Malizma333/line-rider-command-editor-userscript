import { STYLES, GLOBAL_STYLES } from "./components/styles";
import { TRIGGER_METADATA } from "./lib/TriggerDataManager";
import { TRIGGER_ID, TriggerTime, TimedTrigger, ZoomTrigger, CameraFocusTrigger, CameraPanTrigger, TimeRemapTrigger, GravityTrigger, SkinCssTrigger } from "./lib/TriggerDataManager.types";
import { FONT_SIZE_SETTING, VIEWPORT_SETTING } from "./lib/settings-storage.types";
import { CONSTRAINTS } from "./lib/validation";
import * as FICONS from "./components/Icons";
import { RootComponent } from "./RootComponent";
import { Constraint } from "./lib/validation.types";
import FloatPicker from "./components/FloatPicker";
import IntPicker from "./components/IntPicker";
import SettingsRadioButton from "./components/SettingsRadioButton";
import EmbeddedButton from "./components/EmbeddedButton";

const { React } = window;

export default class App {
  root: RootComponent;

  constructor(root: RootComponent) {
    this.root = root;
  }

  main() {
    const state = this.root.state;
    return <div style={GLOBAL_STYLES.text}>
      {this.toolbar()}
      {state.active && <div style={STYLES.content}>
        {state.settingsActive && this.settingsContainer()}
        {!(state.settingsActive) && this.tabContainer()}
        {!(state.settingsActive) && this.window()}
      </div>}
    </div>;
  }

  toolbar() {
    const root = this.root;
    const state = this.root.state;

    return <div style={STYLES.toolbar.container}>
      {!state.active && <EmbeddedButton title="Maximize" onClick={() => root.onToggleActive()} icon={FICONS.MAXIMIZE}/>}
      {state.active && <div style={{ ...STYLES.toolbar.container, justifyContent: "start" }}>
        <EmbeddedButton title="Minimize" onClick={() => root.onToggleActive()} icon={FICONS.MINIMIZE}/>
        <EmbeddedButton title="Download" onClick={() => root.onDownload()} icon={FICONS.DOWNLOAD}/>
        <EmbeddedButton title="Upload" onClick={() => root.onUpload()} icon={FICONS.UPLOAD}/>
        <EmbeddedButton title="Load From Script" onClick={() => root.onLoadScript()} icon={FICONS.CORNER_UP_RIGHT}/>
        <EmbeddedButton title="Run" onClick={() => root.onTest()} icon={FICONS.PLAY} disabled={state.invalidTimes.some(i => i)}/>
        <EmbeddedButton title="Copy Script" onClick={async () => await root.onCopy()} icon={FICONS.COPY}/>
      </div>}
      {state.active && <div style={{ ...STYLES.toolbar.container, justifyContent: "end" }}>
        <EmbeddedButton title="Undo" onClick={() => root.onUndo()} icon={FICONS.ARROW_LEFT} disabled={root.triggerManager.undoLen === 0}/>
        <EmbeddedButton title="Redo" onClick={() => root.onRedo()} icon={FICONS.ARROW_RIGHT} disabled={root.triggerManager.redoLen === 0}/>
        <EmbeddedButton title="Settings" onClick={() => root.onToggleSettings()} icon={FICONS.SETTINGS}/>
        <EmbeddedButton title="Help" onClick={() => root.onHelp()} icon={FICONS.HELP_CIRCLE}/>
      </div>}
      <input
        id="trigger-file-upload"
        style={{ display: "none" }}
        type="file"
        accept=".json"
        onChange={(e: React.ChangeEvent) => root.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])}
      />
    </div>;
  }

  settingsContainer() {
    return <div style={STYLES.settings.window}>
      {this.settingsHeader()}
      {this.settings()}
    </div>;
  }

  settingsHeader() {
    const root = this.root;
    const state = this.root.state;

    return <div style={STYLES.settings.header}>
      <EmbeddedButton
        onClick={() => root.onToggleSettings()}
        icon={FICONS.X}
        style={{position: "absolute", right: "0px"}}
      />
      <text style={{ fontSize: GLOBAL_STYLES.textSizes.L[state.fontSize] }}>
        Settings
      </text>
      <button
        style={{
          // ...STYLES.button.embedded,
          fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
          position: "absolute",
          left: "0px",
          background: state.settingsDirty
            ? GLOBAL_STYLES.light_gray3
            : GLOBAL_STYLES.dark_gray1
        }}
        disabled={!(state.settingsDirty)}
        onClick={() => root.onApplySettings()}
      >
        Apply
      </button>
    </div>;
  }

  settings() {
    const root = this.root;
    const state = this.root.state;

    return <div style={{ fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize] }}>
      <div style={STYLES.settings.row}>
        <text style={{ ...STYLES.settings.label, fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
          Font Sizes
        </text>
        <div style={{ ...STYLES.settings.parameter, fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.SMALL} label="Small" onClick={(e: number) => root.onChangeFontSize(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.MEDIUM} label="Medium" onClick={(e: number) => root.onChangeFontSize(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.LARGE} label="Large" onClick={(e: number) => root.onChangeFontSize(e as number)} />
        </div>
      </div>
      <div style={STYLES.settings.row}>
        <text style={{ ...STYLES.settings.label, fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
          Viewport
        </text>
        <div style={{ ...STYLES.settings.parameter, fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
          <SettingsRadioButton current={state.fontSizeSetting} target={VIEWPORT_SETTING.HD} label="720p" onClick={(e: number) => root.onChangeViewport(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={VIEWPORT_SETTING.FHD} label="1080p" onClick={(e: number) => root.onChangeViewport(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={VIEWPORT_SETTING.QHD} label="1440p" onClick={(e: number) => root.onChangeViewport(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={VIEWPORT_SETTING.UHD} label="4K" onClick={(e: number) => root.onChangeViewport(e as number)} />
        </div>
      </div>
    </div>;
  }

  tabContainer() {
    const root = this.root;
    const state = this.root.state;

    return <div style={STYLES.tabs.container}>
      {...Object.keys(TRIGGER_METADATA).map((command: string) => {
        return <div>
          <button
            style={{...STYLES.tabs.button,
              backgroundColor:
              state.activeTab === command
                ? GLOBAL_STYLES.light_gray1
                : GLOBAL_STYLES.dark_gray1
            }}
            onClick={() => root.onChangeTab(command as TRIGGER_ID)}
          >
            <text style={{ fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
              {TRIGGER_METADATA[command as TRIGGER_ID].DISPLAY_NAME}
            </text>
          </button>
        </div>;
      })}
    </div>;
  }

  window() {
    const root = this.root;
    const state = this.root.state;
    const data = root.triggerManager.data[state.activeTab];

    if (data.id === TRIGGER_ID.SKIN) {
      return <div style={STYLES.window}>
        {this.skinEditorToolbar(state.skinEditorSelectedRider)}
        {this.skinEditor(data.triggers as SkinCssTrigger[])}
      </div>;
    }

    return <div style={STYLES.window}>
      {data.id !== TRIGGER_ID.GRAVITY && this.smoothTab()}
      {Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))}
    </div>;
  }

  smoothTab() {
    const root = this.root;
    const state = this.root.state;
    const data = root.triggerManager.data[state.activeTab];

    return <div style={STYLES.smooth.container}>
      <label
        htmlFor="smoothTextInput"
        style={{ fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}
      >
        Smoothing
      </label>
      {data.id !== TRIGGER_ID.TIME ? <IntPicker
        id="smoothTextInput"
        style={{
          ...STYLES.smooth.input,
          fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize],
        }}
        value={data.smoothing || 0}
        min={CONSTRAINTS.SMOOTH.MIN}
        max={CONSTRAINTS.SMOOTH.MAX}
        onChange={(v: number | string) => root.onUpdateTrigger(v, ["smoothing"])}
      /> : <div style={STYLES.checkbox.container }>
        <input
          id="smoothTextInput"
          style={STYLES.checkbox.primary}
          type="checkbox"
          onChange={() => root.onUpdateTrigger(!root.triggerManager.data[state.activeTab].interpolate, ["interpolate"])}
        />
        {data.interpolate as boolean && <div style={STYLES.checkbox.fill }></div>}
      </div>}
    </div>;
  }

  trigger(index: number) {
    const root = this.root;
    const state = this.root.state;
    const data = root.triggerManager.data[state.activeTab];
    const currentTrigger = data.triggers[index];

    return <div
      style={{
        ...STYLES.trigger.container,
        fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
        backgroundColor: GLOBAL_STYLES.white
      }}
    >
      <div style={STYLES.trigger.buttonContainer}>
        <EmbeddedButton
          onClick={() => root.onDeleteTrigger(index)}
          icon={FICONS.X}
          disabled={index === 0}
        />
        {data.id === TRIGGER_ID.ZOOM || data.id === TRIGGER_ID.PAN && (
          <EmbeddedButton
            onClick={() => root.onCaptureCamera(index, data.id as TRIGGER_ID)}
            icon={FICONS.CAMERA}
          />)
        }
      </div>
      
      {this.timeStamp((currentTrigger as TimedTrigger)[0], index)}
      {data.id === TRIGGER_ID.ZOOM && this.zoomTrigger((currentTrigger as ZoomTrigger), index)}
      {data.id === TRIGGER_ID.PAN && this.cameraPanTrigger((currentTrigger as CameraPanTrigger), index)}
      {data.id === TRIGGER_ID.FOCUS && this.cameraFocusTrigger((currentTrigger as CameraFocusTrigger), index)}
      {data.id === TRIGGER_ID.TIME && this.timeRemapTrigger((currentTrigger as TimeRemapTrigger), index)}
      {data.id === TRIGGER_ID.GRAVITY && this.gravityTrigger((currentTrigger as GravityTrigger), index)}
      <button style={STYLES.trigger.createButton} onClick={() => root.onCreateTrigger(index)}>
        <span>{FICONS.PLUS}</span>
      </button>
    </div>;
  }

  timeStamp(data: TriggerTime, index: number) {
    const state = this.root.state;
    const cProps = [CONSTRAINTS.MINUTE, CONSTRAINTS.SECOND, CONSTRAINTS.FRAME];
    const labels = ["Time", ":", ":"];

    return <div style={STYLES.trigger.property}>
      {...data.map((timeValue, timeIndex) => {
        return <div>
          {this.triggerProp(
            labels[timeIndex],
            timeValue,
            ["triggers", index.toString(), "0", timeIndex.toString()],
            cProps[timeIndex],
            state.invalidTimes[index] ? "red" : "black",
            true
          )}
        </div>;
      })}
    </div>;
  }

  zoomTrigger(data: ZoomTrigger, index: number) {
    return <div style={STYLES.trigger.property}>
      {this.triggerProp(
        "Zoom To",
        data[1],
        ["triggers", index.toString(), "1"],
        CONSTRAINTS.ZOOM
      )}
    </div>;
  }

  cameraPanTrigger(data: CameraPanTrigger, index: number) {
    const cProps = [CONSTRAINTS.PAN_WIDTH, CONSTRAINTS.PAN_HEIGHT, CONSTRAINTS.PAN_X, CONSTRAINTS.PAN_Y];
    const labels = ["Width", "Height", "Offset X", "Y"];

    return <div>
      {...[["w", "h"], ["x", "y"]].map((pair, pairIndex) => {
        return <div style={{ display: "flex", flexDirection: "row" }}>
          {...pair.map((prop, propIndex) => {
            return <div style={STYLES.trigger.property}>
              {this.triggerProp(
                labels[propIndex + 2 * pairIndex],
                data[1][prop as "w" | "h" | "x" | "y"],
                ["triggers", index.toString(), "1", prop],
                cProps[propIndex + 2 * pairIndex]
              )}
            </div>;
          })}
        </div>;
      })}
    </div>;
  }

  cameraFocusTrigger(data: CameraFocusTrigger, index: number) {
    const root = this.root;
    const state = this.root.state;
    const dropdownIndex = state.focusDDIndices[index];

    return <div style={STYLES.trigger.property}>
      <select
        style={STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => root.onChangeFocusDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            <text>Rider {1 + parseInt(riderIndex, 10)}</text>
          </option>;
        })}
      </select>
      {this.triggerProp(
        "Weight",
        data[1][dropdownIndex],
        ["triggers", index.toString(), "1", dropdownIndex.toString()],
        CONSTRAINTS.FOCUS_WEIGHT
      )}
    </div>;
  }

  timeRemapTrigger(data: TimeRemapTrigger, index: number) {
    return <div style={STYLES.trigger.property}>
      {this.triggerProp(
        "Speed",
        data[1],
        ["triggers", index.toString(), "1"],
        CONSTRAINTS.TIME_SPEED
      )}
    </div>;
  }

  gravityTrigger(data: GravityTrigger, index: number) {
    const root = this.root;
    const state = this.root.state;
    const dropdownIndex = state.gravityDDIndices[index];
    const cProps = [CONSTRAINTS.GRAVITY_X, CONSTRAINTS.GRAVITY_Y];
    const labels = ["X", "Y"];

    return <div style={{ display: "flex", flexDirection: "row" }}>
      <select
        style={STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => root.onChangeGravityDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            <text>Rider {1 + parseInt(riderIndex, 10)}</text>
          </option>;
        })}
      </select>
      {...["x", "y"].map((prop, propIndex) => {
        return <div style={STYLES.trigger.property}>
          {this.triggerProp(
            labels[propIndex],
            data[1][dropdownIndex][prop as "x" | "y"],
            ["triggers", index.toString(), "1", dropdownIndex.toString(), prop],
            cProps[propIndex]
          )}
        </div>;
      })}
    </div>;
  }

  triggerProp(labelText: string, value: string | number, propPath: string[], constraints: Constraint, color?: string, isInt = false) {
    const root = this.root;
    const NumberPicker = isInt ? IntPicker : FloatPicker;

    return <div>
      <label
        style={STYLES.trigger.text}
        htmlFor={propPath.join("_")}
      >{labelText}</label>
      <NumberPicker
        style={{ ...STYLES.trigger.input, color: color || "black" }}
        id={propPath.join("_")}
        value={value}
        min={constraints.MIN}
        max={constraints.MAX}
        onChange={(v: number | string) => root.onUpdateTrigger(v, propPath)}
      />
    </div>;
  }

  skinEditor(data: SkinCssTrigger[]) {
    const root = this.root;
    const state = this.root.state;
    const dropdownIndex = state.skinEditorSelectedRider;

    return <div style={STYLES.skinEditor.container}>
      <div style={STYLES.skinEditor.background}></div>
      <div
        id="skinElementContainer"
        style={{
          ...STYLES.skinEditor.canvas,
          transform: `scale(${state.skinEditorZoom[0]})`,
          transformOrigin: `${state.skinEditorZoom[1]}px ${state.skinEditorZoom[2]}px`
        }}
        onWheel={(e: React.WheelEvent) => root.onZoomSkinEditor(e, true)}
      >
        {this.flagSvg(data[dropdownIndex], dropdownIndex.toString())}
        <svg width="10vw"></svg>
        {this.riderSvg(data[dropdownIndex], dropdownIndex.toString())}
      </div>
      <div style={STYLES.skinEditor.zoomContainer}>
        <input
          style={{ height: "10px" }}
          type="range"
          min={CONSTRAINTS.SKIN_ZOOM.MIN}
          max={CONSTRAINTS.SKIN_ZOOM.MAX}
          step={0.1}
          value={state.skinEditorZoom[0]}
          onChange={(e: React.ChangeEvent) => root.onZoomSkinEditor(e, false)}
        ></input>
        <text style={{ fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
          x{Math.round(state.skinEditorZoom[0] * 10) / 10}
        </text>
      </div>
      <div style={STYLES.skinEditor.outlineColor.container}>
        <text style={{ fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>Outline</text>
        <div
          style={{ ...STYLES.skinEditor.outlineColor.input, backgroundColor: data[dropdownIndex].outline.stroke }}
          onClick={() => root.onUpdateTrigger(state.skinEditorSelectedColor, ["triggers", dropdownIndex.toString(), "outline", "stroke"])}
        ></div>
      </div>
    </div>;
  }

  skinEditorToolbar(index: number) {
    const root = this.root;
    const state = this.root.state;
    const data = root.triggerManager.data[TRIGGER_ID.SKIN].triggers;
    const colorValue = state.skinEditorSelectedColor.substring(0, 7);
    const alphaValue = parseInt(state.skinEditorSelectedColor.substring(7), 16) / 255;

    return <div style={STYLES.skinEditor.toolbar}>
      <EmbeddedButton
        onClick={() => root.onResetSkin(index)}
        icon={FICONS.TRASH2}
        style={{position: "absolute", right: "10px"}}
      />
      <div style={{ ...STYLES.skinEditor.toolbarItem, ...STYLES.alpha.container, fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }}>
        <label htmlFor="alphaSlider">Transparency</label>
        <div style={STYLES.alpha.sliderContainer}>
          <input
            id="alphaSlider"
            style={STYLES.alpha.slider}
            type="range"
            min={CONSTRAINTS.ALPHA_SLIDER.MIN}
            max={CONSTRAINTS.ALPHA_SLIDER.MAX}
            step={0.01}
            value={alphaValue}
            onChange={(e: React.ChangeEvent) => root.onChangeColor(undefined, (e.target as HTMLInputElement).value)}
          ></input>
        </div>
      </div>
      <input
        style={{ ...STYLES.skinEditor.toolbarItem, height: "40px", width: "40px" }}
        type="color"
        value={colorValue}
        onChange={(e: React.ChangeEvent) => root.onChangeColor((e.target as HTMLInputElement).value, undefined)}
      ></input>
      <select
        style={{ ...STYLES.skinEditor.toolbarItem, ...STYLES.dropdown.head, fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize] }}
        value={index}
        onChange={(e: React.ChangeEvent) => root.onChangeSkinDD((e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data).map((riderIndex) =>
          <option style={STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            Rider {1 + parseInt(riderIndex, 10)}
          </option>
        )}
      </select>
    </div>;
  }

  flagSvg(data: SkinCssTrigger, index: string) {
    const root = this.root;
    const state = this.root.state;
    const updateColor = (target: string, stroke = false) => {
      root.onUpdateTrigger(state.skinEditorSelectedColor, ["triggers", index, target, stroke ? "stroke" : "fill"]);
    };

    return <svg height="18" width="15" style={{ transform: "scale(5)" }}>
      <path
        transform="translate(-5, -3)"
        d="M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z"
        fill={data.flag.fill}
        onClick={() => updateColor("flag")}
      />
      <path
        transform="translate(-5, -3)"
        d="M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z"
        fill={data.flag.fill}
        onClick={() => updateColor("flag")}
      />
    </svg>;
  }

  riderSvg(data: SkinCssTrigger, index: string) {
    const root = this.root;
    const state = this.root.state;
    const updateColor = (target: string, stroke = false) => {
      root.onUpdateTrigger(state.skinEditorSelectedColor, ["triggers", index, target, stroke ? "stroke" : "fill"]);
    };

    return <svg height="25" width="31" style={{ transform: "scale(5)" }}>
      <rect
        transform="translate(13,8) rotate(-90)"
        width="3.1"
        height="4.5"
        fill={data.skin.fill}
        onClick={() => updateColor("skin")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(17.3,8.1) rotate(-90)"
        d="M 0 -0.25 v 0.4 c 0.1 1.3 1.2 1.2 3.1 0 v -0.4"
        stroke={data.outline.stroke}
        fill={data.skin.fill}
        onClick={() => updateColor("skin")}
      />
      <rect
        transform="translate(12.4, 5.15) rotate(-90)"
        width="0.3"
        height="5.1"
        fill={data.hair.fill}
        onClick={() => updateColor("hair")}
      />
      <rect
        transform="translate(12.2, 8.1) rotate(-90)"
        width="3.1"
        height="0.3"
        fill={data.hair.fill}
        onClick={() => updateColor("hair")}
      />
      <rect
        transform="translate(12.2,4.2) scale(0.8,0.8)"
        width="3.1"
        height="4.8"
        fill={data.fill.fill}
        onClick={() => updateColor("fill")}
      />
      <polygon
        transform="translate(16.3,6.7)"
        points="0.4,-0.4 0,-0.5 -0.4,-0.4 -0.5,0 -0.4,0.4 0,0.5 0.4,0.4 0.5,0"
        fill={data.eye.fill}
        onClick={() => updateColor("eye")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(9.7, 15.9) scale(1.04,1)"
        d="M13.6-2.2c-1.35,0-2.55,0.75-3.15,1.85H0C-0.2-0.35-0.35-0.2-0.35,0S-0.2,0.35,0,0.35h1.75V4.4H-0.2c-0.2,0-0.35,0.15-0.35,0.35S-0.4,5.1-0.2,5.1h13.8c2,0,3.65-1.65,3.65-3.65S15.6-2.2,13.6-2.2zM9.05,4.4h-6.6V0.35h6.6V4.4z M13.6,4.4H9.75V0.35h0.35C10.05,0.5,10,0.7,10,0.9c0,0.2,0.15,0.35,0.35,0.35c0.15,0,0.3-0.1,0.35-0.25c0.05-0.2,0.1-0.45,0.2-0.65h0.9c0.2,0,0.35-0.15,0.35-0.35S12-0.35,11.8-0.35h-0.5c0.5-0.7,1.35-1.15,2.3-1.15c1.65,0,2.95,1.3,2.95,2.95C16.55,3.1,15.25,4.4,13.6,4.4z"
        stroke={data.outline.stroke}
        fill={data.sled.fill}
        onClick={() => updateColor("sled")}
      />
      <line
        transform="translate(21.5, 10.5) rotate(40)"
        x1="0"
        y1="0"
        x2="8"
        y2="0"
        strokeWidth="0.3"
        stroke={data.string.stroke}
        onClick={() => updateColor("string", true)}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(15, 10) rotate(5)"
        d="M5-0.7h0.5c0,0,0.3-0.7,0.5-0.6c0.2,0.1,0,0.6,0,0.6s0.4,0,0.6,0c0.2,0,0.5,0.3,0.5,0.7c0,0.4-0.2,0.7-0.5,0.7c-0.5,0-1.6,0-1.6,0"
        stroke={data.outline.stroke}
        fill={data.armHand.fill}
        onClick={() => updateColor("armHand")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(15, 16) rotate(45)"
        d="M4.8-0.7H0c-0.4,0-0.7,0.3-0.7,0.7S-0.4,0.7,0,0.7h4.8"
        stroke={data.outline.stroke}
        fill={data.legPants.fill}
        onClick={() => updateColor("legPants")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(15, 16) rotate(45)"
        d="M4.8,0.7h2.4l0-2.7L6.7-2L6-0.7H4.8"
        stroke={data.outline.stroke}
        fill={data.legFoot.fill}
        onClick={() => updateColor("legFoot")}
      />
      <rect
        {...STYLES.riderProps.id_scarfEven}
        x="2"
        fill={data.id_scarf0.fill}
        onClick={() => updateColor("id_scarf0")}
      />
      <rect
        {...STYLES.riderProps.id_scarfEven}
        x="0"
        fill={data.id_scarf0.fill}
        onClick={() => updateColor("id_scarf0")}
      />
      <rect
        {...STYLES.riderProps.id_scarfOdd}
        x="-2"
        fill={data.id_scarf1.fill}
        onClick={() => updateColor("id_scarf1")}
      />
      <rect
        {...STYLES.riderProps.id_scarfOdd}
        x="-4"
        fill={data.id_scarf2.fill}
        onClick={() => updateColor("id_scarf2")}
      />
      <rect
        {...STYLES.riderProps.id_scarfOdd}
        x="-6"
        fill={data.id_scarf3.fill}
        onClick={() => updateColor("id_scarf3")}
      />
      <rect
        {...STYLES.riderProps.id_scarfOdd}
        x="-8"
        fill={data.id_scarf4.fill}
        onClick={() => updateColor("id_scarf4")}
      />
      <rect
        {...STYLES.riderProps.id_scarfOdd}
        x="-10"
        fill={data.id_scarf5.fill}
        onClick={() => updateColor("id_scarf5")}
      />
      <rect
        {...STYLES.riderProps.outline}
        transform="translate(16.9, 8.1) rotate(90)"
        width="7.8"
        height="4.4"
        stroke={data.outline.stroke}
        fill={data.torso.fill}
        onClick={() => updateColor("torso")}
      />
      <rect
        {...STYLES.riderProps.scarfOdd}
        y="1.5"
        fill={data.scarf1.fill}
        onClick={() => updateColor("scarf1")}
      />
      <rect
        {...STYLES.riderProps.scarfOdd}
        y="0.5"
        fill={data.scarf2.fill}
        onClick={() => updateColor("scarf2")}
      />
      <rect
        {...STYLES.riderProps.scarfOdd}
        y="-0.5"
        fill={data.scarf3.fill}
        onClick={() => updateColor("scarf3")}
      />
      <rect
        {...STYLES.riderProps.scarfOdd}
        y="-1.5"
        fill={data.scarf4.fill}
        onClick={() => updateColor("scarf4")}
      />
      <rect
        {...STYLES.riderProps.scarfOdd}
        y="-2.5"
        fill={data.scarf5.fill}
        onClick={() => updateColor("scarf5")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(14.8,5) rotate(-90) translate(-10,0)"
        d="M11-2.6h-0.4v5.2H11c1.2,0,2.2-1.2,2.2-2.6S12.2-2.6,11-2.6z"
        stroke={data.outline.stroke}
        fill={data.hatTop.fill}
        onClick={() => updateColor("hatTop")}
      />
      <path
        transform="translate(14.8,5) rotate(-90) translate(-10,0)"
        strokeWidth="1"
        strokeLinecap="round"
        d="M10.6-2.6 v5.2"
        stroke={data.hatBottom.stroke}
        onClick={() => updateColor("hatBottom", true)}
      />
      <circle
        transform="translate(14.8,5) rotate(-90) translate(-10,0)"
        cx="13.9"
        cy="0"
        r="0.7"
        fill={data.hatBall.fill}
        onClick={() => updateColor("hatBall")}
      />
      <path
        {...STYLES.riderProps.outline}
        transform="translate(15, 10) rotate(5)"
        d="M5,0.7H0c-0.4,0-0.7-0.3-0.7-0.7S-0.4-0.7,0-0.7h5"
        stroke={data.outline.stroke}
        fill={data.armSleeve.fill}
        onClick={() => updateColor("armSleeve")}
      />
    </svg>;
  }
}
