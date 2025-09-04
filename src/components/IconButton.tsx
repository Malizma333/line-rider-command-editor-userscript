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

import { COLOR } from "../styles";
const { React } = window;

enum BUTTON_MODE {
  BLURRED,
  PRESSED,
}

interface Props {
  title: string;
  disabled?: boolean;
  customStyle?: React.CSSProperties;
  size?: string;
  onClick: () => void;
  icon: React.JSX.Element;
  colorType: "error" | "neutral";
}

interface State {
  mode: BUTTON_MODE;
}

const style: React.CSSProperties = {
  alignItems: "center",
  border: "none",
  display: "flex",
  height: "1.5em",
  justifyContent: "center",
  userSelect: "none",
  width: "1.5em",
  transition: "transform 0.125s ease-in-out",
};

const modeScales = {
  [BUTTON_MODE.BLURRED]: "scale(1)",
  [BUTTON_MODE.PRESSED]: "scale(0.9)",
} as const;

export default class IconButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: BUTTON_MODE.BLURRED,
    };
  }

  render() {
    const { customStyle, disabled, icon, onClick, size, title, colorType } = this.props;

    if (disabled && this.state.mode !== BUTTON_MODE.BLURRED) {
      this.setState({ mode: BUTTON_MODE.BLURRED });
    }

    return (
      <button
        title={disabled ? undefined : title}
        style={{
          ...style,
          ...customStyle,
          backgroundColor: "transparent",
          transform: modeScales[this.state.mode],
          fontSize: size || "25px",
          color: disabled ? COLOR.gray400 : colorType === "neutral"
            ? (COLOR.gray950)
            : (COLOR.rose950),
        }}
        onMouseDown={() => !disabled && this.setState({ mode: BUTTON_MODE.PRESSED })}
        onMouseUp={() => !disabled && this.setState({ mode: BUTTON_MODE.BLURRED })}
        onMouseLeave={() => !disabled && this.setState({ mode: BUTTON_MODE.BLURRED })}
        onClick={() => onClick()}
        disabled={disabled}
      >
        {icon}
      </button>
    );
  }
}
