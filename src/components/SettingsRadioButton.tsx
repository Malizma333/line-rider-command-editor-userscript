const {React} = window;
import {THEME} from '../styles';

const style: React.CSSProperties = {
  border: '2px solid black',
  borderRadius: '5px',
  margin: '5px',
};

/**
 *
 * @param root0
 * @param root0.current
 * @param root0.target
 * @param root0.label
 * @param root0.onClick
 */
export default function SettingsRadioButton(
    {current, target, label, onClick}:
  {current: number, target: number, label: string, onClick: (e: number) => void},
) {
  return <button
    style={{
      ...style,
      backgroundColor: current === target ? THEME.midLight : THEME.midDark,
    }}
    onClick={() => onClick(target)}
  >
    <text>{label}</text>
  </button>;
}
