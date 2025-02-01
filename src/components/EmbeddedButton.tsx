const {React} = window;
import {THEME} from '../styles';

enum BUTTON_MODE { BLURRED, HOVER, PRESSED }

interface Props {
  title?: string,
  disabled?: boolean,
  customStyle?: React.CSSProperties,
  size?: string
  onClick: () => void,
  icon: React.JSX.Element
}

interface State { mode: BUTTON_MODE }

const style: React.CSSProperties = {
  alignItems: 'center',
  borderRadius: '0.5em',
  border: 'none',
  display: 'flex',
  height: '1.5em',
  justifyContent: 'center',
  userSelect: 'none',
  width: '1.5em',
};

const modeBackgroundColors = {
  [BUTTON_MODE.BLURRED]: '#00000000',
  [BUTTON_MODE.HOVER]: '#00000066',
  [BUTTON_MODE.PRESSED]: '#00000033',
} as const;

export default class EmbeddedButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: BUTTON_MODE.BLURRED,
    };
  }

  render() {
    const {title, disabled, onClick, icon, size} = this.props;

    if (disabled && this.state.mode !== BUTTON_MODE.BLURRED) {
      this.setState({mode: BUTTON_MODE.BLURRED});
    }

    return <button
      title={title}
      style={{
        ...style,
        backgroundColor: modeBackgroundColors[this.state.mode],
        ...this.props.customStyle,
        fontSize: size || '25px',
        color: disabled ? THEME.midDark : THEME.dark,
      }}
      onMouseOver={() => !disabled && this.setState({mode: BUTTON_MODE.HOVER})}
      onMouseOut={() => !disabled && this.setState({mode: BUTTON_MODE.BLURRED})}
      onMouseDown={() => !disabled && this.setState({mode: BUTTON_MODE.PRESSED})}
      onMouseUp={() => !disabled && this.setState({mode: BUTTON_MODE.HOVER})}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </button>;
  }
}
