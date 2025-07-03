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

import { COLOR, THEME } from "../styles";
const { React } = window;

const styles = {
  container: {
    alignItems: "center",
    display: "flex",
    height: "1.25em",
    justifyContent: "center",
    position: "relative",
    width: "1.25em",
  },
  primary: {
    appearance: "none",
    background: COLOR.gray50,
    border: THEME.primaryBorder,
    borderRadius: "50%",
    boxSizing: "border-box",
    boxShadow: "inset 0px 1px 4px -1px #000",
    cursor: "pointer",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  fill: {
    backgroundColor: "#000",
    borderRadius: "60%",
    height: "60%",
    pointerEvents: "none",
    position: "absolute",
    transition: "opacity 0.125s ease-in-out",
    width: "60%",
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Custom circular checkbox with a label included
 * @param root0 Custom checkbox properties
 * @param root0.customStyle Custom styles to apply to the checkbox
 * @param root0.id Id corresponding to this checkbox form field
 * @param root0.value Value that this checkbox displays
 * @param root0.onCheck Function ran whenever this checkbox is interacted with
 * @returns Custom checkbox field
 */
export default function Checkbox(
  { customStyle, id, value, onCheck }: {
    customStyle: React.CSSProperties;
    id: string;
    value: boolean;
    onCheck: () => void;
  },
) {
  return (
    <div style={{ ...styles.container, ...customStyle }}>
      <input
        id={id}
        style={styles.primary}
        type="checkbox"
        onChange={() => onCheck()}
      />
      <div style={{ ...styles.fill, opacity: value ? "100" : "0" }}></div>
    </div>
  );
}
