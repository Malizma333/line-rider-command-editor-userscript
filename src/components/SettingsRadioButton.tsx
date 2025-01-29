const { React } = window;
import { GLOBAL_STYLES } from "./styles";

export default function SettingsRadioButton(
  {current, target, label, onClick}:
  {current: number, target: number, label: string, onClick: (e: number) => void}
) {
  return <button
    style={{
      border: "2px solid black",
      borderRadius: "5px",
      margin: "5px",
      backgroundColor: current === target ? GLOBAL_STYLES.light_gray1 : GLOBAL_STYLES.dark_gray1
    }}
    onClick={() => onClick(target)}
  >
    <text>{label}</text>
  </button>;
}