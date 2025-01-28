const { React } = window;

function clampFloat(prevValue: string | number, newValue: string, bounded: boolean, min: number, max: number): number | string {
  const parsedValue = Number(newValue);

  if (Number.isNaN(parsedValue)) {
    return prevValue;
  }

  if (bounded) {
    return Math.max(min, Math.min(max, parsedValue));
  }

  if (newValue.includes(".") || newValue === "-" || newValue === "") {
    return newValue;
  }

  return parsedValue;
}

export default function FloatPicker({ style, id, value, min, max, onChange }: { style: object, id: string, value: (number | string), min: number, max: number, onChange: (v: number | string) => void }) {
  return (
    <input
      style={style}
      id={id}
      value={value}
      min={min}
      max={max}
      onChange={(e: React.ChangeEvent) => onChange(clampFloat(value, (e.target as HTMLInputElement).value, false, min, max))}
      onBlur={(e: React.ChangeEvent) => onChange(clampFloat(value, (e.target as HTMLInputElement).value, true, min, max))}
    />
  );
}
