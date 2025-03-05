const { React } = window;
import { THEME } from '../styles';

const style: React.CSSProperties = {
  border: '2px solid black',
  borderRadius: '5px',
  margin: '5px',
  transition: 'background-color 0.125s ease-in-out',
};

/**
 * A custom radio button created for a radio button group
 * @param root0 Custom radio button properties
 * @param root0.current Current value within the radio group
 * @param root0.target Target value this radio button corresponds to
 * @param root0.label Label to put on this radio button option
 * @param root0.onClick Function ran whenever this button is clicked
 * @returns Custom radio button with label inside
 */
export default function SettingsRadioButton(
    { current, target, label, onClick }:
  {current: number, target: number, label: string, onClick: (e: number) => void},
) {
  return <button
    style={{
      ...style,
      backgroundColor: current === target ? THEME.colorGray100 : THEME.colorGray400,
    }}
    onClick={() => onClick(target)}
  >
    <text>{label}</text>
  </button>;
}
