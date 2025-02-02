const { React } = window;
import { THEME } from '../styles';

const styles = {
  head: {
    backgroundColor: THEME.light,
    border: '2px solid black',
    borderRadius: '5px',
    height: '1.5em',
    textAlign: 'right',
  },
  option: {
    backgroundColor: THEME.light,
    border: '2px solid black',
    height: '1.25em',
    textAlign: 'center',
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Creates a custom dropdown selecting between a list of numbered items
 * @param root0 Custom dropdown properties
 * @param root0.customStyle Custom styles to apply to this dropdown
 * @param root0.value Currently selected dropdown item
 * @param root0.count Count of values to choose from
 * @param root0.label Label to prefix each value with
 * @param root0.onChange Function ran whenever item is selected
 * @returns Custom select input dropdown populated with options
 */
export default function Dropdown(
    { customStyle, value, count, label, onChange }:
  {customStyle?: React.CSSProperties, value: number, count: number, label: string, onChange: (e: number) => void},
) {
  return <select
    style={{ ...styles.head, ...customStyle }}
    value={value}
    onChange={(e: React.ChangeEvent) => onChange(parseInt((e.target as HTMLInputElement).value))}
  >
    {...Array(count).fill(0).map((_, index) =>
      <option style={styles.option} value={index}>
        {label} {1 + index}
      </option>,
    )}
  </select>;
}
