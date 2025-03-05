const { React } = window;
import { THEME } from '../styles';

// interface Props {
//   active: boolean
//   label: string
//   onClick: () => void
//   customStyle?: React.CSSProperties
// }

const style: React.CSSProperties = {
  border: '2px solid black',
  borderRadius: '5px',
  boxShadow: '0px 1px 4px -1px #000',
  transition: 'background-color 0.125s ease-in-out',
};

export default function FloatingButton(
    { active, disabled, label, onClick, customStyle }:
  {active: boolean, disabled?: boolean, label: string, onClick: () => void, customStyle?: React.CSSProperties},
) {
  return <button
    style={{
      ...style,
      ...customStyle,
      backgroundColor: active ? THEME.colorGray100 : THEME.colorGray400,
    }}
    disabled={disabled}
    onClick={() => onClick()}
  >
    <text>{label}</text>
  </button>;
}
