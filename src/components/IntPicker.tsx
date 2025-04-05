import { COLOR, THEME } from "../styles";
const { React } = window;

/**
 * Validates the number for a custom integer picker
 * @param prevValue Value that this field previously took on
 * @param newValue Proposed value of this field
 * @param bounded Whether this value is bounded by minimum, maximum, and valid number constraints
 * @param min Minimum amount this value can take on
 * @param max Maximum amount this value can take on
 * @returns The validated value
 */
function clampInt(prevValue: string, newValue: string, bounded: boolean, min: number, max: number): string {
  if (bounded) {
    const parsedValue = Number(newValue);

    if (isNaN(parsedValue) || parsedValue !== Math.floor(parsedValue)) {
      return "0";
    }

    return Math.min(max, Math.max(min, parsedValue)).toString();
  } else {
    const floatRegex = new RegExp("[+-]?[0-9]*");

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
 * Creates a custom integer picker
 * @param root0 Custom properties for this input
 * @param root0.customStyle Custom styles to apply to this input
 * @param root0.id Id corresponding to this number form field
 * @param root0.value Current value of this field
 * @param root0.min Minimum amount this value can take on
 * @param root0.max Maximum amount this value can take on
 * @param root0.onChange Function ran whenever this value changes
 * @returns Custom integer input
 */
export default function IntPicker(
    { customStyle, id, value, min, max, onChange }:
  { customStyle: React.CSSProperties, id: string, value: string, min: number, max: number,
    onChange: (v: string) => void },
) {
  return (
    <input
      style={{ ...style, ...customStyle }}
      id={id}
      value={value}
      min={min}
      max={max}
      onChange={(e: React.ChangeEvent) => onChange(
          clampInt(value, (e.target as HTMLInputElement).value, false, min, max),
      )}
      onBlur={(e: React.ChangeEvent) => onChange(
          clampInt(value, (e.target as HTMLInputElement).value, true, min, max),
      )}
    />
  );
}
