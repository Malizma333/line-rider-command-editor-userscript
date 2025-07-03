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
  HOVER,
  PRESSED,
}

interface Props {
  title: string;
  disabled?: boolean;
  customStyle?: React.CSSProperties;
  size?: string;
  onClick: () => void;
  icon: React.JSX.Element;
}

interface State {
  mode: BUTTON_MODE;
}

const style: React.CSSProperties = {
  alignItems: "center",
  borderRadius: "0.5em",
  border: "none",
  display: "flex",
  height: "1.5em",
  justifyContent: "center",
  userSelect: "none",
  width: "1.5em",
  transition: "background-color 0.125s ease-in-out",
};

const modeBackgroundColors = {
  [BUTTON_MODE.BLURRED]: "#00000000",
  [BUTTON_MODE.HOVER]: "#00000066",
  [BUTTON_MODE.PRESSED]: "#00000033",
} as const;

export default class IconButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: BUTTON_MODE.BLURRED,
    };
  }

  render() {
    const { customStyle, disabled, icon, onClick, size, title } = this.props;

    if (disabled && this.state.mode !== BUTTON_MODE.BLURRED) {
      this.setState({ mode: BUTTON_MODE.BLURRED });
    }

    return (
      <button
        title={title}
        style={{
          ...style,
          ...customStyle,
          backgroundColor: modeBackgroundColors[this.state.mode],
          fontSize: size || "25px",
          color: disabled ? COLOR.gray500 : COLOR.gray950,
        }}
        onMouseOver={() => !disabled && this.setState({ mode: BUTTON_MODE.HOVER })}
        onMouseOut={() => !disabled && this.setState({ mode: BUTTON_MODE.BLURRED })}
        onMouseDown={() => !disabled && this.setState({ mode: BUTTON_MODE.PRESSED })}
        onMouseUp={() => !disabled && this.setState({ mode: BUTTON_MODE.HOVER })}
        onClick={() => onClick()}
        disabled={disabled}
      >
        {icon}
      </button>
    );
  }
}
