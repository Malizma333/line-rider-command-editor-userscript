import { COLOR, THEME } from '../styles';
const { React } = window;

const styles = {
  container: {
    alignItems: 'center',
    display: 'flex',
    height: '1.25em',
    justifyContent: 'center',
    position: 'relative',
    width: '1.25em',
  },
  primary: {
    appearance: 'none',
    background: COLOR.gray50,
    border: THEME.primaryBorder,
    borderRadius: '50%',
    boxSizing: 'border-box',
    boxShadow: 'inset 0px 1px 4px -1px #000',
    cursor: 'pointer',
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  fill: {
    backgroundColor: '#000',
    borderRadius: '60%',
    height: '60%',
    pointerEvents: 'none',
    position: 'absolute',
    transition: 'opacity 0.125s ease-in-out',
    width: '60%',
  },
} satisfies Record<string, React.CSSProperties>;

/**
 * Custom circular checkbox with a label included
 * @param root0 Custom checkbox properties
 * @param root0.customStyle Custom styles to apply to the checkbox
 * @param root0.id Id corresponding to this checkbox form field
 * @param root0.value Value that this checkbox displays
 * @param root0.onCheck Function ran whenever this checkbox is interacted with
 * @returns Custom checkbox field
 */
export default function Checkbox(
    { customStyle, id, value, onCheck }:
  {customStyle: React.CSSProperties, id: string, value: boolean, onCheck: () => void},
) {
  return <div style={{ ...styles.container, ...customStyle }}>
    <input
      id={id}
      style={styles.primary}
      type="checkbox"
      onChange={() => onCheck()}
    />
    <div style={{ ...styles.fill, opacity: value ? '100' : '0' }}></div>
  </div>;
}
