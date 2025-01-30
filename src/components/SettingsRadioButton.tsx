const { React } = window;
import { THEME } from "../styles";

export default function SettingsRadioButton(
  {current, target, label, onClick}:
  {current: number, target: number, label: string, onClick: (e: number) => void}
) {
  return <button
    style={{
      border: "2px solid black",
      borderRadius: "5px",
      margin: "5px",
      backgroundColor: current === target ? THEME.midLight : THEME.midDark
    }}
    onClick={() => onClick(target)}
  >
    <text>{label}</text>
  </button>;
}