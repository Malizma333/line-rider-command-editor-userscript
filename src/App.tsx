import { TriggerDataManager, TRIGGER_METADATA } from './lib/TriggerDataManager';
import {
  TRIGGER_ID, TriggerDataLookup, TriggerTime, TimedTrigger, ZoomTrigger, CameraFocusTrigger, GravityTrigger,
  SkinCssTrigger, CameraPanTrigger, TimeRemapTrigger,
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
import EmbeddedButton from './components/EmbeddedButton';
import SkinEditor from './components/pages/SkinEditor';
import Settings from './components/pages/Settings';
import Checkbox from './components/Checkbox';
import { Constraint, CONSTRAINT_TYPE } from './lib/constraints.types';
import Dropdown from './components/Dropdown';

const { store, React } = window;

export interface AppState {
  active: boolean
  activeTab: TRIGGER_ID
  triggerUpdateFlag: boolean
  numRiders: number
  focusDropdown: number
  gravityDropdown: number
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
      focusDropdown: 0,
      gravityDropdown: 0,
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

      this.triggerManager.updateRiderCount(riderCount);
      this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });
      this.setState({ focusDropdown: Math.min(riderCount - 1, focusDropdown) });
      this.setState({ gravityDropdown: Math.min(riderCount - 1, gravityDropdown) });
      this.setState({ numRiders: riderCount });
    }

    const sidebarOpen = Selectors.getSidebarOpen(store.getState());

    if (sidebarOpen) {
      this.setState({ active: false });
    }
  }

  onCreateTrigger(index: number): void {
    const { activeTab } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentPlayerIndex = Selectors.getPlayerIndex(store.getState());
    const triggerTime: TriggerTime = [
      Math.floor(currentPlayerIndex / 2400),
      Math.floor((currentPlayerIndex % 2400) / 40),
      Math.floor(currentPlayerIndex % 40),
    ];

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggerData = structuredClone((currentTriggers[index] as TimedTrigger)[1]);
    const newTrigger = [triggerTime, newTriggerData] as TimedTrigger;
    const newTriggers = currentTriggers
        .slice(0, index + 1)
        .concat([newTrigger])
        .concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

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
    const { activeTab } = this.state;

    if (activeTab === TRIGGER_ID.SKIN) return;

    const currentTriggers = this.triggerManager.data[activeTab].triggers;
    const newTriggers = currentTriggers.slice(0, index).concat(currentTriggers.slice(index + 1));
    this.triggerManager.updateFromPath([activeTab, 'triggers'], newTriggers, activeTab);
    this.setState({ triggerUpdateFlag: !this.state.triggerUpdateFlag });

    const newTriggerArray = this.triggerManager.data[activeTab].triggers;

    this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
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
    const { activeTab } = this.state;
    try {
      this.triggerManager.updateFromPath([], nextTriggerData, TRIGGER_ID.ZOOM);

      if (activeTab !== TRIGGER_ID.SKIN) {
        const newTriggerArray = nextTriggerData[activeTab].triggers;
        this.setState({ invalidTimes: validateTimes(newTriggerArray as TimedTrigger[]) });
      }

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

    return <div style={{ fontSize: TEXT_SIZES[this.state.fontSize] }}>
      {this.renderActions()}
      {this.state.active && <div style={GLOBAL_STYLES.mainContent}>
        {this.state.settingsActive ?
          <Settings root={this}/> :
          <div style={GLOBAL_STYLES.windowContainer}>
            {this.renderTabContainer()}
            {data.id === TRIGGER_ID.SKIN ?
              <SkinEditor root={this} skinTriggers={data.triggers as SkinCssTrigger[]}/> :
              <React.Fragment>
                {this.renderWindowHead()}
                {<div style={{ ...GLOBAL_STYLES.windowBody, overflowY: 'scroll', paddingBottom: '10px' }}>
                  {Object.keys(data.triggers).map((i) => this.renderTrigger(parseInt(i, 10)))}
                </div>}
              </React.Fragment>
            }
          </div>}
      </div>}
    </div>;
  }

  renderActions() {
    const runDisabled = this.state.invalidTimes.some((i) => i);
    const undoDisabled = this.triggerManager.undoLen === 0;
    const redoDisabled = this.triggerManager.redoLen === 0;

    return !this.state.active ? <div style={GLOBAL_STYLES.actionContainer}>
      <EmbeddedButton title="Maximize" onClick={() => this.onToggleActive()} icon={FICONS.MAXIMIZE}/>
    </div> : <div style={GLOBAL_STYLES.actionContainer}>
      <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: 'start' }}>
        <EmbeddedButton title="Minimize" onClick={() => this.onToggleActive()} icon={FICONS.MINIMIZE}/>
        <EmbeddedButton title="Download" onClick={() => this.onDownload()} icon={FICONS.DOWNLOAD}/>
        <EmbeddedButton title="Upload" onClick={() => this.onUpload()} icon={FICONS.UPLOAD}/>
        <EmbeddedButton title="Load From Script" onClick={() => this.onLoadScript()} icon={FICONS.CORNER_UP_RIGHT}/>
        <EmbeddedButton title="Run" onClick={() => this.onTest()} icon={FICONS.PLAY} disabled={runDisabled}/>
        <EmbeddedButton title="Copy Script" onClick={async () => await this.onCopy()} icon={FICONS.COPY}/>
      </div>
      <div style={{ ...GLOBAL_STYLES.actionContainer, justifyContent: 'end' }}>
        <EmbeddedButton title="Undo" onClick={() => this.onUndo()} icon={FICONS.ARROW_LEFT} disabled={undoDisabled}/>
        <EmbeddedButton title="Redo" onClick={() => this.onRedo()} icon={FICONS.ARROW_RIGHT} disabled={redoDisabled}/>
        <EmbeddedButton title="Settings" onClick={() => this.onToggleSettings()} icon={FICONS.SETTINGS}/>
        <EmbeddedButton title="Help" onClick={() => this.onHelp()} icon={FICONS.HELP_CIRCLE}/>
      </div>
      <input id="trigger-file-upload" style={{ display: 'none' }} type="file" accept=".json"
        onChange={(e: React.ChangeEvent) => this.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])} />
    </div>;
  }

  renderTabContainer() {
    return <div style={GLOBAL_STYLES.tabContainer}>
      {...Object.keys(TRIGGER_METADATA).map((command: string) => {
        return <div>
          <button
            style={{
              ...GLOBAL_STYLES.tab,
              backgroundColor: this.state.activeTab === command ? THEME.midLight : THEME.midDark,
            }}
            onClick={() => this.onChangeTab(command as TRIGGER_ID)}
          >
            {TRIGGER_METADATA[command as TRIGGER_ID].DISPLAY_NAME}
          </button>
        </div>;
      })}
    </div>;
  }

  renderWindowHead() {
    const data = this.triggerManager.data[this.state.activeTab];

    return <div style={{ ...GLOBAL_STYLES.windowHead, fontSize: '1.5em' }}>
      {data.id === TRIGGER_ID.ZOOM &&
        this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)
      }
      {data.id === TRIGGER_ID.PAN &&
        this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)
      }
      {data.id === TRIGGER_ID.FOCUS &&
        this.renderTriggerProp('Smoothing', data.smoothing || 0, ['smoothing'], CONSTRAINT.SMOOTH)
      }
      {data.id === TRIGGER_ID.FOCUS && <Dropdown
        customStyle={{ margin: '0em .25em' }}
        value={this.state.focusDropdown}
        count={this.state.numRiders}
        label="Rider"
        onChange={(e: number) => this.onChangeFocusDD(e)}
      />}
      {data.id === TRIGGER_ID.TIME &&
        this.renderTriggerProp('Smoothing', data.interpolate || false, ['interpolate'], CONSTRAINT.INTERPOLATE)
      }
      {data.id === TRIGGER_ID.GRAVITY && <Dropdown
        customStyle={{ margin: '0em .25em' }}
        value={this.state.gravityDropdown}
        count={this.state.numRiders}
        label="Rider"
        onChange={(e: number) => this.onChangeGravityDD(e)}
      />}
    </div>;
  }

  renderTrigger(index: number) {
    const data = this.triggerManager.data[this.state.activeTab];
    const currentTrigger = data.triggers[index];

    return <div style={{
      ...GLOBAL_STYLES.triggerContainer,
      fontSize: '1.5em',
      backgroundColor: index === 0 ? THEME.midLight : THEME.light,
    }}>
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
      <EmbeddedButton
        customStyle={GLOBAL_STYLES.newTriggerButton}
        size="16px"
        icon={FICONS.PLUS}
        onClick={() => this.onCreateTrigger(index)}
      />
    </div>;
  }

  renderTimeInput(data: TriggerTime, index: number) {
    const cProps = [CONSTRAINT.MINUTE, CONSTRAINT.SECOND, CONSTRAINT.FRAME];
    const labels = ['Time', ':', ':'];

    return <div style={GLOBAL_STYLES.triggerPropContainer}>
      {...data.map((timeValue, timeIndex) => {
        return <div>
          {this.renderTriggerProp(
              labels[timeIndex],
              timeValue,
              ['triggers', index.toString(), '0', timeIndex.toString()],
              cProps[timeIndex],
            this.state.invalidTimes[index] ? 'red' : 'black',
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
      /> : <NumberPicker
        customStyle={{ ...GLOBAL_STYLES.spacedProperty, color: color || 'black' }}
        id={propPath.join('_')}
        value={value as number | string}
        min={constraint.MIN}
        max={constraint.MAX}
        onChange={(v: number | string) => this.onUpdateTrigger(v, propPath)}
      />}
    </div>;
  }
}
