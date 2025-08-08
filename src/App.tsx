import readJsScript from "./lib/io/read-js-script";
import readJsonScript from "./lib/io/read-json-script";
import writeJsonScript from "./lib/io/write-json-script";
import { getSetting, TEXT_SIZES } from "./lib/settings-storage";
import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from "./lib/settings-storage.types";
import { TRIGGER_DATA_KEYS, TRIGGER_METADATA, TriggerDataManager } from "./lib/TriggerDataManager";
import {
  CameraFocusTrigger,
  CameraPanTrigger,
  GravityTrigger,
  LayerTrigger,
  TimedTrigger,
  TimeRemapTrigger,
  TRIGGER_ID,
  TriggerDataLookup,
  TriggerTime,
  ZoomTrigger,
} from "./lib/TriggerDataManager.types";
import { extractTriggerArray, formatSkins, generateScript, validateTimes } from "./lib/util";
import { GLOBAL_STYLES } from "./styles";

import * as F_ICONS from "./components/Icons";
import * as Actions from "./lib/redux-actions";
import * as Selectors from "./lib/redux-selectors";

import Checkbox from "./components/Checkbox";
import Dropdown from "./components/Dropdown";
import FloatingButton from "./components/FloatingButton";
import FloatPicker from "./components/FloatPicker";
import IconButton from "./components/IconButton";
import IntPicker from "./components/IntPicker";
import Settings from "./pages/Settings";
import SkinEditor from "./pages/SkinEditor";

const { store, React } = window;

export interface AppState {
  active: boolean;
  activeTab: TRIGGER_ID;
  triggerUpdateFlag: boolean;
  numRiders: number;
  layerMap: number[];
  focusDropdown: number;
  gravityDropdown: number;
  layerDropdown: number;
  settingsActive: boolean;
  fontSize: FONT_SIZE_SETTING;
  resolution: VIEWPORT_SETTING;
  invalidTimes: boolean[];
}

export class App extends React.Component {
  readonly triggerManager = new TriggerDataManager();
  readonly state: AppState;

  constructor(props: object) {
    super(props);

    this.state = {
      active: false,
      activeTab: TRIGGER_ID.ZOOM,
      triggerUpdateFlag: false,
      numRiders: 1,
      layerMap: [0],
      focusDropdown: 0,
      gravityDropdown: 0,
      layerDropdown: 0,
      settingsActive: false,
      fontSize: getSetting(SETTINGS_KEY.FONT_SIZE),
      resolution: getSetting(SETTINGS_KEY.VIEWPORT),
      invalidTimes: [],
    };

    store.subscribe(() => this.updateStore());
  }

  componentDidMount(): void {
    window.saveCommands = () => this.onDownload();
  }

  updateStore(force = false): void {
    const riderCount = Selectors.getNumRiders(store.getState());
    const stateDelta: Partial<RootState> = {};

    if (force || this.state.numRiders !== riderCount) {
      const { focusDropdown, gravityDropdown } = this.state;

      if (riderCount > 0) {
        this.triggerManager.updateRiderCount(riderCount);
        stateDelta.triggerUpdateFlag = !this.state.triggerUpdateFlag;
        stateDelta.focusDropdown = Math.min(riderCount - 1, focusDropdown);
        stateDelta.gravityDropdown = Math.min(riderCount - 1, gravityDropdown);
      } else if ([TRIGGER_ID.FOCUS, TRIGGER_ID.GRAVITY, TRIGGER_ID.SKIN].includes(this.state.activeTab)) {
        stateDelta.activeTab = TRIGGER_ID.ZOOM;
      }

      stateDelta.numRiders = riderCount;
    }

    const layerIds = Selectors.getLayerIds(store.getState());

    if (force || this.state.layerMap.length !== layerIds.length) {
      const { layerDropdown } = this.state;

      this.triggerManager.updateLayerMap(layerIds);
      stateDelta.triggerUpdateFlag = !this.state.triggerUpdateFlag;
      if (!layerIds.includes(layerDropdown)) {
        stateDelta.layerDropdown = layerIds[0];
      }
      stateDelta.layerMap = layerIds;
    }

    const sidebarOpen = Selectors.getSidebarOpen(store.getState());

    if (sidebarOpen) {
      stateDelta.active = false;
    }

    this.setState(stateDelta);
  }

  onCreateTrigger(index: number): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentPlayerIndex = Selectors.getPlayerIndex(store.getState());
    const triggerTime: TriggerTime = [
      Math.floor(currentPlayerIndex / 2400),
      Math.floor((currentPlayerIndex % 2400) / 40),
      Math.floor(currentPlayerIndex % 40),
    ];

    const currentTriggers = extractTriggerArray(this.triggerManager.data, activeTab, gravityDropdown, layerDropdown);
    const newTrigger = structuredClone(currentTriggers[index]);
    newTrigger[0] = triggerTime;

    const newTriggers = currentTriggers
      .slice(0, index + 1)
      .concat([newTrigger])
      .concat(currentTriggers.slice(index + 1));

    const updatePath = activeTab === TRIGGER_ID.GRAVITY
      ? [activeTab, "triggers", gravityDropdown.toString()]
      : activeTab === TRIGGER_ID.LAYER
      ? [activeTab, "triggers", layerDropdown.toString()]
      : [activeTab, "triggers"];

    this.triggerManager.updateFromPath(updatePath, newTriggers, activeTab);

    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
    this.setState({ invalidTimes: validateTimes(newTriggers) });
  }

  onUpdateTrigger(newValue: number | string | boolean, path: string[]): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    this.triggerManager.updateFromPath([activeTab, ...path], newValue, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== TRIGGER_ID.SKIN) {
      const newTriggers = extractTriggerArray(this.triggerManager.data, activeTab, gravityDropdown, layerDropdown);
      this.setState({ invalidTimes: validateTimes(newTriggers) });
    }
  }

  onDeleteTrigger(index: number): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentTriggers = extractTriggerArray(this.triggerManager.data, activeTab, gravityDropdown, layerDropdown);
    const newTriggers = currentTriggers.slice(0, index).concat(currentTriggers.slice(index + 1));

    const updatePath = activeTab === TRIGGER_ID.GRAVITY
      ? [activeTab, "triggers", gravityDropdown.toString()]
      : activeTab === TRIGGER_ID.LAYER
      ? [activeTab, "triggers", layerDropdown.toString()]
      : [activeTab, "triggers"];

    this.triggerManager.updateFromPath(updatePath, newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    this.setState({ invalidTimes: validateTimes(newTriggers) });
  }

  onDownload(): void {
    const jsonString = JSON.stringify(writeJsonScript(this.triggerManager.data));
    const a = document.createElement("a");
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    a.setAttribute("href", data);
    a.setAttribute("download", Selectors.getTrackTitle(store.getState()) + ".script.json");
    a.click();
    a.remove();
  }

  onUpload(): void {
    const triggerUploadInput = document.getElementById("trigger-file-upload") as HTMLInputElement;
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
            this.triggerManager.data,
          ),
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
        this.triggerManager.data,
      ),
    );
  }

  onLoad(nextTriggerData: TriggerDataLookup): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;
    try {
      TRIGGER_DATA_KEYS.forEach((commandId) => {
        this.triggerManager.updateFromPath([commandId], nextTriggerData[commandId], activeTab);
      });

      this.updateStore(true);

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggers = extractTriggerArray(nextTriggerData, activeTab, gravityDropdown, layerDropdown);
        this.setState({ invalidTimes: validateTimes(newTriggers) });
      }

      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onLoad()] ${error.message}`);
      }
    }
  }

  onRun(): void {
    const { activeTab, invalidTimes } = this.state;
    try {
      if (!invalidTimes.every((invalid) => !invalid)) {
        throw new Error("Triggers contain invalid times!");
      }

      switch (activeTab) {
        case TRIGGER_ID.ZOOM: {
          const currentData = this.triggerManager.data[TRIGGER_ID.ZOOM];
          window.getAutoZoom = window.createZoomer(currentData.triggers, currentData.smoothing);
          break;
        }
        case TRIGGER_ID.PAN: {
          const currentData = this.triggerManager.data[TRIGGER_ID.PAN];
          window.getCamBounds = window.createBoundsPanner(currentData.triggers, currentData.smoothing);
          break;
        }
        case TRIGGER_ID.FOCUS: {
          const currentData = this.triggerManager.data[TRIGGER_ID.FOCUS];
          window.getCamFocus = window.createFocuser(currentData.triggers, currentData.smoothing);
          break;
        }
        case TRIGGER_ID.TIME: {
          const currentData = this.triggerManager.data[TRIGGER_ID.TIME];
          window.timeRemapper = window.createTimeRemapper(currentData.triggers, currentData.interpolate);
          break;
        }
        case TRIGGER_ID.SKIN: {
          const currentData = this.triggerManager.data[TRIGGER_ID.SKIN];
          window.setCustomRiders(formatSkins(currentData.triggers));
          break;
        }
        case TRIGGER_ID.GRAVITY: {
          const currentData = this.triggerManager.data[TRIGGER_ID.GRAVITY];
          window.setCustomGravity(currentData.triggers);
          break;
        }
        case TRIGGER_ID.LAYER: {
          const currentData = this.triggerManager.data[TRIGGER_ID.LAYER];
          window.getLayerVisibleAtTime = window.createLayerAutomator(currentData.triggers, currentData.interpolate);
          break;
        }
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

      const script = generateScript(activeTab, this.triggerManager.data);
      return await navigator.clipboard.writeText(script);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onCopy()] ${error.message}`);
      }
    }
  }

  onUndo(): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    const tabChange = this.triggerManager.undo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (tabChange !== TRIGGER_ID.SKIN) {
      const newTriggerArray = extractTriggerArray(this.triggerManager.data, tabChange, gravityDropdown, layerDropdown);
      this.setState({ invalidTimes: validateTimes(newTriggerArray) });
    }
  }

  onRedo(): void {
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    const tabChange = this.triggerManager.redo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (tabChange !== TRIGGER_ID.SKIN) {
      const newTriggerArray = extractTriggerArray(this.triggerManager.data, tabChange, gravityDropdown, layerDropdown);
      this.setState({ invalidTimes: validateTimes(newTriggerArray) });
    }
  }

  onResetSkin(index: number): void {
    this.triggerManager.updateFromPath(
      [TRIGGER_ID.SKIN, "triggers", index.toString()],
      structuredClone(TRIGGER_METADATA[TRIGGER_ID.SKIN].TEMPLATE),
      TRIGGER_ID.SKIN,
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
    const { gravityDropdown, layerDropdown } = this.state;

    this.setState({ activeTab: tabName });

    if (tabName !== TRIGGER_ID.SKIN) {
      const newTriggerArray = extractTriggerArray(this.triggerManager.data, tabName, gravityDropdown, layerDropdown);
      this.setState({ invalidTimes: validateTimes(newTriggerArray) });
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
      [VIEWPORT_SETTING.UHD]: { width: 3840, height: 2160 },
    };

    const factor = Math.log2(resolutionPixels[newResolution].width / resolutionPixels[this.state.resolution].width);
    store.dispatch(Actions.setPlaybackDimensions(resolutionPixels[newResolution]));

    const zoomTriggers = this.triggerManager.data[TRIGGER_ID.ZOOM].triggers;
    const newZoomTriggers = zoomTriggers.map(
      (trigger) => [trigger[0], Math.round((trigger[1] + factor + Number.EPSILON) * 1e7) / 1e7],
    );
    this.triggerManager.updateFromPath([TRIGGER_ID.ZOOM, "triggers"], newZoomTriggers, TRIGGER_ID.ZOOM);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
  }

  onChangeFocusDD(value: number): void {
    this.setState({ focusDropdown: value });
  }

  onChangeGravityDD(value: number): void {
    this.setState({ gravityDropdown: value });
    this.setState({ invalidTimes: validateTimes(this.triggerManager.data[TRIGGER_ID.GRAVITY].triggers[value]) });
  }

  onChangeLayerDD(value: number): void {
    this.setState({ layerDropdown: value });
    this.setState({ invalidTimes: validateTimes(this.triggerManager.data[TRIGGER_ID.LAYER].triggers[value]) });
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
    const { activeTab, gravityDropdown, layerDropdown } = this.state;

    return (
      <div style={{ fontSize: TEXT_SIZES[this.state.fontSize], transition: "font-size 0.125s ease-in-out" }}>
        {this.renderActions()}
        {this.state.active && (
          <div style={GLOBAL_STYLES.mainContent}>
            {this.state.settingsActive
              ? <Settings root={this}></Settings>
              : (
                <div style={GLOBAL_STYLES.windowContainer}>
                  {this.renderTabContainer()}
                  {activeTab === TRIGGER_ID.SKIN
                    ? (
                      <SkinEditor root={this} skinTriggers={this.triggerManager.data[TRIGGER_ID.SKIN].triggers}>
                      </SkinEditor>
                    )
                    : (
                      <>
                        {this.renderWindowHead()}
                        {
                          <div style={{ ...GLOBAL_STYLES.windowBody, paddingBottom: "10px" }}>
                            {extractTriggerArray(this.triggerManager.data, activeTab, gravityDropdown, layerDropdown)
                              .map(
                                (trigger, index) => this.renderTrigger(trigger, index),
                              )}
                          </div>
                        }
                      </>
                    )}
                </div>
              )}
          </div>
        )}
      </div>
    );
  }

  renderActions() {
    return !this.state.active
      ? (
        <div style={GLOBAL_STYLES.actionContainer}>
          <IconButton
            title="Maximize"
            onClick={() => this.onToggleActive()}
            icon={F_ICONS.MAXIMIZE}
          >
          </IconButton>
        </div>
      )
      : (
        <div style={GLOBAL_STYLES.actionContainer}>
          <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: "start" }}>
            <IconButton
              title="Minimize"
              onClick={() => this.onToggleActive()}
              icon={F_ICONS.MINIMIZE}
            >
            </IconButton>
            <IconButton
              title="Download"
              onClick={() => this.onDownload()}
              icon={F_ICONS.DOWNLOAD}
            >
            </IconButton>
            <IconButton
              title="Upload"
              onClick={() => this.onUpload()}
              icon={F_ICONS.UPLOAD}
            >
            </IconButton>
            <IconButton
              title="Load From Script"
              onClick={() => this.onLoadScript()}
              icon={F_ICONS.CORNER_UP_RIGHT}
              disabled={this.state.activeTab === TRIGGER_ID.GRAVITY || this.state.activeTab === TRIGGER_ID.LAYER}
            >
            </IconButton>
            <IconButton
              title="Run"
              onClick={() => this.onRun()}
              icon={F_ICONS.PLAY}
              disabled={this.state.invalidTimes.some((i) => i)}
            >
            </IconButton>
            <IconButton
              title="Copy Script"
              onClick={async () => await this.onCopy()}
              icon={F_ICONS.COPY}
              disabled={this.state.activeTab === TRIGGER_ID.GRAVITY || this.state.activeTab === TRIGGER_ID.LAYER}
            >
            </IconButton>
          </div>
          <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: "end" }}>
            <IconButton
              title="Undo"
              onClick={() => this.onUndo()}
              icon={F_ICONS.ARROW_LEFT}
              disabled={this.triggerManager.undoLen === 0}
            >
            </IconButton>
            <IconButton
              title="Redo"
              onClick={() => this.onRedo()}
              icon={F_ICONS.ARROW_RIGHT}
              disabled={this.triggerManager.redoLen === 0}
            >
            </IconButton>
            <IconButton
              title="Settings"
              onClick={() => this.onToggleSettings()}
              icon={F_ICONS.SETTINGS}
            >
            </IconButton>
            <IconButton
              title="Help"
              onClick={() => this.onHelp()}
              icon={F_ICONS.HELP_CIRCLE}
            >
            </IconButton>
          </div>
          <input
            id="trigger-file-upload"
            style={{ display: "none" }}
            type="file"
            accept=".json"
            onChange={(e: React.ChangeEvent) => this.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])}
          />
        </div>
      );
  }

  renderTabContainer() {
    return (
      <div style={GLOBAL_STYLES.tabContainer}>
        {...TRIGGER_DATA_KEYS.map((command) => {
          if (
            this.state.numRiders === 0
            && [TRIGGER_ID.FOCUS, TRIGGER_ID.GRAVITY, TRIGGER_ID.SKIN].includes(command)
          ) {
            return null;
          }

          return (
            <div>
              <FloatingButton
                customStyle={GLOBAL_STYLES.tabButton}
                onClick={() => this.onChangeTab(command)}
                active={this.state.activeTab === command}
                label={TRIGGER_METADATA[command].DISPLAY_NAME}
                disabledShadow
                tabButton
              >
              </FloatingButton>
            </div>
          );
        })}
      </div>
    );
  }

  renderWindowHead() {
    const { data } = this.triggerManager;
    const { activeTab } = this.state;

    return (
      <div style={GLOBAL_STYLES.windowHead}>
        {activeTab === TRIGGER_ID.ZOOM
          && (
            <>
              {this.renderFloatPicker({
                label: "Smoothing",
                value: data[activeTab].smoothing.toString(),
                path: ["smoothing"],
                min: 0,
              })}
            </>
          )}
        {activeTab === TRIGGER_ID.PAN
          && (
            <>
              {this.renderFloatPicker({
                label: "Smoothing",
                value: data[activeTab].smoothing.toString(),
                path: ["smoothing"],
                min: 0,
              })}
            </>
          )}
        {activeTab === TRIGGER_ID.FOCUS
          && (
            <>
              {this.renderFloatPicker({
                label: "Smoothing",
                value: data[activeTab].smoothing.toString(),
                path: ["smoothing"],
                min: 0,
              })}
              <Dropdown
                customStyle={{ margin: "0em .25em" }}
                value={this.state.focusDropdown}
                mapping={[...Array(this.state.numRiders).keys()]}
                label={(_, i) => `Rider ${i + 1}`}
                onChange={(e: number) => this.onChangeFocusDD(e)}
              >
              </Dropdown>
            </>
          )}
        {activeTab === TRIGGER_ID.TIME
          && (
            <>
              {this.renderBoolPicker("Smoothing", data[activeTab].interpolate, ["interpolate"])}
            </>
          )}
        {activeTab === TRIGGER_ID.GRAVITY
          && (
            <>
              <Dropdown
                customStyle={{ margin: "0em .25em" }}
                value={this.state.gravityDropdown}
                mapping={[...Array(this.state.numRiders).keys()]}
                label={(_, i) => `Rider ${i + 1}`}
                onChange={(e: number) => this.onChangeGravityDD(e)}
              >
              </Dropdown>
            </>
          )}
        {activeTab === TRIGGER_ID.LAYER
          && (
            <>
              <Dropdown
                customStyle={{ margin: "0em .25em" }}
                value={this.state.layerDropdown}
                mapping={this.state.layerMap}
                label={(e) => `Layer ${e}`}
                onChange={(e: number) => this.onChangeLayerDD(e)}
              >
              </Dropdown>
              {this.renderBoolPicker("60 FPS", data[activeTab].interpolate, ["interpolate"])}
            </>
          )}
      </div>
    );
  }

  renderTrigger(currentTrigger: TimedTrigger, index: number) {
    const { activeTab } = this.state;

    return (
      <div
        style={{
          ...GLOBAL_STYLES.triggerContainer,
          fontSize: "1.5em",
        }}
      >
        <div style={GLOBAL_STYLES.triggerActionContainer}>
          {(activeTab === TRIGGER_ID.ZOOM || activeTab === TRIGGER_ID.PAN) && (
            <IconButton
              onClick={() => this.onCaptureCamera(index, activeTab)}
              icon={F_ICONS.CAMERA}
              title="Capture Editor Camera"
            >
            </IconButton>
          )}
          <IconButton
            onClick={() => this.onDeleteTrigger(index)}
            icon={F_ICONS.X}
            disabled={index === 0}
            title="Delete"
          >
          </IconButton>
        </div>

        {this.renderTimeInput(currentTrigger[0], index)}
        {activeTab === TRIGGER_ID.ZOOM && this.renderZoomTrigger(currentTrigger as ZoomTrigger, index)}
        {activeTab === TRIGGER_ID.PAN && this.renderPanTrigger(currentTrigger as CameraPanTrigger, index)}
        {activeTab === TRIGGER_ID.FOCUS && this.renderFocusTrigger(currentTrigger as CameraFocusTrigger, index)}
        {activeTab === TRIGGER_ID.TIME && this.renderRemapTrigger(currentTrigger as TimeRemapTrigger, index)}
        {activeTab === TRIGGER_ID.GRAVITY && this.renderGravityTrigger(currentTrigger as GravityTrigger, index)}
        {activeTab === TRIGGER_ID.LAYER && this.renderLayerTrigger(currentTrigger as LayerTrigger, index)}
        <div style={GLOBAL_STYLES.createTriggerContainer}>
          <FloatingButton
            onClick={() => this.onCreateTrigger(index)}
            customStyle={{ fontSize: "0.75em" }}
            label="+"
            active
          >
          </FloatingButton>
        </div>
      </div>
    );
  }

  renderTimeInput(data: TriggerTime, index: number) {
    const props = [
      { id: "0", label: "Time", min: 0, max: 999 },
      { id: "1", label: ":", min: 0, max: 59 },
      { id: "2", label: ":", min: 0, max: 39 },
    ] as const;

    const pathHead = this.state.activeTab === TRIGGER_ID.GRAVITY
      ? ["triggers", this.state.gravityDropdown.toString()]
      : this.state.activeTab === TRIGGER_ID.LAYER
      ? ["triggers", this.state.layerDropdown.toString()]
      : ["triggers"];

    return (
      <div style={GLOBAL_STYLES.triggerPropContainer}>
        {...props.map((prop) => {
          const path = pathHead.concat([index.toString(), "0", prop.id]);

          return (
            <div>
              {this.renderIntPicker({
                label: prop.label,
                value: data[parseInt(prop.id)].toString(),
                path,
                min: prop.min,
                max: prop.max,
                customStyle: { color: this.state.invalidTimes[index] ? "red" : GLOBAL_STYLES.root.color },
              })}
            </div>
          );
        })}
      </div>
    );
  }

  renderZoomTrigger(data: ZoomTrigger, index: number) {
    const path = ["triggers", index.toString(), "1"];

    return (
      <div style={GLOBAL_STYLES.triggerPropContainer}>
        {this.renderFloatPicker({
          label: "Zoom To",
          value: data[1].toString(),
          path,
        })}
      </div>
    );
  }

  renderPanTrigger(data: CameraPanTrigger, index: number) {
    const props = [
      ["Size", { id: "w", label: "Width", min: 0 }, { id: "h", label: "Height", min: 0 }],
      ["Camera Offset", { id: "x", label: "X", min: -Number.MAX_VALUE }, {
        id: "y",
        label: "Y",
        min: -Number.MAX_VALUE,
      }],
      ["Pixel Offset", { id: "px", label: "X", min: -Number.MAX_VALUE }, {
        id: "py",
        label: "Y",
        min: -Number.MAX_VALUE,
      }],
    ] as const;

    return (
      <div>
        {...props.map((pair) => {
          return (
            <div style={{ display: "flex", flexDirection: "row" }}>
              {...pair.map((prop) => {
                if (typeof prop === "string") {
                  return (
                    <div style={GLOBAL_STYLES.triggerPropContainer}>
                      {prop}
                    </div>
                  );
                }

                const path = ["triggers", index.toString(), "1", prop.id];

                return (
                  <div style={GLOBAL_STYLES.triggerPropContainer}>
                    {this.renderFloatPicker({
                      label: prop.label,
                      value: data[1][prop.id].toString(),
                      path,
                      min: prop.min,
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  renderFocusTrigger(data: CameraFocusTrigger, index: number) {
    const path = ["triggers", index.toString(), "1", this.state.focusDropdown.toString()];

    return (
      <div style={GLOBAL_STYLES.triggerPropContainer}>
        {this.renderFloatPicker({
          label: "Weight",
          value: data[1][this.state.focusDropdown].toString(),
          path,
          min: 0,
        })}
      </div>
    );
  }

  renderRemapTrigger(data: TimeRemapTrigger, index: number) {
    const path = ["triggers", index.toString(), "1"];

    return (
      <div style={GLOBAL_STYLES.triggerPropContainer}>
        {this.renderFloatPicker({
          label: "Speed",
          value: data[1].toString(),
          path,
          min: 0.001,
        })}
      </div>
    );
  }

  renderGravityTrigger(data: GravityTrigger, index: number) {
    const props = [
      { id: "x", label: "X" },
      { id: "y", label: "Y" },
    ] as const;

    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        {...props.map((prop) => {
          const path = ["triggers", this.state.gravityDropdown.toString(), index.toString(), "1", prop.id];

          return (
            <div style={GLOBAL_STYLES.triggerPropContainer}>
              {this.renderFloatPicker({
                label: prop.label,
                value: data[1][prop.id].toString(),
                path,
              })}
            </div>
          );
        })}
      </div>
    );
  }

  renderLayerTrigger(data: LayerTrigger, index: number) {
    const props = [
      { id: "on", label: "ON" },
      { id: "off", label: "OFF" },
      { id: "offset", label: "OFFSET" },
    ] as const;

    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        {...props.map((prop) => {
          const path = ["triggers", this.state.layerDropdown.toString(), index.toString(), "1", prop.id];

          return (
            <div style={GLOBAL_STYLES.triggerPropContainer}>
              {this.renderIntPicker({
                label: prop.label,
                value: data[1][prop.id].toString(),
                path,
                min: 0,
              })}
            </div>
          );
        })}
      </div>
    );
  }

  renderBoolPicker(labelText: string, value: boolean, propPath: string[]) {
    return (
      <div style={GLOBAL_STYLES.triggerRowContainer}>
        <label style={GLOBAL_STYLES.spacedProperty} htmlFor={propPath.join("-")}>
          {labelText}
        </label>
        <Checkbox
          customStyle={GLOBAL_STYLES.spacedProperty}
          id={propPath.join("-")}
          value={value}
          onCheck={() => this.onUpdateTrigger(!value, propPath)}
        >
        </Checkbox>
      </div>
    );
  }

  renderIntPicker(
    { label, value, path, min, max, customStyle }: {
      label: string;
      value: string;
      path: string[];
      min?: number;
      max?: number;
      customStyle?: React.CSSProperties;
    },
  ) {
    return (
      <div style={GLOBAL_STYLES.triggerRowContainer}>
        <label style={GLOBAL_STYLES.spacedProperty} htmlFor={path.join("-")}>
          {label}
        </label>
        <IntPicker
          customStyle={{ ...GLOBAL_STYLES.spacedProperty, ...customStyle }}
          id={path.join("-")}
          value={value}
          min={min}
          max={max}
          onChange={(v: number) => this.onUpdateTrigger(v, path)}
        >
        </IntPicker>
      </div>
    );
  }

  renderFloatPicker(
    { label, value, path, min, max, customStyle }: {
      label: string;
      value: string;
      path: string[];
      min?: number;
      max?: number;
      customStyle?: React.CSSProperties;
    },
  ) {
    return (
      <div style={GLOBAL_STYLES.triggerRowContainer}>
        <label style={GLOBAL_STYLES.spacedProperty} htmlFor={path.join("-")}>
          {label}
        </label>
        <FloatPicker
          customStyle={{ ...GLOBAL_STYLES.spacedProperty, ...customStyle }}
          id={path.join("-")}
          value={value}
          min={min}
          max={max}
          onChange={(v: number) => this.onUpdateTrigger(v, path)}
        >
        </FloatPicker>
      </div>
    );
  }
}
