import {THEME} from '../styles';

const {React} = window;

/**
 *
 * @param prevValue
 * @param newValue
 * @param bounded
 * @param min
 * @param max
 */
function clampFloat(
    prevValue: string | number, newValue: string, bounded: boolean, min: number, max: number,
): number | string {
  const parsedValue = Number(newValue);

  if (Number.isNaN(parsedValue)) {
    return prevValue;
  }

  if (bounded) {
    return Math.max(min, Math.min(max, parsedValue));
  }

  if (newValue.includes('.') || newValue === '-' || newValue === '') {
    return newValue;
  }

  return parsedValue;
}

const style: React.CSSProperties = {
  backgroundColor: THEME.light,
  border: '2px solid black',
  borderRadius: '5px',
  height: '1.25em',
  padding: '5px',
  textAlign: 'right',
  width: '3em',
};

/**
 *
 * @param root0
 * @param root0.customStyle
 * @param root0.id
 * @param root0.value
 * @param root0.min
 * @param root0.max
 * @param root0.onChange
 */
export default function FloatPicker(
    {customStyle, id, value, min, max, onChange}:
  { customStyle: React.CSSProperties, id: string, value: (number | string), min: number, max: number,
    onChange: (v: number | string) => void },
) {
  return (
    <input
      style={{...style, ...customStyle}}
      id={id}
      value={value}
      min={min}
      max={max}
      onChange={(e: React.ChangeEvent) => onChange(
          clampFloat(value, (e.target as HTMLInputElement).value, false, min, max),
      )}
      onBlur={(e: React.ChangeEvent) => onChange(
          clampFloat(value, (e.target as HTMLInputElement).value, true, min, max),
      )}
    />
  );
}
