import { TriggerDataManager, TRIGGER_METADATA } from "./lib/TriggerDataManager";
import { TRIGGER_ID, TriggerDataLookup, TriggerTime, TimedTrigger, ZoomTrigger, CameraFocusTrigger, GravityTrigger, SkinCssTrigger, CameraPanTrigger, TimeRemapTrigger } from "./lib/TriggerDataManager.types";
import readJsScript from "./io/read-js-script";
import readJsonScript from "./io/read-json-script";
import { formatSkins, writeScript } from "./io/write-js-script";
import { getSetting, saveSetting } from "./lib/settings-storage";
import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from "./lib/settings-storage.types";
import * as Actions from "./lib/redux-actions";
import * as Selectors from "./lib/redux-selectors";
import { validateTimes } from "./lib/validation";
import App from "./App";

const { store, React } = window;

export interface RootState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerUpdateFlag: boolean
  focusDDIndices: number[]
  gravityDDIndices: number[]
  settingsActive: boolean
  settingsDirty: boolean
  fontSize: FONT_SIZE_SETTING
  fontSizeSetting: FONT_SIZE_SETTING
  resolution: VIEWPORT_SETTING
  resolutionSetting: VIEWPORT_SETTING
  invalidTimes: boolean[]
}

export class RootComponent extends React.Component {
  readonly componentManager = new App(this);
  readonly triggerManager = new TriggerDataManager();
  readonly state: RootState;
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
      settingsDirty: false,
      fontSize: getSetting(SETTINGS_KEY.FONT_SIZE),
      resolution: getSetting(SETTINGS_KEY.VIEWPORT),
      fontSizeSetting: getSetting(SETTINGS_KEY.FONT_SIZE),
      resolutionSetting: getSetting(SETTINGS_KEY.VIEWPORT),
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
    const { settingsActive, settingsDirty, fontSize, resolution } = this.state;

    if (settingsActive && settingsDirty) {
      this.setState({ fontSizeSetting: fontSize });
      this.setState({ resolutionSetting: resolution });
      this.setState({ settingsDirty: false });
    }

    this.setState({ settingsActive: !settingsActive });
  }

  onHelp(): void {
    window.open("https://github.com/Malizma333/line-rider-command-editor-userscript#readme");
  }

  onChangeFontSize(newFontSize: number): void {
    const { fontSize } = this.state;

    if (newFontSize !== fontSize) {
      this.setState({ settingsDirty: true });
    }

    this.setState({ fontSizeSetting: newFontSize });
  }

  onChangeViewport(newResolution: number): void {
    const { resolution } = this.state;

    if (resolution !== newResolution) {
      this.setState({ settingsDirty: true });
    }

    this.setState({ resolutionSetting: newResolution });
  }

  onApplySettings(): void {
    const { resolutionSetting, resolution, fontSizeSetting } = this.state;

    const resolutionPixels = {
      [VIEWPORT_SETTING.HD]: { width: 1280, height: 720 },
      [VIEWPORT_SETTING.FHD]: { width: 1920, height: 1080 },
      [VIEWPORT_SETTING.QHD]: { width: 2560, height: 1440 },
      [VIEWPORT_SETTING.UHD]: { width: 3840, height: 2160 }
    };

    const factor = Math.log2(resolutionPixels[resolutionSetting].width / resolutionPixels[resolution].width);
    store.dispatch(Actions.setPlaybackDimensions(resolutionPixels[resolutionSetting]));

    const zoomTriggers = this.triggerManager.data[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[];
    const newZoomTriggers = zoomTriggers.map(trigger => [trigger[0], Math.round((trigger[1] + factor + Number.EPSILON) * 1e7) / 1e7]);
    this.triggerManager.updateFromPath([TRIGGER_ID.ZOOM, "triggers"], newZoomTriggers, TRIGGER_ID.ZOOM);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    saveSetting(SETTINGS_KEY.FONT_SIZE, fontSizeSetting);
    saveSetting(SETTINGS_KEY.VIEWPORT, resolutionSetting);

    this.setState({ settingsDirty: false });
    this.setState({ fontSize: fontSizeSetting });
    this.setState({ resolution: resolutionSetting });
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
    return this.componentManager.main();
  }
}
