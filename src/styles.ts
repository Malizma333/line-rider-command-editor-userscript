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

export const COLOR = {
  gray50: "oklch(0.985 0.002 247.839)",
  gray100: "oklch(0.967 0.003 264.542)",
  gray200: "oklch(0.928 0.006 264.531)",
  gray300: "oklch(0.872 0.01 258.338)",
  gray400: "oklch(0.707 0.022 261.325)",
  gray500: "oklch(0.551 0.027 264.364)",
  gray600: "oklch(0.446 0.03 256.802)",
  gray700: "oklch(0.373 0.034 259.733)",
  gray800: "oklch(0.278 0.033 256.848)",
  gray900: "oklch(0.21 0.034 264.665)",
  gray950: "oklch(0.13 0.028 261.692)",
  rose300: "oklch(81% 0.117 11.638)",
  rose950: "oklch(27.1% 0.105 12.094)",
} as const;

export const THEME = {
  primaryBorder: `1px solid ${COLOR.gray950}`,
} as const;

export const GLOBAL_STYLES = {
  root: {
    backgroundColor: COLOR.gray300,
    border: THEME.primaryBorder,
    color: COLOR.gray900,
    fontFamily: "Helvetica",
    left: "64px",
    opacity: 0,
    overflow: "hidden",
    borderRadius: "0.25em",
    pointerEvents: "none",
    position: "fixed",
    top: "8px",
    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  },
  actionContainer: {
    alignItems: "center",
    display: "flex",
    width: "100%",
  },
  mainContent: {
    alignItems: "center",
    display: "flex",
    height: "50vh",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: "10px",
    width: "max(37.5vw, 600px)",
  },
  windowContainer: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    width: "100%",
  },
  windowHead: {
    padding: "20px 10px",
    alignItems: "center",
    backgroundColor: COLOR.gray200,
    borderTop: THEME.primaryBorder,
    borderBottom: "none",
    display: "flex",
    height: "2.5em",
    justifyContent: "start",
    gap: "10px",
  },
  windowBody: {
    backgroundColor: COLOR.gray300,
    borderTop: THEME.primaryBorder,
    display: "flex",
    flex: 1,
    flexDirection: "column",
    overflowY: "scroll",
    scrollbarColor: `${COLOR.gray500} ${COLOR.gray100}`,
    scrollbarWidth: "thin",
  },
  triggerContainer: {
    alignItems: "start",
    backgroundColor: COLOR.gray200,
    borderBottom: THEME.primaryBorder,
    display: "flex",
    flexDirection: "column",
    padding: "0.9em 0.4em",
    gap: "0.6em",
    position: "relative",
  },
  triggerActionContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    direction: "ltr",
    justifyContent: "space-between",
    position: "absolute",
    right: "0px",
    gap: "5px",
  },
  triggerRowContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "0.25em",
  },
  triggerPropContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    width: "100%",
    whiteSpace: "nowrap",
    gap: "0.25em",
  },
  createTriggerContainer: {
    bottom: "0px",
    display: "flex",
    justifyContent: "center",
    left: "0px",
    marginLeft: "auto",
    marginRight: "auto",
    position: "absolute",
    right: "0px",
    transform: "translateY(50%)",
    zIndex: 1,
  },
  tabContainer: {
    marginLeft: "6px",
    alignItems: "end",
    display: "flex",
    justifyContent: "start",
    flexDirection: "row",
    width: "100%",
  },
  tabButton: {
    borderRadius: "5px 5px 0px 0px",
    transform: "translateY(1px)",
    zIndex: 1,
  },
} satisfies Record<string, React.CSSProperties>;
