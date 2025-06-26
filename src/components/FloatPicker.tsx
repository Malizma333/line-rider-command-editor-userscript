import { COLOR, THEME } from "../styles";
const { React } = window;

interface Props {
  customStyle: React.CSSProperties;
  id: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

interface State {
  value: string;
}

/**
 * Validates the number for a custom float picker
 * @param prevValue Value that this field previously took on
 * @param newValue Proposed value of this field
 * @param bounded Whether this value is bounded by minimum, maximum, and valid number constraints
 * @param min Minimum amount this value can take on
 * @param max Maximum amount this value can take on
 * @returns The validated value
 */
function clampFloat(prevValue: string, newValue: string, bounded: boolean, min: number, max: number): string {
  if (bounded) {
    const parsedValue = Number(newValue);

    if (isNaN(parsedValue)) {
      return min.toString();
    }

    return Math.min(max, Math.max(min, parsedValue)).toString();
  } else {
    const floatRegex = new RegExp("^[+-]?([0-9]*[.])?[0-9]*$");

    if (!floatRegex.test(newValue)) {
      return prevValue;
    }

    return newValue;
  }
}

const style: React.CSSProperties = {
  backgroundColor: COLOR.gray50,
  border: THEME.primaryBorder,
  borderRadius: "5px",
  boxShadow: "inset 0px 1px 4px -1px #000",
  height: "1.25em",
  padding: "5px",
  textAlign: "right",
  width: "3em",
};

/**
 * Creates a custom float picker
 * @param root0 Custom properties for this input
 * @param root0.customStyle Custom styles to apply to this input
 * @param root0.id Id corresponding to this number form field
 * @param root0.value Current value of this field
 * @param root0.min Minimum amount this value can take on
 * @param root0.max Maximum amount this value can take on
 * @param root0.onChange Function ran whenever this value changes
 * @returns Custom float input
 */
export default class FloatPicker extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  onSet(e: React.ChangeEvent, confirm: boolean) {
    const min = this.props.min === undefined ? -Number.MAX_SAFE_INTEGER : this.props.min;
    const max = this.props.max === undefined ? Number.MAX_SAFE_INTEGER : this.props.max;

    const value = clampFloat(this.state.value, (e.target as HTMLInputElement).value, confirm, min, max);
    this.setState({ value });

    if (confirm) {
      this.props.onChange(parseFloat(value));
    }
  }

  componentWillReceiveProps(nextProps: Readonly<Props>): void {
    this.setState({ value: nextProps.value });
  }

  render() {
    const { customStyle, id } = this.props;

    return (
      <input
        style={{ ...style, ...customStyle }}
        id={id}
        value={this.state.value}
        min={this.props.min}
        max={this.props.max}
        onChange={(e: React.ChangeEvent) => this.onSet(e, false)}
        onBlur={(e: React.ChangeEvent) => this.onSet(e, true)}
      />
    );
  }
}
