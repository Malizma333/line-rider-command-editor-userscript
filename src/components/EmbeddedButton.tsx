const { React } = window;
import { GLOBAL_STYLES } from "./styles";

enum BUTTON_MODE {
  BLURRED = 0,
  HOVER = 1,
  PRESSED = 2
}

interface Props { title?: string, disabled?: boolean, style?: React.CSSProperties, onClick: () => void, icon: React.JSX.Element }
interface State { mode: BUTTON_MODE }

const style: React.CSSProperties = {
  alignItems: "center",
  background: "none",
  borderRadius: "0.5em",
  border: "none",
  display: "flex",
  fontSize: "22px",
  height: "1.5em",
  justifyContent: "center",
  userSelect: "none",
  width: "1.5em"
};

const modeBackgroundColors = {
  [BUTTON_MODE.BLURRED]: "transparent",
  [BUTTON_MODE.HOVER]: GLOBAL_STYLES.dark_gray1,
  [BUTTON_MODE.PRESSED]: GLOBAL_STYLES.light_gray1
};

export default class EmbeddedButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      mode: BUTTON_MODE.BLURRED
    };
  }

  render () {
    const { title, disabled, onClick, icon } = this.props;

    if (disabled && this.state.mode !== BUTTON_MODE.BLURRED) {
      this.setState({ mode: BUTTON_MODE.BLURRED });
    }

    return <button
      title={title}
      style={{ ...style, ...this.props.style, backgroundColor: modeBackgroundColors[this.state.mode] }}
      onMouseOver={() => !disabled && this.setState({ mode: BUTTON_MODE.HOVER })}
      onMouseOut={() => !disabled && this.setState({ mode: BUTTON_MODE.BLURRED })}
      onMouseDown={() => !disabled && this.setState({ mode: BUTTON_MODE.PRESSED })}
      onMouseUp={() => !disabled && this.setState({ mode: BUTTON_MODE.HOVER })}
      onClick={onClick}
      disabled={disabled}
    >
      <span style={{ color: disabled ? GLOBAL_STYLES.gray : GLOBAL_STYLES.black }}>{icon}</span>
    </button>;
  }
}
