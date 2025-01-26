import { STYLES, GLOBAL_STYLES } from "./lib/styles";
import { TOOLBAR_COLOR } from "./lib/styles.types";
import { TRIGGER_METADATA } from "../lib/TriggerDataManager";
import { TRIGGER_ID, TriggerTime, TimedTrigger, Trigger, ZoomTrigger, CameraFocusTrigger, CameraPanTrigger, TimeRemapTrigger, GravityTrigger, SkinCssTrigger } from "../lib/TriggerDataManager.types";
import { SETTINGS } from "../lib/settings-storage";
import { SETTINGS_KEY } from "../lib/settings-storage.types";
import { CONSTRAINTS } from "../lib/validation";
import * as FICONS from "./lib/icons";
import { RootComponent, RootState } from "./RootComponent";
import { InlineIcon } from "./lib/icons.types";

const e = window.React.createElement;

export default class ComponentManager {
  root: RootComponent;
  state: RootState;

  constructor(root: RootComponent) {
    this.root = root;
    this.state = root.state;
  }

  updateState(nextState: RootState): void {
    this.state = nextState;
  }

  main(): ReactComponent {
    const { state } = this;
    return e(
      "div",
      { style: GLOBAL_STYLES.text },
      this.toolbar(),
      state.active && e(
        "div",
        { style: STYLES.content },
        state.settingsActive && this.settingsContainer(),
        !(state.settingsActive) && this.tabContainer(),
        !(state.settingsActive) && this.window()
      )
    );
  }

  toolbar(): ReactComponent {
    const { root, state } = this;
    return e(
      "div",
      { style: STYLES.toolbar.container },
      !state.active && this.toolbarButton(0, "Maximize", false, () => root.onActivate(), FICONS.MAXIMIZE),
      state.active && e(
        "div",
        { style: { ...STYLES.toolbar.container, justifyContent: "start" } },
        this.toolbarButton(0, "Minimize", false, () => root.onActivate(), FICONS.MINIMIZE),
        this.toolbarButton(1, "Download", false, () => root.onDownload(), FICONS.DOWNLOAD),
        this.toolbarButton(2, "Upload", false, () => root.onClickFile(), FICONS.UPLOAD),
        this.toolbarButton(3, "Load From Script", false, () => root.onLoadScript(), FICONS.CORNER_UP_RIGHT),
        this.toolbarButton(4, "Run", state.invalidTimes.some(i => i), () => root.onTest(), FICONS.PLAY),
        this.toolbarButton(5, "Copy Script", false, async () => await root.onCopy(), FICONS.COPY)
      ),
      state.active && e(
        "div",
        { style: { ...STYLES.toolbar.container, justifyContent: "end" } },
        this.toolbarButton(6, "Undo", root.triggerManager.undoLen === 0, () => root.onUndo(), FICONS.ARROW_LEFT),
        this.toolbarButton(7, "Redo", root.triggerManager.redoLen === 0, () => root.onRedo(), FICONS.ARROW_RIGHT),
        this.toolbarButton(8, "Settings", false, () => root.onToggleSettings(), FICONS.SETTINGS),
        this.toolbarButton(9, "Report Issue", false, () => root.onReport(), FICONS.FLAG),
        this.toolbarButton(10, "Help", false, () => root.onHelp(), FICONS.HELP_CIRCLE)
      ),
      e(
        "input",
        {
          id: "trigger-file-upload",
          style: { display: "none" },
          type: "file",
          accept: ".json",
          onChange: (e: Event) => root.onLoadFile(((e.target as HTMLInputElement).files as FileList)[0])
        }
      )
    );
  }

  toolbarButton(
    id: number,
    title: string,
    disabled: boolean,
    onClick: () => void,
    icon: InlineIcon
  ): ReactComponent {
    const { root, state } = this;
    if (disabled && state.toolbarColors[id] !== TOOLBAR_COLOR.NONE) {
      root.onUpdateToolbarColor(id, TOOLBAR_COLOR.NONE);
    }

    return e(
      "button",
      {
        title,
        style: {
          ...STYLES.button.embedded,
          backgroundColor: STYLES.button.embedded.bgColor[state.toolbarColors[id]]
        },
        onMouseOver: () => !disabled && root.onUpdateToolbarColor(id, TOOLBAR_COLOR.HOVER),
        onMouseOut: () => !disabled && root.onUpdateToolbarColor(id, TOOLBAR_COLOR.NONE),
        onMouseDown: () => !disabled && root.onUpdateToolbarColor(id, TOOLBAR_COLOR.ACTIVE),
        onMouseUp: () => !disabled && root.onUpdateToolbarColor(id, TOOLBAR_COLOR.HOVER),
        onClick,
        disabled
      },
      e("span", {
        ...icon, style: { color: disabled ? GLOBAL_STYLES.gray : GLOBAL_STYLES.black }
      })
    );
  }

  settingsContainer(): ReactComponent {
    return e(
      "div",
      { style: STYLES.settings.window },
      this.settingsHeader(),
      this.settings()
    );
  }

  settingsHeader(): ReactComponent {
    const { root, state } = this;
    return e(
      "div",
      { style: STYLES.settings.header },
      e(
        "button",
        {
          style: {
            ...STYLES.button.embedded,
            position: "absolute",
            fontSize: "32px",
            right: "0px"
          },
          onClick: () => root.onToggleSettings()
        },
        e("span", FICONS.X)
      ),
      e("text", {
        style: {
          fontSize: GLOBAL_STYLES.textSizes.L[state.fontSize]
        }
      }, "Settings"),
      e("button", {
        style: {
          ...STYLES.button.settings,
          position: "absolute",
          fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
          left: "0px",
          background: state.settingsDirty
            ? GLOBAL_STYLES.light_gray3
            : GLOBAL_STYLES.dark_gray1
        },
        disabled: !(state.settingsDirty),
        onClick: () => root.onApplySettings()
      }, "Apply")
    );
  }

  settings(): ReactComponent {
    const { root, state } = this;
    return e(
      window.React.Fragment,
      { style: { fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize] } },
      e(
        "div",
        { style: STYLES.settings.row },
        e("text", {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
          }
        }, "Font Sizes"),
        e(
          "div",
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
            }
          },
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].SMALL)
          }, e("text", null, "Small")),
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].MEDIUM)
          }, e("text", null, "Medium")),
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.fontSizeSetting === SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeFontSize(SETTINGS[SETTINGS_KEY.FONT_SIZE].LARGE)
          }, e("text", null, "Large"))
        )
      ),
      e(
        "div",
        { style: STYLES.settings.row },
        e("text", {
          style: {
            ...STYLES.settings.label,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
          }
        }, "Viewport"),
        e(
          "div",
          {
            style: {
              ...STYLES.settings.parameter,
              fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
            }
          },
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].HD.ID)
          }, e("text", null, SETTINGS[SETTINGS_KEY.VIEWPORT].HD.NAME)),
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.ID)
          }, e("text", null, SETTINGS[SETTINGS_KEY.VIEWPORT].FHD.NAME)),
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.ID)
          }, e("text", null, SETTINGS[SETTINGS_KEY.VIEWPORT].QHD.NAME)),
          e("button", {
            style: {
              ...STYLES.button.settings,
              backgroundColor:
                state.resolutionSetting === SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID
                  ? GLOBAL_STYLES.light_gray1
                  : GLOBAL_STYLES.dark_gray1
            },
            onClick: () => root.onChangeViewport(SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.ID)
          }, e("text", null, SETTINGS[SETTINGS_KEY.VIEWPORT].UHD.NAME))
        )
      )
    );
  }

  tabContainer(): ReactComponent {
    return e(
      "div",
      { style: STYLES.tabs.container },
      Object.keys(
        TRIGGER_METADATA
      ).map((command: string) => e(
        "div",
        null,
        this.tab(command as TRIGGER_ID)
      ))
    );
  }

  tab(tabID: TRIGGER_ID): ReactComponent {
    const { root, state } = this;
    return e("button", {
      style: {
        ...STYLES.tabs.button,
        backgroundColor:
          state.activeTab === tabID
            ? GLOBAL_STYLES.light_gray1
            : GLOBAL_STYLES.dark_gray1
      },
      onClick: () => root.onChangeTab(tabID)
    }, e(
      "text",
      { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } },
      TRIGGER_METADATA[tabID].DISPLAY_NAME
    ));
  }

  window(): ReactComponent {
    const { state, root } = this;
    const data = root.triggerManager.data[state.activeTab];

    if (data.id === TRIGGER_ID.SKIN) {
      return e(
        "div",
        { style: STYLES.window },
        this.skinEditorToolbar(state.skinEditorSelectedRider),
        this.skinEditor(data.triggers as SkinCssTrigger[])
      );
    }

    if (data.id === TRIGGER_ID.GRAVITY) {
      return e(
        "div",
        { style: STYLES.window },
        Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))
      );
    }

    return e(
      "div",
      { style: STYLES.window },
      this.smoothTab(),
      Object.keys(data.triggers).map((i) => this.trigger(parseInt(i, 10)))
    );
  }

  smoothTab(): ReactComponent {
    const { root, state } = this;
    const data = root.triggerManager.data[state.activeTab];
    return e(
      "div",
      { style: STYLES.smooth.container },
      e("label", {
        for: "smoothTextInput",
        style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] }
      }, "Smoothing"),
      data.id !== TRIGGER_ID.TIME && e("input", {
        id: "smoothTextInput",
        style: {
          ...STYLES.smooth.input,
          fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize],
          marginLeft: "5px"
        },
        value: data.smoothing,
        onChange: (e: Event) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: (e.target as HTMLInputElement).value
          },
          ["smoothing"],
          CONSTRAINTS.SMOOTH
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          {
            prev: data.smoothing,
            new: (e.target as HTMLInputElement).value
          },
          ["smoothing"],
          CONSTRAINTS.SMOOTH,
          true
        )
      }),
      data.id === TRIGGER_ID.TIME && e(
        "div",
        { style: STYLES.checkbox.container },
        e("input", {
          id: "smoothTextInput",
          style: STYLES.checkbox.primary,
          type: "checkbox",
          onChange: () => root.onUpdateTrigger(
            {
              prev: root.triggerManager.data[state.activeTab].interpolate,
              new: !(root.triggerManager.data[state.activeTab].interpolate as boolean)
            },
            ["interpolate"],
            CONSTRAINTS.INTERPOLATE
          )
        }),
        data.interpolate as boolean && e("square", { style: STYLES.checkbox.fill })
      )
    );
  }

  trigger(index: number): ReactComponent {
    const { root, state } = this;
    const data = root.triggerManager.data[state.activeTab];
    const currentTrigger = data.triggers[index];

    return e(
      "div",
      {
        style: {
          ...STYLES.trigger.container,
          fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize],
          backgroundColor: index === 0 ? GLOBAL_STYLES.gray : GLOBAL_STYLES.white
        }
      },
      e(
        "button",
        {
          style: {
            ...STYLES.button.embedded,
            fontSize: "22px",
            position: "absolute",
            right: "0px"
          },
          disabled: index === 0,
          onClick: () => root.onDeleteTrigger(index)
        },
        e("span", {
          ...FICONS.X,
          style: {
            color: index === 0 ? GLOBAL_STYLES.dark_gray2 : GLOBAL_STYLES.black
          }
        }),
      ),
      data.id !== TRIGGER_ID.SKIN && this.timeStamp((currentTrigger as TimedTrigger)[0], index),
      data.id === TRIGGER_ID.ZOOM && this.captureButton(currentTrigger as Trigger, index, TRIGGER_ID.ZOOM),
      data.id === TRIGGER_ID.PAN && this.captureButton(currentTrigger as Trigger, index, TRIGGER_ID.PAN),
      data.id === TRIGGER_ID.ZOOM && this.zoomTrigger((currentTrigger as ZoomTrigger), index),
      data.id === TRIGGER_ID.PAN && this.cameraPanTrigger((currentTrigger as CameraPanTrigger), index),
      data.id === TRIGGER_ID.FOCUS && this.cameraFocusTrigger((currentTrigger as CameraFocusTrigger), index),
      data.id === TRIGGER_ID.TIME && this.timeRemapTrigger((currentTrigger as TimeRemapTrigger), index),
      data.id === TRIGGER_ID.SKIN && false,
      data.id === TRIGGER_ID.GRAVITY && this.gravityTrigger((currentTrigger as GravityTrigger), index),
      e(
        "button",
        {
          style: STYLES.trigger.createButton,
          onClick: () => root.onCreateTrigger(index)
        },
        e("span", FICONS.PLUS)
      )
    );
  }

  timeStamp(data: TriggerTime, index: number): ReactComponent {
    const { root, state } = this;
    const tProps = [
      CONSTRAINTS.MINUTE,
      CONSTRAINTS.SECOND,
      CONSTRAINTS.FRAME
    ];

    return e(
      "div",
      { style: STYLES.trigger.property },
      data.map((timeValue, timeIndex) => e(
        "div",
        null,
        e(
          "text",
          { style: STYLES.trigger.text },
          ["Time", ":", ":"][timeIndex]
        ),
        e("input", {
          style: {
            ...STYLES.trigger.input,
            color: state.invalidTimes[index] ? "red" : "black"
          },
          value: timeValue,
          onChange: (e: Event) => root.onUpdateTrigger(
            { prev: timeValue, new: (e.target as HTMLInputElement).value },
            ["triggers", index, 0, timeIndex],
            tProps[timeIndex]
          ),
          onBlur: (e: Event) => root.onUpdateTrigger(
            { prev: timeValue, new: (e.target as HTMLInputElement).value },
            ["triggers", index, 0, timeIndex],
            tProps[timeIndex],
            true
          )
        })
      ))
    );
  }

  captureButton(data: Trigger, index: number, triggerType: TRIGGER_ID): ReactComponent {
    const { root } = this;

    return e(
      "button",
      {
        style: {
          ...STYLES.button.embedded,
          fontSize: "22px",
          position: "absolute",
          right: "25px"
        },
        onClick: () => root.onCameraDataCapture(data, index, triggerType)
      },
      e("span", { ...FICONS.CAMERA })
    );
  }

  zoomTrigger(data: ZoomTrigger, index: number): ReactComponent {
    const { root } = this;
    const labels = ["Zoom To"];

    return e(
      "div",
      { style: STYLES.trigger.property },
      e("label", {
        for: `zoomTriggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      e("input", {
        id: `zoomTriggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.input,
        value: data[1],
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1],
          CONSTRAINTS.ZOOM
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1],
          CONSTRAINTS.ZOOM,
          true
        )
      })
    );
  }

  cameraPanTrigger(data: CameraPanTrigger, index: number): ReactComponent {
    const { root } = this;
    const cProps = [
      CONSTRAINTS.PAN_WIDTH,
      CONSTRAINTS.PAN_HEIGHT,
      CONSTRAINTS.PAN_X,
      CONSTRAINTS.PAN_Y
    ];
    const labels = ["Width", "Height", "Offset X", "Offset Y"];

    return e(
      window.React.Fragment,
      null,
      [["w", "h"], ["x", "y"]].map((pair, pairIndex) => e(
        "div",
        { style: { display: "flex", flexDirection: "row" } },
        pair.map((prop, propIndex) => e(
          "div",
          { style: STYLES.trigger.property },
          e("label", {
            for: `camTriggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: STYLES.trigger.text
          }, labels[propIndex + 2 * pairIndex]),
          e("input", {
            id: `camTriggerText_${labels[propIndex + 2 * pairIndex]}_${index}`,
            style: STYLES.trigger.input,
            value: data[1][prop as "w" | "h" | "x" | "y"],
            onChange: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as "w" | "h" | "x" | "y"], new: (e.target as HTMLInputElement).value },
              ["triggers", index, 1, prop],
              cProps[propIndex + 2 * pairIndex]
            ),
            onBlur: (e: Event) => root.onUpdateTrigger(
              { prev: data[1][prop as "w" | "h" | "x" | "y"], new: (e.target as HTMLInputElement).value },
              ["triggers", index, 1, prop],
              cProps[propIndex + 2 * pairIndex],
              true
            )
          })
        ))
      ))
    );
  }

  cameraFocusTrigger(data: CameraFocusTrigger, index: number): ReactComponent {
    const { root, state } = this;
    const dropdownIndex = state.focusDDIndices[index];
    const labels = ["Weight"];

    return e(
      "div",
      { style: STYLES.trigger.property },
      e(
        "select",
        {
          style: STYLES.dropdown.head,
          value: dropdownIndex,
          onChange: (e: Event) => root.onChangeFocusDD(index, (e.target as HTMLInputElement).value)
        },
        Object.keys(data[1]).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return e("option", {
            style: STYLES.dropdown.option,
            value: parseInt(riderIndex, 10)
          }, e("text", null, `Rider ${riderNum}`));
        })
      ),
      e("label", {
        for: `focusTriggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      e("input", {
        id: `focusTriggerText_${labels[0]}_${dropdownIndex}_${index}`,
        style: STYLES.trigger.input,
        value: data[1][dropdownIndex],
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1][dropdownIndex], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1, dropdownIndex],
          CONSTRAINTS.FOCUS_WEIGHT
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1][dropdownIndex], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1, dropdownIndex],
          CONSTRAINTS.FOCUS_WEIGHT,
          true
        )
      })
    );
  }

  timeRemapTrigger(data: TimeRemapTrigger, index: number): ReactComponent {
    const { root } = this;
    const labels = ["Speed"];

    return e(
      "div",
      { style: STYLES.trigger.property },
      e("label", {
        for: `timeTriggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.text
      }, labels[0]),
      e("input", {
        id: `timeTriggerText_${labels[0]}_${index}`,
        style: STYLES.trigger.input,
        value: data[1],
        onChange: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1],
          CONSTRAINTS.TIME_SPEED
        ),
        onBlur: (e: Event) => root.onUpdateTrigger(
          { prev: data[1], new: (e.target as HTMLInputElement).value },
          ["triggers", index, 1],
          CONSTRAINTS.TIME_SPEED,
          true
        )
      })
    );
  }

  gravityTrigger(data: GravityTrigger, index: number): ReactComponent {
    const { root, state } = this;
    const cProps = [CONSTRAINTS.GRAVITY_X, CONSTRAINTS.GRAVITY_Y];
    const labels = ["X", "Y"];
    const props = ["x", "y"];
    const dropdownIndex = state.gravityDDIndices[index];

    return e(
      "div",
      { style: { display: "flex", flexDirection: "row" } },
      e(
        "select",
        {
          style: STYLES.dropdown.head,
          value: dropdownIndex,
          onChange: (e: Event) => root.onChangeGravityDD(index, (e.target as HTMLInputElement).value)
        },
        Object.keys(data[1]).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return e("option", {
            style: STYLES.dropdown.option,
            value: parseInt(riderIndex, 10)
          }, e("text", null, `Rider ${riderNum}`));
        })
      ),
      props.map((prop, propIndex) => e(
        "div",
        { style: STYLES.trigger.property },
        e("label", {
          for: `gravityTriggerText_${labels[propIndex]}_${dropdownIndex}_${index}`,
          style: STYLES.trigger.text
        }, labels[propIndex]),
        e("input", {
          id: `gravityTriggerText_${labels[propIndex]}_${dropdownIndex}_${index}`,
          style: STYLES.trigger.input,
          value: data[1][dropdownIndex][prop as "x" | "y"],
          onChange: (e: Event) => root.onUpdateTrigger(
            { prev: data[1][dropdownIndex][prop as "x" | "y"], new: (e.target as HTMLInputElement).value },
            ["triggers", index, 1, dropdownIndex, prop],
            cProps[propIndex]
          ),
          onBlur: (e: Event) => root.onUpdateTrigger(
            { prev: data[1][dropdownIndex][prop as "x" | "y"], new: (e.target as HTMLInputElement).value },
            ["triggers", index, 1, dropdownIndex, prop],
            cProps[propIndex],
            true
          )
        })
      ))
    );
  }

  skinEditor(data: SkinCssTrigger[]): ReactComponent {
    const { root, state } = this;
    const dropdownIndex = state.skinEditorSelectedRider;

    return e(
      "div",
      { style: STYLES.skinEditor.container },
      e("div", { style: STYLES.skinEditor.background }),
      e(
        "div",
        {
          id: "skinElementContainer",
          style: {
            ...STYLES.skinEditor.canvas,
            transform: `scale(${state.skinEditorZoom[0]})`,
            transformOrigin: `${state.skinEditorZoom[1]}px ${state.skinEditorZoom[2]}px`
          },
          onWheel: (e: Event) => root.onZoomSkinEditor(e, true)
        },
        this.flagSvg(data[dropdownIndex], dropdownIndex),
        e("svg", { width: "10vw" }),
        this.riderSvg(data[dropdownIndex], dropdownIndex)
      ),
      e(
        "div",
        { style: STYLES.skinEditor.zoomContainer },
        e("input", {
          style: { height: "10px" },
          type: "range",
          min: CONSTRAINTS.SKIN_ZOOM.MIN,
          max: CONSTRAINTS.SKIN_ZOOM.MAX,
          step: 0.1,
          value: state.skinEditorZoom[0],
          onChange: (e: Event) => root.onZoomSkinEditor(e, false)
        }),
        e(
          "text",
          { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } },
          `x${Math.round(state.skinEditorZoom[0] * 10) / 10}`
        )
      ),
      e(
        "div",
        { style: STYLES.skinEditor.outlineColor.container },
        e("text", { style: { fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize] } }, "Outline"),
        e("div", {
          style: {
            ...STYLES.skinEditor.outlineColor.input,
            backgroundColor: data[dropdownIndex].outline.stroke
          },
          onClick: () => root.onUpdateTrigger(
            { new: state.skinEditorSelectedColor },
            ["triggers", dropdownIndex, "outline", "stroke"]
          )
        })
      )
    );
  }

  skinEditorToolbar(index: number): ReactComponent {
    const { root, state } = this;
    const data = root.triggerManager.data[TRIGGER_ID.SKIN].triggers;
    const colorValue = state.skinEditorSelectedColor.substring(0, 7);
    const alphaValue = parseInt(state.skinEditorSelectedColor.substring(7), 16) / 255;

    return e(
      "div",
      { style: STYLES.skinEditor.toolbar },
      e(
        "button",
        {
          style: {
            ...STYLES.button.embedded,
            fontSize: "32px",
            position: "absolute",
            right: "10px"
          },
          onClick: () => root.onResetSkin(index)
        },
        e("span", FICONS.TRASH2)
      ),
      e(
        "div",
        {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            ...STYLES.alpha.container,
            fontSize: GLOBAL_STYLES.textSizes.S[state.fontSize]
          }
        },
        e("label", { for: "alphaSlider" }, "Transparency"),
        e(
          "div",
          { style: STYLES.alpha.sliderContainer },
          e("input", {
            id: "alphaSlider",
            style: STYLES.alpha.slider,
            type: "range",
            min: CONSTRAINTS.ALPHA_SLIDER.MIN,
            max: CONSTRAINTS.ALPHA_SLIDER.MAX,
            step: 0.01,
            value: alphaValue,
            onChange: (e: Event) => root.onChangeColor(undefined, (e.target as HTMLInputElement).value)
          })
        )
      ),
      e("input", {
        style: {
          ...STYLES.skinEditor.toolbarItem,
          height: "40px",
          width: "40px"
        },
        type: "color",
        value: colorValue,
        onChange: (e: Event) => root.onChangeColor((e.target as HTMLInputElement).value, undefined)
      }),
      e(
        "select",
        {
          style: {
            ...STYLES.skinEditor.toolbarItem,
            ...STYLES.dropdown.head,
            fontSize: GLOBAL_STYLES.textSizes.M[state.fontSize]
          },
          value: index,
          onChange: (e: Event) => root.onChangeSkinDD((e.target as HTMLInputElement).value)
        },
        Object.keys(data).map((riderIndex) => {
          const riderNum = 1 + parseInt(riderIndex, 10);

          return e("option", {
            style: STYLES.dropdown.option,
            value: parseInt(riderIndex, 10)
          }, e("text", null, `Rider ${riderNum}`));
        })
      )
    );
  }

  flagSvg(data: SkinCssTrigger, index: number): ReactComponent {
    const { root, state } = this;
    const color = state.skinEditorSelectedColor;
    return e(
      "svg",
      { height: "18", width: "15", style: { transform: "scale(5)" } },
      e("path", {
        ...STYLES.riderProps.flag,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "flag", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.flagOutline,
        fill: data.flag.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "flag", "fill"])
      })
    );
  }

  riderSvg(data: SkinCssTrigger, index: number): ReactComponent {
    const { root, state } = this;
    const color = state.skinEditorSelectedColor;
    return e(
      "svg",
      { height: "25", width: "31", style: { transform: "scale(5)" } },
      e("rect", {
        ...STYLES.riderProps.skin,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "skin", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.nose,
        stroke: data.outline.stroke,
        fill: data.skin.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "skin", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.hair,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "hair", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.faceOutline,
        fill: data.hair.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "hair", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.hairFill,
        fill: data.fill.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "fill", "fill"])
      }),
      e("polygon", {
        ...STYLES.riderProps.eye,
        fill: data.eye.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "eye", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.sled,
        stroke: data.outline.stroke,
        fill: data.sled.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "sled", "fill"])
      }),
      e("line", {
        ...STYLES.riderProps.string,
        stroke: data.string.stroke,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "string", "stroke"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.armHand,
        stroke: data.outline.stroke,
        fill: data.armHand.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "armHand", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.legPants,
        stroke: data.outline.stroke,
        fill: data.legPants.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "legPants", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.legFoot,
        stroke: data.outline.stroke,
        fill: data.legFoot.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "legFoot", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfEven,
        ...STYLES.riderProps.id_scarf0a,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf0", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfEven,
        ...STYLES.riderProps.id_scarf0b,
        fill: data.id_scarf0.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf0", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf1,
        fill: data.id_scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf1", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf2,
        fill: data.id_scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf2", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf3,
        fill: data.id_scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf3", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf4,
        fill: data.id_scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf4", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.id_scarfOdd,
        ...STYLES.riderProps.id_scarf5,
        fill: data.id_scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "id_scarf5", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.torso,
        stroke: data.outline.stroke,
        fill: data.torso.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "torso", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf1,
        fill: data.scarf1.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "scarf1", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf2,
        fill: data.scarf2.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "scarf2", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf3,
        fill: data.scarf3.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "scarf3", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf4,
        fill: data.scarf4.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "scarf4", "fill"])
      }),
      e("rect", {
        ...STYLES.riderProps.scarfOdd,
        ...STYLES.riderProps.scarf5,
        fill: data.scarf5.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "scarf5", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.hatTop,
        stroke: data.outline.stroke,
        fill: data.hatTop.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "hatTop", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.hatBottom,
        stroke: data.hatBottom.stroke,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "hatBottom", "stroke"])
      }),
      e("circle", {
        ...STYLES.riderProps.hatBall,
        fill: data.hatBall.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "hatBall", "fill"])
      }),
      e("path", {
        ...STYLES.riderProps.outline,
        ...STYLES.riderProps.armSleeve,
        stroke: data.outline.stroke,
        fill: data.armSleeve.fill,
        onClick: () => root.onUpdateTrigger({ new: color }, ["triggers", index, "armSleeve", "fill"])
      })
    );
  }
}
