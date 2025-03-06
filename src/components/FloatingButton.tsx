import { COLOR, THEME } from '../styles';
const { React } = window;

enum BUTTON_MODE { BLURRED, PRESSED }

interface Props {
  active: boolean
  customStyle?: React.CSSProperties
  disabled?: boolean
  label: string
  onClick: () => void
  disabledShadow?: boolean
}

interface State { mode: BUTTON_MODE }

const style: React.CSSProperties = {
  border: THEME.primaryBorder,
  borderRadius: '5px',
  boxShadow: '',
};

const modeShadows = {
  [BUTTON_MODE.BLURRED]: '0px 1px 4px -1px #000',
  [BUTTON_MODE.PRESSED]: 'none',
};

export default class FloatingButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: BUTTON_MODE.BLURRED,
    };
  }

  render() {
    const { active, customStyle, disabled, disabledShadow, label, onClick } = this.props;

    if (disabled && this.state.mode !== BUTTON_MODE.BLURRED) {
      this.setState({ mode: BUTTON_MODE.BLURRED });
    }

    return <button
      style={{
        ...style,
        ...customStyle,
        boxShadow: disabledShadow ? 'none' : modeShadows[this.state.mode],
        backgroundColor: !disabled && active ? COLOR.gray50 : COLOR.gray400,
      }}
      onMouseDown={() => !disabled && this.setState({ mode: BUTTON_MODE.PRESSED })}
      onMouseUp={() => !disabled && this.setState({ mode: BUTTON_MODE.BLURRED })}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {label}
    </button>;
  }
}
