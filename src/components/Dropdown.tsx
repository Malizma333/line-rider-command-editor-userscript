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
  head: {
    backgroundColor: COLOR.gray50,
    border: THEME.primaryBorder,
    borderRadius: "5px",
    boxShadow: "0px 1px 4px -1px #000",
    cursor: "pointer",
    height: "1.5em",
    textAlign: "right",
  },
  option: {
    backgroundColor: COLOR.gray50,
    border: THEME.primaryBorder,
    height: "1.25em",
    textAlign: "center",
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Creates a custom dropdown selecting between a list of numbered items
 * @param root0 Custom dropdown properties
 * @param root0.customStyle Custom styles to apply to this dropdown
 * @param root0.value Currently selected dropdown item
 * @param root0.mapping Array of values to choose from
 * @param root0.label Label to prefix each value with
 * @param root0.onChange Function ran whenever item is selected
 * @returns Custom select input dropdown populated with options
 */
export default function Dropdown(
  { customStyle, value, mapping, label, onChange }: {
    customStyle?: React.CSSProperties;
    value: number;
    mapping: number[];
    label: (e: number, i: number) => string;
    onChange: (e: number) => void;
  },
) {
  return (
    <select
      style={{ ...styles.head, ...customStyle }}
      value={value}
      onChange={(e: React.ChangeEvent) => onChange(parseInt((e.target as HTMLInputElement).value))}
    >
      {...mapping.map((value, index) => (
        <option style={styles.option} value={value}>
          {label(value, index)}
        </option>
      ))}
    </select>
  );
}
