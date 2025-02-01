const {React} = window;
import {THEME} from '../styles';

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
 *
 * @param root0
 * @param root0.customStyles
 * @param root0.value
 * @param root0.count
 * @param root0.label
 * @param root0.onChange
 */
export default function Dropdown(
    {customStyle, value, count, label, onChange}:
  {customStyle?: React.CSSProperties, value: number, count: number, label: string, onChange: (e: number) => void},
) {
  return <select
    style={{...styles.head, ...customStyle}}
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
