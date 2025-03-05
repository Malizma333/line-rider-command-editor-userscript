import { THEME } from '../styles';

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
function clampInt(
    prevValue: string | number, newValue: string, bounded: boolean, min: number, max: number,
): number | string {
  const parsedValue = Number(newValue);

  if (Number.isNaN(parsedValue) || !Number.isInteger(parsedValue)) {
    return prevValue;
  }

  if (bounded) {
    return Math.max(min, Math.min(max, parsedValue));
  }

  if (newValue === '-' || newValue === '') {
    return newValue;
  }

  return parsedValue;
}

const style: React.CSSProperties = {
  backgroundColor: THEME.colorGray50,
  border: '2px solid black',
  borderRadius: '5px',
  height: '1.25em',
  padding: '5px',
  textAlign: 'right',
  width: '3em',
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
  { customStyle: React.CSSProperties, id: string, value: (number | string), min: number, max: number,
    onChange: (v: number | string) => void },
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
