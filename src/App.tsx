import { GLOBAL_STYLES, THEME, TEXT_SIZES } from "./components/styles";
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
import SkinEditor from "./pages/SkinEditor";

const { React } = window;

export default class App {
  root: RootComponent;

  constructor(root: RootComponent) {
    this.root = root;
  }

  main() {
    const state = this.root.state;
    return <div>
      {this.toolbar()}
      {state.active && <div style={GLOBAL_STYLES.content}>
        {state.settingsActive && this.settingsContainer()}
        {!(state.settingsActive) && this.tabContainer()}
        {!(state.settingsActive) && this.window()}
      </div>}
    </div>;
  }

  toolbar() {
    const root = this.root;
    const state = this.root.state;

    return <div style={GLOBAL_STYLES.toolbarContainer}>
      {!state.active && <EmbeddedButton title="Maximize" onClick={() => root.onToggleActive()} icon={FICONS.MAXIMIZE}/>}
      {state.active && <div style={{ ...GLOBAL_STYLES.toolbarContainer, justifyContent: "start" }}>
        <EmbeddedButton title="Minimize" onClick={() => root.onToggleActive()} icon={FICONS.MINIMIZE}/>
        <EmbeddedButton title="Download" onClick={() => root.onDownload()} icon={FICONS.DOWNLOAD}/>
        <EmbeddedButton title="Upload" onClick={() => root.onUpload()} icon={FICONS.UPLOAD}/>
        <EmbeddedButton title="Load From Script" onClick={() => root.onLoadScript()} icon={FICONS.CORNER_UP_RIGHT}/>
        <EmbeddedButton title="Run" onClick={() => root.onTest()} icon={FICONS.PLAY} disabled={state.invalidTimes.some(i => i)}/>
        <EmbeddedButton title="Copy Script" onClick={async () => await root.onCopy()} icon={FICONS.COPY}/>
      </div>}
      {state.active && <div style={{ ...GLOBAL_STYLES.toolbarContainer, justifyContent: "end" }}>
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
    return <div style={GLOBAL_STYLES.settings.window}>
      {this.settingsHeader()}
      {this.settings()}
    </div>;
  }

  settingsHeader() {
    const root = this.root;
    const state = this.root.state;

    return <div style={GLOBAL_STYLES.settings.header}>
      <EmbeddedButton
        onClick={() => root.onToggleSettings()}
        icon={FICONS.X}
        style={{position: "absolute", right: "0px"}}
      />
      <text style={{ fontSize: TEXT_SIZES.L[state.fontSize] }}>
        Settings
      </text>
      <button
        style={{
          fontSize: TEXT_SIZES.M[state.fontSize],
          position: "absolute",
          left: "0px",
          background: state.settingsDirty ? THEME.half_light : THEME.half_dark
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

    return <div style={{ fontSize: TEXT_SIZES.M[state.fontSize] }}>
      <div style={GLOBAL_STYLES.settings.row}>
        <text style={{ ...GLOBAL_STYLES.settings.label, fontSize: TEXT_SIZES.S[state.fontSize] }}>
          Font Sizes
        </text>
        <div style={{ ...GLOBAL_STYLES.settings.parameter, fontSize: TEXT_SIZES.S[state.fontSize] }}>
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.SMALL} label="Small" onClick={(e: number) => root.onChangeFontSize(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.MEDIUM} label="Medium" onClick={(e: number) => root.onChangeFontSize(e as number)} />
          <SettingsRadioButton current={state.fontSizeSetting} target={FONT_SIZE_SETTING.LARGE} label="Large" onClick={(e: number) => root.onChangeFontSize(e as number)} />
        </div>
      </div>
      <div style={GLOBAL_STYLES.settings.row}>
        <text style={{ ...GLOBAL_STYLES.settings.label, fontSize: TEXT_SIZES.S[state.fontSize] }}>
          Viewport
        </text>
        <div style={{ ...GLOBAL_STYLES.settings.parameter, fontSize: TEXT_SIZES.S[state.fontSize] }}>
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

    return <div style={GLOBAL_STYLES.tabContainer}>
      {...Object.keys(TRIGGER_METADATA).map((command: string) => {
        return <div>
          <button
            style={{...GLOBAL_STYLES.tab, backgroundColor: state.activeTab === command ? THEME.half_light : THEME.half_dark }}
            onClick={() => root.onChangeTab(command as TRIGGER_ID)}
          >
            <text style={{ fontSize: TEXT_SIZES.S[state.fontSize] }}>
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
      return <SkinEditor root={root} skinTriggers={data.triggers as SkinCssTrigger[]}/>;
    }

    return <div style={GLOBAL_STYLES.window}>
      {data.id !== TRIGGER_ID.GRAVITY && this.smoothTab()}
      {Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))}
    </div>;
  }

  smoothTab() {
    const root = this.root;
    const state = this.root.state;
    const data = root.triggerManager.data[state.activeTab];

    return <div style={GLOBAL_STYLES.smoothContainer}>
      <label htmlFor="smoothInput" style={{ fontSize: TEXT_SIZES.S[state.fontSize] }}>
        Smoothing
      </label>
      {data.id !== TRIGGER_ID.TIME ? <IntPicker
        id="smoothInput"
        style={{ ...GLOBAL_STYLES.numberInput, fontSize: TEXT_SIZES.S[state.fontSize] }}
        value={data.smoothing || 0}
        min={CONSTRAINTS.SMOOTH.MIN}
        max={CONSTRAINTS.SMOOTH.MAX}
        onChange={(v: number | string) => root.onUpdateTrigger(v, ["smoothing"])}
      /> : <div style={GLOBAL_STYLES.checkbox.container }>
        <input
          id="smoothInput"
          style={GLOBAL_STYLES.checkbox.primary}
          type="checkbox"
          onChange={() => root.onUpdateTrigger(!root.triggerManager.data[state.activeTab].interpolate, ["interpolate"])}
        />
        {data.interpolate as boolean && <div style={GLOBAL_STYLES.checkbox.fill }></div>}
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
        ...GLOBAL_STYLES.trigger.container,
        fontSize: TEXT_SIZES.M[state.fontSize],
        backgroundColor: THEME.light
      }}
    >
      <div style={GLOBAL_STYLES.trigger.buttonContainer}>
        {(data.id === TRIGGER_ID.ZOOM || data.id === TRIGGER_ID.PAN) && (
          <EmbeddedButton
            onClick={() => root.onCaptureCamera(index, data.id as TRIGGER_ID)}
            icon={FICONS.CAMERA}
          />
        )}
        <EmbeddedButton
          onClick={() => root.onDeleteTrigger(index)}
          icon={FICONS.X}
          disabled={index === 0}
        />
      </div>
      
      {this.timeStamp((currentTrigger as TimedTrigger)[0], index)}
      {data.id === TRIGGER_ID.ZOOM && this.zoomTrigger((currentTrigger as ZoomTrigger), index)}
      {data.id === TRIGGER_ID.PAN && this.cameraPanTrigger((currentTrigger as CameraPanTrigger), index)}
      {data.id === TRIGGER_ID.FOCUS && this.cameraFocusTrigger((currentTrigger as CameraFocusTrigger), index)}
      {data.id === TRIGGER_ID.TIME && this.timeRemapTrigger((currentTrigger as TimeRemapTrigger), index)}
      {data.id === TRIGGER_ID.GRAVITY && this.gravityTrigger((currentTrigger as GravityTrigger), index)}
      <button style={GLOBAL_STYLES.trigger.createButton} onClick={() => root.onCreateTrigger(index)}>
        <span>{FICONS.PLUS}</span>
      </button>
    </div>;
  }

  timeStamp(data: TriggerTime, index: number) {
    const state = this.root.state;
    const cProps = [CONSTRAINTS.MINUTE, CONSTRAINTS.SECOND, CONSTRAINTS.FRAME];
    const labels = ["Time", ":", ":"];

    return <div style={GLOBAL_STYLES.trigger.property}>
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
    return <div style={GLOBAL_STYLES.trigger.property}>
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
            return <div style={GLOBAL_STYLES.trigger.property}>
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

    return <div style={GLOBAL_STYLES.trigger.property}>
      <select
        style={GLOBAL_STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => root.onChangeFocusDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={GLOBAL_STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
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
    return <div style={GLOBAL_STYLES.trigger.property}>
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
        style={GLOBAL_STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => root.onChangeGravityDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={GLOBAL_STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            <text>Rider {1 + parseInt(riderIndex, 10)}</text>
          </option>;
        })}
      </select>
      {...["x", "y"].map((prop, propIndex) => {
        return <div style={GLOBAL_STYLES.trigger.property}>
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
        style={GLOBAL_STYLES.trigger.text}
        htmlFor={propPath.join("_")}
      >{labelText}</label>
      <NumberPicker
        style={{ ...GLOBAL_STYLES.numberInput, color: color || "black" }}
        id={propPath.join("_")}
        value={value}
        min={constraints.MIN}
        max={constraints.MAX}
        onChange={(v: number | string) => root.onUpdateTrigger(v, propPath)}
      />
    </div>;
  }
}