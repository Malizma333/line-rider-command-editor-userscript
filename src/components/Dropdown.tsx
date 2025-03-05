const { React } = window;
import { THEME } from '../styles';

const styles = {
  head: {
    backgroundColor: THEME.colorGray50,
    border: '2px solid black',
    borderRadius: '5px',
    boxShadow: '0px 1px 4px -1px #000',
    cursor: 'pointer',
    height: '1.5em',
    textAlign: 'right',
  },
  option: {
    backgroundColor: THEME.colorGray50,
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
 * @param root0.mapping Array of values to choose from
 * @param root0.label Label to prefix each value with
 * @param root0.onChange Function ran whenever item is selected
 * @returns Custom select input dropdown populated with options
 */
export default function Dropdown(
    { customStyle, value, mapping, label, onChange }:
    {
      customStyle?: React.CSSProperties,
      value: number,
      mapping: number[],
      label: (e: number, i: number) => string,
      onChange: (e: number) => void
    },
) {
  return <select
    style={{ ...styles.head, ...customStyle }}
    value={value}
    onChange={(e: React.ChangeEvent) => onChange(parseInt((e.target as HTMLInputElement).value))}
  >
    {...mapping.map((value, index) =>
      <option style={styles.option} value={value}>
        {label(value, index)}
      </option>,
    )}
  </select>;
}
