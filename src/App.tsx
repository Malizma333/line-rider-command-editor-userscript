import { TriggerDataManager, TRIGGER_METADATA, isLayerTrigger } from './lib/TriggerDataManager';
import {
  TRIGGER_ID, TriggerDataLookup, TriggerTime, TimedTrigger, ZoomTrigger, CameraFocusTrigger, GravityTrigger,
  SkinCssTrigger, CameraPanTrigger, TimeRemapTrigger,
  LayerTrigger,
  Trigger,
} from './lib/TriggerDataManager.types';
import { readJsScript } from './lib/io/read-js-script';
import { readJsonScript } from './lib/io/read-json-script';
import { writeJsScript } from './lib/io/write-js-script';
import { getSetting, TEXT_SIZES } from './lib/settings-storage';
import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from './lib/settings-storage.types';
import { validateTimes, formatSkins } from './lib/util';
import { CONSTRAINT } from './lib/constraints';
import { GLOBAL_STYLES, THEME } from './styles';

import * as Actions from './lib/redux-actions';
import * as Selectors from './lib/redux-selectors';
import * as FICONS from './components/Icons';

import FloatPicker from './components/FloatPicker';
import IntPicker from './components/IntPicker';
import IconButton from './components/IconButton';
import SkinEditor from './pages/SkinEditor';
import Settings from './pages/Settings';
import Checkbox from './components/Checkbox';
import { Constraint, CONSTRAINT_TYPE } from './lib/constraints.types';
import Dropdown from './components/Dropdown';
import FloatingButton from './components/FloatingButton';

const { store, React } = window;

export interface AppState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerUpdateFlag: boolean
  numRiders: number
  layerMap: number[]
  focusDropdown: number
  gravityDropdown: number
  layerDropdown: number
  settingsActive: boolean
  fontSize: FONT_SIZE_SETTING
  resolution: VIEWPORT_SETTING
  invalidTimes: boolean[]
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

  updateStore(): void {
    const riderCount = Selectors.getNumRiders(store.getState());

    if (this.state.numRiders !== riderCount) {
      const { focusDropdown, gravityDropdown } = this.state;

      if (riderCount > 0) {
        this.triggerManager.updateRiderCount(riderCount);
        this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
        this.setState({ focusDropdown: Math.min(riderCount - 1, focusDropdown) });
        this.setState({ gravityDropdown: Math.min(riderCount - 1, gravityDropdown) });
      } else if ([TRIGGER_ID.FOCUS, TRIGGER_ID.GRAVITY, TRIGGER_ID.SKIN].includes(this.state.activeTab as TRIGGER_ID)) {
        this.setState({ activeTab: TRIGGER_ID.ZOOM });
      }

      this.setState({ numRiders: riderCount });
    }

    const layerIds = Selectors.getLayers(store.getState());

    if (this.state.layerMap.length !== layerIds.length) {
      const { layerDropdown } = this.state;

      this.triggerManager.updateLayerMap(layerIds);
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
      if (!layerIds.includes(layerDropdown)) {
        this.setState({ layerDropdown: layerIds[0] });
      }
      this.setState({ layerMap: layerIds });
    }

    const sidebarOpen = Selectors.getSidebarOpen(store.getState());

    if (sidebarOpen) {
      this.setState({ active: false });
    }
  }

  onCreateTrigger(index: number): void {
    const { activeTab, layerDropdown } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentPlayerIndex = Selectors.getPlayerIndex(store.getState());
    const triggerTime: TriggerTime = [
      Math.floor(currentPlayerIndex / 2400),
      Math.floor((currentPlayerIndex % 2400) / 40),
      Math.floor(currentPlayerIndex % 40),
    ];

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggerData = structuredClone((currentTriggers[index] as TimedTrigger)[1]);

    if (isLayerTrigger(newTriggerData)) {
      newTriggerData[1].id = layerDropdown;
    }

    const newTrigger = [triggerTime, newTriggerData] as TimedTrigger;
    const newTriggers = currentTriggers
        .slice(0, index + 1)
        .concat([newTrigger])
        .concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
  }

  onUpdateTrigger(newValue: number | string | boolean, path: string[]): void {
    const { activeTab, layerDropdown } = this.state;

    this.triggerManager.updateFromPath([activeTab, ...path], newValue, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
  }

  onDeleteTrigger(index: number): void {
    const { activeTab, layerDropdown } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggers = currentTriggers.slice(0, index).concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
  }

  onDownload(): void {
    const jsonString = JSON.stringify(this.triggerManager.data);
    const a = document.createElement('a');
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
    a.setAttribute('href', data);
    a.setAttribute('download', Selectors.getTrackTitle(store.getState()) + '.script.json');
    a.click();
    a.remove();
  }

  onUpload(): void {
    const triggerUploadInput = (document.getElementById('trigger-file-upload') as HTMLInputElement);
    triggerUploadInput.value = '';
    triggerUploadInput.click();
  }

  onLoadFile(file: File): void {
    const reader = new window.FileReader();
    reader.onload = () => {
      try {
        this.onLoad(
            readJsonScript(
                JSON.parse(reader.result as string),
                this.triggerManager.data as TriggerDataLookup,
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
        this.triggerManager.data as TriggerDataLookup,
        ),
    );
  }

  onLoad(nextTriggerData: TriggerDataLookup): void {
    const { activeTab, layerDropdown } = this.state;
    try {
      Object.keys(TRIGGER_METADATA).forEach((commandId: string) => {
        this.triggerManager.updateFromPath([commandId], nextTriggerData[commandId as TRIGGER_ID], activeTab);
      });

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggerArray = nextTriggerData[activeTab].triggers;
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
      }

      const layerIds = Selectors.getLayers(store.getState());
      this.triggerManager.updateLayerMap(layerIds);

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
        throw new Error('Triggers contain invalid times!');
      }

      const currentData = this.triggerManager.data[activeTab];

      switch (activeTab) {
        case TRIGGER_ID.ZOOM:
          window.getAutoZoom = window.createZoomer(
            currentData.triggers as ZoomTrigger[],
            currentData.smoothing,
          );
          break;
        case TRIGGER_ID.PAN:
          window.getCamBounds = window.createBoundsPanner(
            currentData.triggers as CameraPanTrigger[],
            currentData.smoothing,
          );
          break;
        case TRIGGER_ID.FOCUS:
          window.getCamFocus = window.createFocuser(
            currentData.triggers as CameraFocusTrigger[],
            currentData.smoothing,
          );
          break;
        case TRIGGER_ID.TIME:
          window.timeRemapper = window.createTimeRemapper(
            currentData.triggers as TimeRemapTrigger[],
            currentData.interpolate,
          );
          break;
        case TRIGGER_ID.SKIN:
          window.setCustomRiders(formatSkins(currentData.triggers as SkinCssTrigger[]));
          break;
        case TRIGGER_ID.GRAVITY:
          if (window.setCustomGravity !== undefined) {
            window.setCustomGravity(currentData.triggers as GravityTrigger[]);
          }
          break;
        case TRIGGER_ID.LAYER:
          if (window.createLayerAutomator !== undefined) {
            window.createLayerAutomator(currentData.triggers as LayerTrigger[], currentData.interpolate || false);
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
        throw new Error('Triggers contain invalid times!');
      }

      const script = writeJsScript(activeTab, this.triggerManager.data as TriggerDataLookup);
      return await navigator.clipboard.writeText(script);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Root.onCopy()] ${error.message}`);
      }
    }
  }

  onUndo(): void {
    const { activeTab, layerDropdown } = this.state;

    const tabChange = this.triggerManager.undo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (activeTab !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[activeTab].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
    }
  }

  onRedo(): void {
    const { activeTab, layerDropdown } = this.state;

    const tabChange = this.triggerManager.redo();
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    if (activeTab !== tabChange) {
      this.setState({ activeTab: tabChange });
    }

    if (activeTab !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[activeTab].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
    }
  }

  onResetSkin(index: number): void {
    this.triggerManager.updateFromPath(
        [TRIGGER_ID.SKIN, 'triggers', index.toString()],
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
    const { layerDropdown } = this.state;

    this.setState({ activeTab: tabName });

    if (tabName !== TRIGGER_ID.SKIN) {
      const newTriggerArray = this.triggerManager.data[tabName].triggers;
      this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[], layerDropdown) });
    }
  }

  onToggleSettings(): void {
    const { settingsActive } = this.state;
    this.setState({ settingsActive: !settingsActive });
  }

  onHelp(): void {
    window.open('https://github.com/Malizma333/line-rider-command-editor-userscript#readme');
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

    const zoomTriggers = this.triggerManager.data[TRIGGER_ID.ZOOM].triggers as ZoomTrigger[];
    const newZoomTriggers = zoomTriggers.map(
        (trigger) => [trigger[0], Math.round((trigger[1] + factor + Number.EPSILON) * 1e7) / 1e7],
    );
    this.triggerManager.updateFromPath([TRIGGER_ID.ZOOM, 'triggers'], newZoomTriggers, TRIGGER_ID.ZOOM);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
  }

  onChangeFocusDD(value: number): void {
    this.setState({ focusDropdown: value });
  }

  onChangeGravityDD(value: number): void {
    this.setState({ gravityDropdown: value });
  }

  onChangeLayerDD(value: number): void {
    this.setState({ layerDropdown: value });
  }

  onCaptureCamera(index: number, triggerType: TRIGGER_ID) {
    switch (triggerType) {
      case TRIGGER_ID.ZOOM: {
        this.onUpdateTrigger(Math.log2(Selectors.getEditorZoom(store.getState())), ['triggers', index.toString(), '1']);
        break;
      }
      case TRIGGER_ID.PAN: {
        const { x, y } = Selectors.getEditorPosition(store.getState());
        const track = Selectors.getSimulatorTrack(store.getState());
        const { width, height } = Selectors.getPlaybackDimensions(store.getState());
        const zoom = Selectors.getPlaybackZoom(store.getState());
        const playerIndex = Math.floor(Selectors.getPlayerIndex(store.getState()));
        const camera = store.getState().camera.playbackFollower.getCamera(track, { zoom, width, height }, playerIndex);
        this.onUpdateTrigger((x - camera.x) * zoom / width, ['triggers', index.toString(), '1', 'x']);
        this.onUpdateTrigger((y - camera.y) * zoom / height, ['triggers', index.toString(), '1', 'y']);
        break;
      }
      default: {
        break;
      }
    }
  }

  render() {
    const data = this.triggerManager.data[this.state.activeTab];

    // TODO this is kind of awful, refactor
    let computeIndex = 0;
    const computedTriggers = [] as [Trigger, number, number][];
    for (let i = 0; i < data.triggers.length; i++) {
      if (!isLayerTrigger(data.triggers[i]) || (data.triggers[i] as LayerTrigger)[1].id === this.state.layerDropdown) {
        computedTriggers.push([data.triggers[i], i, computeIndex++]);
      }
    }

    return <div style={{ fontSize: TEXT_SIZES[this.state.fontSize], transition: 'font-size 0.125s ease-in-out' }}>
      {this.renderActions()}
      {this.state.active && <div style={GLOBAL_STYLES.mainContent}>
        {this.state.settingsActive ?
          <Settings root={this}></Settings> :
          <div style={GLOBAL_STYLES.windowContainer}>
            {this.renderTabContainer()}
            {data.id === TRIGGER_ID.SKIN ?
              <SkinEditor root={this} skinTriggers={data.triggers as SkinCssTrigger[]}></SkinEditor> :
              <>
                {this.renderWindowHead()}
                {<div style={{ ...GLOBAL_STYLES.windowBody, paddingBottom: '10px' }}>
                  {computedTriggers.map(
                      (computeData) => this.renderTrigger(computeData[0], computeData[1], computeData[2]),
                  )}
                </div>}
              </>
            }
          </div>}
      </div>}
    </div>;
  }

  renderActions() {
    return !this.state.active ? <div style={GLOBAL_STYLES.actionContainer}>
      <IconButton
        title="Maximize"
        onClick={() => this.onToggleActive()}
        icon={FICONS.MAXIMIZE}
      ></IconButton>
    </div> : <div style={GLOBAL_STYLES.actionContainer}>
      <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: 'start' }}>
        <IconButton
          title="Minimize"
          onClick={() => this.onToggleActive()}
          icon={FICONS.MINIMIZE}
        ></IconButton>
        <IconButton
          title="Download"
          onClick={() => this.onDownload()}
          icon={FICONS.DOWNLOAD}
        ></IconButton>
        <IconButton
          title="Upload"
          onClick={() => this.onUpload()}
          icon={FICONS.UPLOAD}
        ></IconButton>
        <IconButton
          title="Load From Script"
          onClick={() => this.onLoadScript()}
          icon={FICONS.CORNER_UP_RIGHT}
          disabled={this.state.activeTab === TRIGGER_ID.GRAVITY || this.state.activeTab === TRIGGER_ID.LAYER}
        ></IconButton>
        <IconButton
          title="Run"
          onClick={() => this.onTest()}
          icon={FICONS.PLAY}
          disabled={this.state.invalidTimes.some((i) => i)}
        ></IconButton>
        <IconButton
          title="Copy Script"
          onClick={async () => await this.onCopy()}
          icon={FICONS.COPY}
          disabled={this.state.activeTab === TRIGGER_ID.GRAVITY || this.state.activeTab === TRIGGER_ID.LAYER}
        ></IconButton>
      </div>
      <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: 'end' }}>
        <IconButton
          title="Undo"
          onClick={() => this.onUndo()}
          icon={FICONS.ARROW_LEFT}
          disabled={this.triggerManager.undoLen === 0}
        ></IconButton>
        <IconButton
          title="Redo"
          onClick={() => this.onRedo()}
          icon={FICONS.ARROW_RIGHT}
          disabled={this.triggerManager.redoLen === 0}
        ></IconButton>
        <IconButton
          title="Settings"
          onClick={() => this.onToggleSettings()}
          icon={FICONS.SETTINGS}
        ></IconButton>
        <IconButton
          title="Help"
          onClick={() => this.onHelp()}
          icon={FICONS.HELP_CIRCLE}
        ></IconButton>
      </div>
      <input
        id="trigger-file-upload"
        style={{ display: 'none' }}
        type="file"
        accept=".json"
        onChange={(e: React.ChangeEvent) => this.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])}
      />
    </div>;
  }

  renderTabContainer() {
    return <div style={GLOBAL_STYLES.tabContainer}>
      {...Object.keys(TRIGGER_METADATA).map((command: string) => {
        if (this.state.numRiders === 0 &&
            [TRIGGER_ID.FOCUS, TRIGGER_ID.GRAVITY, TRIGGER_ID.SKIN].includes(command as TRIGGER_ID)) {
          return null;
        }

        return <div>
          <FloatingButton
            customStyle={{
              ...GLOBAL_STYLES.tabButton,
              borderBottom: this.state.activeTab === command ? '2px solid transparent' : THEME.primaryBorder,
            }}
            onClick={() => this.onChangeTab(command as TRIGGER_ID)}
            active={this.state.activeTab === command}
            label={TRIGGER_METADATA[command as TRIGGER_ID].DISPLAY_NAME}
            disabledShadow
          ></FloatingButton>
        </div>;
      })}
    </div>;
  }

  renderWindowHead() {
    const data = this.triggerManager.data[this.state.activeTab];

    return <div style={GLOBAL_STYLES.windowHead}>
      {data.id === TRIGGER_ID.ZOOM &&
        <>
          {this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)}
        </>
      }
      {data.id === TRIGGER_ID.PAN &&
        <>
          {this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)}
        </>
      }
      {data.id === TRIGGER_ID.FOCUS &&
        <>
          {this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)}
          <Dropdown
            customStyle={{ margin: '0em .25em' }}
            value={this.state.focusDropdown}
            mapping={[...Array(this.state.numRiders).keys()]}
            label={(_, i) => `Rider ${i + 1}`}
            onChange={(e: number) => this.onChangeFocusDD(e)}
          ></Dropdown>
        </>
      }
      {data.id === TRIGGER_ID.TIME &&
        <>
          {this.renderTriggerProp('Smoothing', data.interpolate || false, ['interpolate'], CONSTRAINT.INTERPOLATE)}
        </>
      }
      {data.id === TRIGGER_ID.GRAVITY &&
        <>
          <Dropdown
            customStyle={{ margin: '0em .25em' }}
            value={this.state.gravityDropdown}
            mapping={[...Array(this.state.numRiders).keys()]}
            label={(_, i) => `Rider ${i + 1}`}
            onChange={(e: number) => this.onChangeGravityDD(e)}
          ></Dropdown>
        </>
      }
      {data.id === TRIGGER_ID.LAYER &&
        <>
          <Dropdown
            customStyle={{ margin: '0em .25em' }}
            value={this.state.layerDropdown}
            mapping={this.state.layerMap}
            label={(e) => `Layer ${e}`}
            onChange={(e: number) => this.onChangeLayerDD(e)}
          ></Dropdown>
          {this.renderTriggerProp('60 FPS', data.interpolate || false, ['interpolate'], CONSTRAINT.INTERPOLATE)}
        </>
      }
    </div>;
  }

  renderTrigger(currentTrigger: Trigger, realIndex: number, index: number) {
    const data = this.triggerManager.data[this.state.activeTab];

    return <div style={{
      ...GLOBAL_STYLES.triggerContainer,
      fontSize: '1.5em',
    }}>
      <div style={GLOBAL_STYLES.triggerActionContainer}>
        {(data.id === TRIGGER_ID.ZOOM || data.id === TRIGGER_ID.PAN) && (
          <IconButton
            onClick={() => this.onCaptureCamera(realIndex, data.id as TRIGGER_ID)}
            icon={FICONS.CAMERA}
            title="Capture Editor Camera"
          ></IconButton>
        )}
        <IconButton
          onClick={() => this.onDeleteTrigger(realIndex)}
          icon={FICONS.X}
          disabled={index === 0}
          title="Delete"
        ></IconButton>
      </div>

      {this.renderTimeInput((currentTrigger as TimedTrigger)[0], realIndex, index)}
      {data.id === TRIGGER_ID.ZOOM && this.renderZoomTrigger((currentTrigger as ZoomTrigger), realIndex)}
      {data.id === TRIGGER_ID.PAN && this.renderPanTrigger((currentTrigger as CameraPanTrigger), realIndex)}
      {data.id === TRIGGER_ID.FOCUS && this.renderFocusTrigger((currentTrigger as CameraFocusTrigger), realIndex)}
      {data.id === TRIGGER_ID.TIME && this.renderRemapTrigger((currentTrigger as TimeRemapTrigger), realIndex)}
      {data.id === TRIGGER_ID.GRAVITY && this.renderGravityTrigger((currentTrigger as GravityTrigger), realIndex)}
      {data.id === TRIGGER_ID.LAYER && this.renderLayerTrigger((currentTrigger as LayerTrigger), realIndex)}
      <div style={GLOBAL_STYLES.createTriggerContainer}>
        <FloatingButton
          onClick={() => this.onCreateTrigger(realIndex)}
          customStyle={{ fontSize: '0.75em' }}
          label="+"
          active
        ></FloatingButton>
      </div>
    </div>;
  }

  renderTimeInput(data: TriggerTime, realIndex: number, index: number) {
    const cProps = [CONSTRAINT.MINUTE, CONSTRAINT.SECOND, CONSTRAINT.FRAME];
    const labels = ['Time', ':', ':'];

    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {...data.map((timeValue, timeIndex) => {
        return <div>
          {this.renderTriggerProp(
              labels[timeIndex],
              timeValue,
              ['triggers', realIndex.toString(), '0', timeIndex.toString()],
              cProps[timeIndex],
              this.state.invalidTimes[index] ? 'red' : GLOBAL_STYLES.root.color,
          )}
        </div>;
      })}
    </div>;
  }

  renderZoomTrigger(data: ZoomTrigger, index: number) {
    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {this.renderTriggerProp(
          'Zoom To',
          data[1],
          ['triggers', index.toString(), '1'],
          CONSTRAINT.ZOOM,
      )}
    </div>;
  }

  renderPanTrigger(data: CameraPanTrigger, index: number) {
    const cProps = [CONSTRAINT.PAN_WIDTH, CONSTRAINT.PAN_HEIGHT, CONSTRAINT.PAN_X, CONSTRAINT.PAN_Y];
    const labels = ['Width', 'Height', 'Offset X', 'Y'];

    return <div>
      {...[['w', 'h'], ['x', 'y']].map((pair, pairIndex) => {
        return <div style={{ display: 'flex', flexDirection: 'row' }}>
          {...pair.map((prop, propIndex) => {
            return <div style={GLOBAL_STYLES.triggerPropContainer}>
              {this.renderTriggerProp(
                  labels[propIndex + 2 * pairIndex],
                  data[1][prop as 'w' | 'h' | 'x' | 'y'],
                  ['triggers', index.toString(), '1', prop],
                  cProps[propIndex + 2 * pairIndex],
              )}
            </div>;
          })}
        </div>;
      })}
    </div>;
  }

  renderFocusTrigger(data: CameraFocusTrigger, index: number) {
    const dropdownIndex = this.state.focusDropdown;

    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {this.renderTriggerProp(
          'Weight',
          data[1][dropdownIndex],
          ['triggers', index.toString(), '1', dropdownIndex.toString()],
          CONSTRAINT.FOCUS_WEIGHT,
      )}
    </div>;
  }

  renderRemapTrigger(data: TimeRemapTrigger, index: number) {
    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {this.renderTriggerProp(
          'Speed',
          data[1],
          ['triggers', index.toString(), '1'],
          CONSTRAINT.TIME_SPEED,
      )}
    </div>;
  }

  renderGravityTrigger(data: GravityTrigger, index: number) {
    const dropdownIndex = this.state.gravityDropdown;
    const cProps = [CONSTRAINT.GRAVITY_X, CONSTRAINT.GRAVITY_Y];
    const labels = ['X', 'Y'];

    return <div style={{ display: 'flex', flexDirection: 'row' }}>
      {...['x', 'y'].map((prop, propIndex) => {
        return <div style={GLOBAL_STYLES.triggerPropContainer}>
          {this.renderTriggerProp(
              labels[propIndex],
              data[1][dropdownIndex][prop as 'x' | 'y'],
              ['triggers', index.toString(), '1', dropdownIndex.toString(), prop],
              cProps[propIndex],
          )}
        </div>;
      })}
    </div>;
  }

  renderLayerTrigger(data: LayerTrigger, index: number) {
    const cProps = [CONSTRAINT.LAYER_ON, CONSTRAINT.LAYER_OFF, CONSTRAINT.LAYER_OFFSET];
    const labels = ['ON', 'OFF', 'OFFSET'];

    return <div style={{ display: 'flex', flexDirection: 'row' }}>
      {...['on', 'off', 'offset'].map((prop, propIndex) => {
        return <div style={GLOBAL_STYLES.triggerPropContainer}>
          {this.renderTriggerProp(
              labels[propIndex],
              data[1][prop as 'on' | 'off' | 'offset'],
              ['triggers', index.toString(), '1', prop],
              cProps[propIndex],
          )}
        </div>;
      })}
    </div>;
  }

  renderTriggerProp(
      labelText: string,
      value: string | number | boolean,
      propPath: string[],
      constraint: Constraint,
      color?: string,
  ) {
    const NumberPicker = constraint.TYPE === CONSTRAINT_TYPE.FLOAT ? FloatPicker : IntPicker;

    return <div style={GLOBAL_STYLES.triggerRowContainer}>
      <label style={GLOBAL_STYLES.spacedProperty} htmlFor={propPath.join('_')}>
        {labelText}
      </label>
      {constraint.TYPE === CONSTRAINT_TYPE.BOOL ?
      <Checkbox
        customStyle={GLOBAL_STYLES.spacedProperty}
        id={propPath.join('_')}
        value={value as boolean}
        onCheck={() => this.onUpdateTrigger(!value, propPath)}
      ></Checkbox> : <NumberPicker
        customStyle={{ ...GLOBAL_STYLES.spacedProperty, color: color || GLOBAL_STYLES.root.color }}
        id={propPath.join('_')}
        value={value as number | string}
        min={constraint.MIN}
        max={constraint.MAX}
        onChange={(v: number | string) => this.onUpdateTrigger(v, propPath)}
      ></NumberPicker>}
    </div>;
  }
}
