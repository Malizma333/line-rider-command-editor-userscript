import { TriggerDataManager, TRIGGER_METADATA } from "./lib/TriggerDataManager";
import { TRIGGER_ID, TriggerDataLookup, TriggerTime, TimedTrigger, ZoomTrigger, CameraFocusTrigger, GravityTrigger, SkinCssTrigger, CameraPanTrigger, TimeRemapTrigger } from "./lib/TriggerDataManager.types";
import { readJsScript } from "./io/read-js-script";
import { readJsonScript } from "./io/read-json-script";
import { formatSkins, writeScript } from "./io/write-js-script";
import { getSetting } from "./lib/settings-storage";
import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from "./lib/settings-storage.types";
import { validateTimes, CONSTRAINTS } from "./lib/validation";
import { Constraint } from "./lib/validation.types";
import { GLOBAL_STYLES, THEME, TEXT_SIZES } from "./styles";

import * as Actions from "./lib/redux-actions";
import * as Selectors from "./lib/redux-selectors";
import * as FICONS from "./components/Icons";

import FloatPicker from "./components/FloatPicker";
import IntPicker from "./components/IntPicker";
import EmbeddedButton from "./components/EmbeddedButton";
import SkinEditor from "./pages/SkinEditor";
import Settings from "./pages/Settings";

const { store, React } = window;

export interface AppState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerUpdateFlag: boolean
  focusDDIndices: number[]
  gravityDDIndices: number[]
  settingsActive: boolean
  fontSize: FONT_SIZE_SETTING
  resolution: VIEWPORT_SETTING
  invalidTimes: boolean[]
}

export class App extends React.Component {
  readonly triggerManager = new TriggerDataManager();
  readonly state: AppState;
  lastRiderCount: number | undefined;

  constructor(props: object) {
    super(props);

    this.state = {
      active: false,
      activeTab: TRIGGER_ID.ZOOM,
      triggerUpdateFlag: false,
      focusDDIndices: [0],
      gravityDDIndices: [0],
      settingsActive: false,
      fontSize: getSetting(SETTINGS_KEY.FONT_SIZE),
      resolution: getSetting(SETTINGS_KEY.VIEWPORT),
      invalidTimes: []
    };

    store.subscribe(() => this.updateStore());
  }

  componentDidMount(): void {
    window.saveCommands = () => this.onDownload();
  }

  updateStore(): void {
    const riderCount = Selectors.getNumRiders(store.getState());

    if (this.lastRiderCount !== riderCount) {
      this.lastRiderCount = riderCount;
      const { focusDDIndices, gravityDDIndices } = this.state;

      this.triggerManager.updateRiderCount(riderCount);
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
      this.setState({ focusDDIndices: focusDDIndices.map((ddIndex) => Math.min(riderCount - 1, ddIndex)) });
      this.setState({ gravityDDIndices: gravityDDIndices.map((ddIndex) => Math.min(riderCount - 1, ddIndex)) });
    }

    const sidebarOpen = Selectors.getSidebarOpen(store.getState());

    if (sidebarOpen) {
      this.setState({ active: false });
    }
  }

  onCreateTrigger(index: number): void {
    const { activeTab, focusDDIndices, gravityDDIndices } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentPlayerIndex = Selectors.getPlayerIndex(store.getState());
    const triggerTime: TriggerTime = [
      Math.floor(currentPlayerIndex / 2400),
      Math.floor((currentPlayerIndex % 2400) / 40),
      Math.floor(currentPlayerIndex % 40)
    ];

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggerData = structuredClone((currentTriggers[index] as TimedTrigger)[1]);
    const newTrigger = [triggerTime, newTriggerData] as TimedTrigger;
    const newTriggers = currentTriggers.slice(0, index + 1).concat([newTrigger]).concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, "triggers"], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    if (activeTab === TRIGGER_ID.FOCUS) {
      this.setState({ focusDDIndices: focusDDIndices.slice(0, index + 1).concat([0]).concat(focusDDIndices.slice(index + 1)) });
    }

    if (activeTab === TRIGGER_ID.GRAVITY) {
      this.setState({ gravityDDIndices: gravityDDIndices.slice(0, index + 1).concat([0]).concat(gravityDDIndices.slice(index + 1)) });
    }

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
  }

  onUpdateTrigger(newValue: number | string | boolean, path: string[]): void {
    const { activeTab } = this.state;

    this.triggerManager.updateFromPath([activeTab, ...path], newValue, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    if (activeTab !== TRIGGER_ID.SKIN) {
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
    }
  }

  onDeleteTrigger(index: number): void {
    const { activeTab, focusDDIndices, gravityDDIndices } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggers = currentTriggers.slice(0, index).concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, "triggers"], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    if (activeTab === TRIGGER_ID.FOCUS) {
      this.setState({ focusDDIndices: focusDDIndices.slice(0, index).concat(focusDDIndices.slice(index + 1)) });
    }

    if (activeTab === TRIGGER_ID.FOCUS) {
      this.setState({ gravityDDIndices: gravityDDIndices.slice(0, index).concat(gravityDDIndices.slice(index + 1)) });
    }

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
  }

  onDownload(): void {
    const jsonString = JSON.stringify(this.triggerManager.data);
    const a = document.createElement("a");
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    a.setAttribute("href", data);
    a.setAttribute("download", Selectors.getTrackTitle(store.getState()) + ".script.json");
    a.click();
    a.remove();
  }

  onUpload(): void {
    const triggerUploadInput = (document.getElementById("trigger-file-upload") as HTMLInputElement);
    triggerUploadInput.value = "";
    triggerUploadInput.click();
  }

  onLoadFile(file: File): void {
    const reader = new window.FileReader();
    reader.onload = () => {
      try {
        this.onLoad(
          readJsonScript(
            JSON.parse(reader.result as string),
            this.triggerManager.data as TriggerDataLookup
          )
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(`[Root.onLoadFile()] Failed to load file: ${error.message}`);
        }
      }
    };
    reader.readAsText(file);
  }

  onLoadScript(): void {
    this.onLoad(
      readJsScript(
        Selectors.getCurrentScript(store.getState()),
        this.triggerManager.data as TriggerDataLookup
      )
    );
  }

  onLoad(nextTriggerData: TriggerDataLookup): void {
    const { activeTab } = this.state;
    try {
      const focusTriggers = nextTriggerData[TRIGGER_ID.FOCUS].triggers as CameraFocusTrigger[];
      const focusDDIndices = Array(focusTriggers.length).fill(0) as number[];

      const gravityTriggers = nextTriggerData[TRIGGER_ID.GRAVITY].triggers as GravityTrigger[];
      const gravityDDIndices = Array(gravityTriggers.length).fill(0) as number[];

      this.triggerManager.updateFromPath([], nextTriggerData, TRIGGER_ID.ZOOM);

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggerArray = nextTriggerData[activeTab].triggers;
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
      }

      this.setState({ focusDDIndices });
      this.setState({ gravityDDIndices });
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onLoad()] ${error.message}`);
      }
    }
  }

  onTest(): void {
    const { activeTab, invalidTimes } = this.state;
    try {
      if (!invalidTimes.every((invalid) => !invalid)) {
        throw new Error("Triggers contain invalid times!");
      }

      const currentData = this.triggerManager.data[activeTab];

      switch (activeTab) {
        case TRIGGER_ID.ZOOM:
          window.getAutoZoom = window.createZoomer(currentData.triggers as ZoomTrigger[], currentData.smoothing);
          break;
        case TRIGGER_ID.PAN:
          window.getCamBounds = window.createBoundsPanner(currentData.triggers as CameraPanTrigger[], currentData.smoothing);
          break;
        case TRIGGER_ID.FOCUS:
          window.getCamFocus = window.createFocuser(currentData.triggers as CameraFocusTrigger[], currentData.smoothing);
          break;
        case TRIGGER_ID.TIME:
          window.timeRemapper = window.createTimeRemapper(currentData.triggers as TimeRemapTrigger[], currentData.interpolate);
          break;
        case TRIGGER_ID.SKIN:
          window.setCustomRiders(formatSkins(currentData.triggers as SkinCssTrigger[]));
          break;
        case TRIGGER_ID.GRAVITY:
          if (window.setCustomGravity !== undefined) {
            window.setCustomGravity(currentData.triggers as GravityTrigger[]);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onTest()] ${error.message}`);
      }
    }
  }

  async onCopy(): Promise<void> {
    const { activeTab, invalidTimes } = this.state;
    try {
      if (!invalidTimes.every((invalid) => !invalid)) {
        throw new Error("Triggers contain invalid times!");
      }

      const script = writeScript(activeTab, this.triggerManager.data as TriggerDataLookup);
      return await navigator.clipboard.writeText(script);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onCopy()] ${error.message}`);
      }
    }
  }

  onUndo(): void {
    const { activeTab } = this.state;

    const tabChange = this.triggerManager.undo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (activeTab !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[activeTab].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
    }
  }

  onRedo(): void {
    const { activeTab } = this.state;

    const tabChange = this.triggerManager.redo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (activeTab !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[activeTab].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
    }
  }

  onResetSkin(index: number): void {
    this.triggerManager.updateFromPath(
      [TRIGGER_ID.SKIN, "triggers", index.toString()],
      structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE),
      TRIGGER_ID.SKIN
    );

    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
  }

  onToggleActive(): void {
    const { active } = this.state;
    const sidebarOpen = Selectors.getSidebarOpen(store.getState());

    if (!active && sidebarOpen) {
      store.dispatch(Actions.closeSidebar());
    }

    this.setState({ active: !active });
  }

  onChangeTab(tabName: TRIGGER_ID): void {
    this.setState({ activeTab: tabName });

    if (tabName !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[tabName].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
    }
  }

  onToggleSettings(): void {
    const { settingsActive } = this.state;
    this.setState({ settingsActive: !settingsActive });
  }

  onHelp(): void {
    window.open("https://github.com/Malizma333/line-rider-command-editor-userscript#readme");
  }

  onApplyViewport(newResolution: VIEWPORT_SETTING) {
    const resolutionPixels = {
      [VIEWPORT_SETTING.HD]: { width: 1280, height: 720 },
      [VIEWPORT_SETTING.FHD]: { width: 1920, height: 1080 },
      [VIEWPORT_SETTING.QHD]: { width: 2560, height: 1440 },
      [VIEWPORT_SETTING.UHD]: { width: 3840, height: 2160 }
    };

    const factor = Math.log2(resolutionPixels[newResolution].width / resolutionPixels[this.state.resolution].width);
    store.dispatch(Actions.setPlaybackDimensions(resolutionPixels[newResolution]));

    const zoomTriggers = this.triggerManager.data[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[];
    const newZoomTriggers = zoomTriggers.map(trigger => [trigger[0], Math.round((trigger[1] + factor + Number.EPSILON) * 1e7) / 1e7]);
    this.triggerManager.updateFromPath([TRIGGER_ID.ZOOM, "triggers"], newZoomTriggers, TRIGGER_ID.ZOOM);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
  }

  onChangeFocusDD(index: number, value: string): void {
    const { focusDDIndices } = this.state;
    const nextFocusDDIndices = [...focusDDIndices];
    nextFocusDDIndices[index] = parseInt(value, 10);
    this.setState({ focusDDIndices: nextFocusDDIndices });
  }

  onChangeGravityDD(index: number, value: string): void {
    const { gravityDDIndices } = this.state;
    const nextGravityDDIndices = [...gravityDDIndices];
    nextGravityDDIndices[index] = parseInt(value, 10);
    this.setState({ gravityDDIndices: nextGravityDDIndices });
  }

  onCaptureCamera(index: number, triggerType: TRIGGER_ID) {
    switch (triggerType) {
      case TRIGGER_ID.ZOOM: {
        this.onUpdateTrigger(Math.log2(Selectors.getEditorZoom(store.getState())), ["triggers", index.toString(), "1"]);
        break;
      }
      case TRIGGER_ID.PAN: {
        const { x, y } = Selectors.getEditorPosition(store.getState());
        const track = Selectors.getSimulatorTrack(store.getState());
        const { width, height } = Selectors.getPlaybackDimensions(store.getState());
        const zoom = Selectors.getPlaybackZoom(store.getState());
        const playerIndex = Math.floor(Selectors.getPlayerIndex(store.getState()));
        const camera = store.getState().camera.playbackFollower.getCamera(track, { zoom, width, height }, playerIndex);
        this.onUpdateTrigger((x - camera.x) * zoom / width, ["triggers", index.toString(), "1", "x"]);
        this.onUpdateTrigger((y - camera.y) * zoom / height, ["triggers", index.toString(), "1", "y"]);
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    return <div>
      {this.renderToolbar()}
      {this.state.active && <div style={GLOBAL_STYLES.content}>
        {this.state.settingsActive ?
          <Settings root={this}/> :
          <React.Fragment>
            {this.renderTabContainer()}
            {this.renderWindow()}
          </React.Fragment>
        }
      </div>}
    </div>;
  }

  renderToolbar() {
    return <div style={GLOBAL_STYLES.toolbarContainer}>
      {!this.state.active && <EmbeddedButton title="Maximize" onClick={() => this.onToggleActive()} icon={FICONS.MAXIMIZE}/>}
      {this.state.active && <div style={{ ...GLOBAL_STYLES.toolbarContainer, justifyContent: "start" }}>
        <EmbeddedButton title="Minimize" onClick={() => this.onToggleActive()} icon={FICONS.MINIMIZE}/>
        <EmbeddedButton title="Download" onClick={() => this.onDownload()} icon={FICONS.DOWNLOAD}/>
        <EmbeddedButton title="Upload" onClick={() => this.onUpload()} icon={FICONS.UPLOAD}/>
        <EmbeddedButton title="Load From Script" onClick={() => this.onLoadScript()} icon={FICONS.CORNER_UP_RIGHT}/>
        <EmbeddedButton title="Run" onClick={() => this.onTest()} icon={FICONS.PLAY} disabled={this.state.invalidTimes.some(i => i)}/>
        <EmbeddedButton title="Copy Script" onClick={async () => await this.onCopy()} icon={FICONS.COPY}/>
      </div>}
      {this.state.active && <div style={{ ...GLOBAL_STYLES.toolbarContainer, justifyContent: "end" }}>
        <EmbeddedButton title="Undo" onClick={() => this.onUndo()} icon={FICONS.ARROW_LEFT} disabled={this.triggerManager.undoLen === 0}/>
        <EmbeddedButton title="Redo" onClick={() => this.onRedo()} icon={FICONS.ARROW_RIGHT} disabled={this.triggerManager.redoLen === 0}/>
        <EmbeddedButton title="Settings" onClick={() => this.onToggleSettings()} icon={FICONS.SETTINGS}/>
        <EmbeddedButton title="Help" onClick={() => this.onHelp()} icon={FICONS.HELP_CIRCLE}/>
      </div>}
      <input
        id="trigger-file-upload"
        style={{ display: "none" }}
        type="file"
        accept=".json"
        onChange={(e: React.ChangeEvent) => this.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])}
      />
    </div>;
  }

  renderTabContainer() {
    return <div style={GLOBAL_STYLES.tabContainer}>
      {...Object.keys(TRIGGER_METADATA).map((command: string) => {
        return <div>
          <button
            style={{...GLOBAL_STYLES.tab, backgroundColor: this.state.activeTab === command ? THEME.midLight : THEME.midDark }}
            onClick={() => this.onChangeTab(command as TRIGGER_ID)}
          >
            <text style={{ fontSize: TEXT_SIZES.S[this.state.fontSize] }}>
              {TRIGGER_METADATA[command as TRIGGER_ID].DISPLAY_NAME}
            </text>
          </button>
        </div>;
      })}
    </div>;
  }

  renderWindow() {
    const data = this.triggerManager.data[this.state.activeTab];

    if (data.id === TRIGGER_ID.SKIN) {
      return <SkinEditor root={this} skinTriggers={data.triggers as SkinCssTrigger[]}/>;
    }

    return <div style={GLOBAL_STYLES.window}>
      {data.id !== TRIGGER_ID.GRAVITY && this.renderWindowHead()}
      {Object.keys(data.triggers).map((i) => this.renderTrigger(parseInt(i, 10)))}
    </div>;
  }

  renderWindowHead() {
    const data = this.triggerManager.data[this.state.activeTab];

    return <div style={GLOBAL_STYLES.smoothContainer}>
      {data.id !== TRIGGER_ID.TIME ?
        this.renderTriggerProp("Smoothing", data.smoothing || 0, ["smoothing"], CONSTRAINTS.SMOOTH, undefined, true) :
        <React.Fragment>
          <label htmlFor="smoothInput" style={{ fontSize: TEXT_SIZES.S[this.state.fontSize] }}>
            Smoothing
          </label>
          <div style={GLOBAL_STYLES.checkbox.container }>
            <input
              id="smoothInput"
              style={GLOBAL_STYLES.checkbox.primary}
              type="checkbox"
              onChange={() => this.onUpdateTrigger(!this.triggerManager.data[this.state.activeTab].interpolate, ["interpolate"])}
            />
            {data.interpolate as boolean && <div style={GLOBAL_STYLES.checkbox.fill }></div>}
          </div>
        </React.Fragment>
      }
    </div>;
  }

  renderTrigger(index: number) {
    const data = this.triggerManager.data[this.state.activeTab];
    const currentTrigger = data.triggers[index];

    return <div
      style={{
        ...GLOBAL_STYLES.triggerContainer,
        fontSize: TEXT_SIZES.M[this.state.fontSize],
        backgroundColor: THEME.light
      }}
    >
      <div style={GLOBAL_STYLES.triggerActionContainer}>
        {(data.id === TRIGGER_ID.ZOOM || data.id === TRIGGER_ID.PAN) && (
          <EmbeddedButton
            onClick={() => this.onCaptureCamera(index, data.id as TRIGGER_ID)}
            icon={FICONS.CAMERA}
          />
        )}
        <EmbeddedButton
          onClick={() => this.onDeleteTrigger(index)}
          icon={FICONS.X}
          disabled={index === 0}
        />
      </div>
      
      {this.renderTimeInput((currentTrigger as TimedTrigger)[0], index)}
      {data.id === TRIGGER_ID.ZOOM && this.renderZoomTrigger((currentTrigger as ZoomTrigger), index)}
      {data.id === TRIGGER_ID.PAN && this.renderPanTrigger((currentTrigger as CameraPanTrigger), index)}
      {data.id === TRIGGER_ID.FOCUS && this.renderFocusTrigger((currentTrigger as CameraFocusTrigger), index)}
      {data.id === TRIGGER_ID.TIME && this.renderRemapTrigger((currentTrigger as TimeRemapTrigger), index)}
      {data.id === TRIGGER_ID.GRAVITY && this.renderGravityTrigger((currentTrigger as GravityTrigger), index)}
      <button style={GLOBAL_STYLES.newTriggerButton} onClick={() => this.onCreateTrigger(index)}>
        <span>{FICONS.PLUS}</span>
      </button>
    </div>;
  }

  renderTimeInput(data: TriggerTime, index: number) {
    const cProps = [CONSTRAINTS.MINUTE, CONSTRAINTS.SECOND, CONSTRAINTS.FRAME];
    const labels = ["Time", ":", ":"];

    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {...data.map((timeValue, timeIndex) => {
        return <div>
          {this.renderTriggerProp(
            labels[timeIndex],
            timeValue,
            ["triggers", index.toString(), "0", timeIndex.toString()],
            cProps[timeIndex],
            this.state.invalidTimes[index] ? "red" : "black",
            true
          )}
        </div>;
      })}
    </div>;
  }

  renderZoomTrigger(data: ZoomTrigger, index: number) {
    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {this.renderTriggerProp(
        "Zoom To",
        data[1],
        ["triggers", index.toString(), "1"],
        CONSTRAINTS.ZOOM
      )}
    </div>;
  }

  renderPanTrigger(data: CameraPanTrigger, index: number) {
    const cProps = [CONSTRAINTS.PAN_WIDTH, CONSTRAINTS.PAN_HEIGHT, CONSTRAINTS.PAN_X, CONSTRAINTS.PAN_Y];
    const labels = ["Width", "Height", "Offset X", "Y"];

    return <div>
      {...[["w", "h"], ["x", "y"]].map((pair, pairIndex) => {
        return <div style={{ display: "flex", flexDirection: "row" }}>
          {...pair.map((prop, propIndex) => {
            return <div style={GLOBAL_STYLES.triggerPropContainer}>
              {this.renderTriggerProp(
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

  renderFocusTrigger(data: CameraFocusTrigger, index: number) {
    const dropdownIndex = this.state.focusDDIndices[index];

    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      <select
        style={GLOBAL_STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => this.onChangeFocusDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={GLOBAL_STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            <text>Rider {1 + parseInt(riderIndex, 10)}</text>
          </option>;
        })}
      </select>
      {this.renderTriggerProp(
        "Weight",
        data[1][dropdownIndex],
        ["triggers", index.toString(), "1", dropdownIndex.toString()],
        CONSTRAINTS.FOCUS_WEIGHT
      )}
    </div>;
  }

  renderRemapTrigger(data: TimeRemapTrigger, index: number) {
    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {this.renderTriggerProp(
        "Speed",
        data[1],
        ["triggers", index.toString(), "1"],
        CONSTRAINTS.TIME_SPEED
      )}
    </div>;
  }

  renderGravityTrigger(data: GravityTrigger, index: number) {
    const dropdownIndex = this.state.gravityDDIndices[index];
    const cProps = [CONSTRAINTS.GRAVITY_X, CONSTRAINTS.GRAVITY_Y];
    const labels = ["X", "Y"];

    return <div style={{ display: "flex", flexDirection: "row" }}>
      <select
        style={GLOBAL_STYLES.dropdown.head}
        value={dropdownIndex}
        onChange={(e: React.ChangeEvent) => this.onChangeGravityDD(index, (e.target as HTMLInputElement).value)}
      >
        {...Object.keys(data[1]).map((riderIndex) => {
          return <option style={GLOBAL_STYLES.dropdown.option} value={parseInt(riderIndex, 10)}>
            <text>Rider {1 + parseInt(riderIndex, 10)}</text>
          </option>;
        })}
      </select>
      {...["x", "y"].map((prop, propIndex) => {
        return <div style={GLOBAL_STYLES.triggerPropContainer}>
          {this.renderTriggerProp(
            labels[propIndex],
            data[1][dropdownIndex][prop as "x" | "y"],
            ["triggers", index.toString(), "1", dropdownIndex.toString(), prop],
            cProps[propIndex]
          )}
        </div>;
      })}
    </div>;
  }

  renderTriggerProp(labelText: string, value: string | number, propPath: string[], constraints: Constraint, color?: string, isInt = false) {
    const NumberPicker = isInt ? IntPicker : FloatPicker;

    return <div>
      <label
        style={GLOBAL_STYLES.propLabel}
        htmlFor={propPath.join("_")}
      >{labelText}</label>
      <NumberPicker
        style={{ ...GLOBAL_STYLES.numberInput, color: color || "black" }}
        id={propPath.join("_")}
        value={value}
        min={constraints.MIN}
        max={constraints.MAX}
        onChange={(v: number | string) => this.onUpdateTrigger(v, propPath)}
      />
    </div>;
  }
}
