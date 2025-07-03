// Line Rider Command Editor - A UI wrapper for linerider.com console commands
// Copyright (C) 2023-2025 Tobias Bessler
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { App } from "../App";
import FloatingButton from "../components/FloatingButton";
import IconButton from "../components/IconButton";
import * as FICONS from "../components/Icons";
import { getSetting, saveSetting } from "../lib/settings-storage";
import { FONT_SIZE_SETTING, SETTINGS_KEY, VIEWPORT_SETTING } from "../lib/settings-storage.types";
import { COLOR, THEME } from "../styles";
const { React } = window;

const styles = {
  window: {
    backgroundColor: COLOR.gray100,
    border: THEME.primaryBorder,
    boxShadow: "0px 4px 8px -4px #000",
    display: "flex",
    flexDirection: "column",
    flex: 9,
    position: "relative",
    width: "100%",
  },
  header: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    minHeight: "3em",
    margin: "10px",
    position: "relative",
  },
  applyButton: {
    left: "0px",
    position: "absolute",
  },
  row: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    height: "1.5em",
    minHeight: "3em",
    padding: "1em",
  },
  label: {
    position: "absolute",
    left: "5px",
  },
  parameter: {
    position: "absolute",
    right: "5px",
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Creates settings header
 * @param root0 Settings head properties
 * @param root0.root Root app component
 * @param root0.settings Root settings component
 * @returns Settings header component at top of settings page
 */
function SettingsHeader({ root, settings }: { root: App; settings: Settings }) {
  return (
    <div style={{ ...styles.header, fontSize: "1.5em" }}>
      <IconButton
        onClick={() => root.onToggleSettings()}
        icon={FICONS.X}
        customStyle={{ position: "absolute", right: "0px" }}
        title="Close"
      >
      </IconButton>
      Settings
      <FloatingButton
        customStyle={styles.applyButton}
        active={settings.state.dirty}
        disabled={!settings.state.dirty}
        onClick={() => settings.onApply()}
        label="Apply"
      >
      </FloatingButton>
    </div>
  );
}

const LABEL_MAP = {
  [SETTINGS_KEY.FONT_SIZE]: [
    [FONT_SIZE_SETTING.SMALL, "Small"],
    [FONT_SIZE_SETTING.MEDIUM, "Medium"],
    [FONT_SIZE_SETTING.LARGE, "Large"],
  ],
  [SETTINGS_KEY.VIEWPORT]: [
    [VIEWPORT_SETTING.HD, "720p"],
    [VIEWPORT_SETTING.FHD, "1080p"],
    [VIEWPORT_SETTING.QHD, "1440p"],
    [VIEWPORT_SETTING.UHD, "4K"],
  ],
} as const;

/**
 * Creates settings section component
 * @param root0 Settings section properties
 * @param root0.current Currently selected setting value
 * @param root0.onClick Function ran when a new value is selected
 * @param root0.title Title for the section
 * @param root0.lkey Label key corresponding to which setting is being rendered
 * @returns Row of settings page populated with properties
 */
function SettingsSection(
  { current, onClick, title, lkey }: {
    current: FONT_SIZE_SETTING | VIEWPORT_SETTING;
    onClick: (e: number) => void;
    title: string;
    lkey: SETTINGS_KEY;
  },
) {
  return (
    <div style={styles.row}>
      <text style={styles.label}>
        {title}
      </text>
      <div style={styles.parameter}>
        {...LABEL_MAP[lkey].map(([target, label]) => {
          return (
            <FloatingButton
              customStyle={{ margin: "5px" }}
              active={current === target}
              label={label}
              onClick={() => onClick(target)}
            >
            </FloatingButton>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  root: App;
}
interface State {
  dirty: boolean;
  fontSize: FONT_SIZE_SETTING;
  resolution: VIEWPORT_SETTING;
}

export default class Settings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fontSize: getSetting(SETTINGS_KEY.FONT_SIZE),
      resolution: getSetting(SETTINGS_KEY.VIEWPORT),
      dirty: false,
    };
  }

  onChangeFontSize(newFontSize: number): void {
    const { fontSize } = this.state;

    if (newFontSize !== fontSize) {
      this.setState({ dirty: true });
    }

    this.setState({ fontSize: newFontSize });
  }

  onChangeViewport(newResolution: number): void {
    const { resolution } = this.state;

    if (resolution !== newResolution) {
      this.setState({ dirty: true });
    }

    this.setState({ resolution: newResolution });
  }

  onApply(): void {
    const { resolution, fontSize } = this.state;
    const { root } = this.props;

    root.onApplyViewport(resolution);

    saveSetting(SETTINGS_KEY.FONT_SIZE, fontSize);
    saveSetting(SETTINGS_KEY.VIEWPORT, resolution);

    root.setState({ fontSize, resolution });
    this.setState({ dirty: false });
  }

  render() {
    const {
      root,
    } = this.props;

    return (
      <div style={styles.window}>
        <SettingsHeader root={root} settings={this}></SettingsHeader>
        <div>
          <SettingsSection
            current={this.state.fontSize}
            onClick={(e: number) => this.onChangeFontSize(e)}
            title={"Font Sizes"}
            lkey={SETTINGS_KEY.FONT_SIZE}
          >
          </SettingsSection>
          <SettingsSection
            current={this.state.resolution}
            onClick={(e: number) => this.onChangeViewport(e)}
            title={"Viewport"}
            lkey={SETTINGS_KEY.VIEWPORT}
          >
          </SettingsSection>
        </div>
      </div>
    );
  }
}
