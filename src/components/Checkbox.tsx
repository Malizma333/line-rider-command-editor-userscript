const {React} = window;

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
    background: '#FFF',
    border: '2px solid black',
    borderRadius: '50%',
    boxSizing: 'border-box',
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  fill: {
    backgroundColor: '#000',
    borderRadius: '50%',
    height: '50%',
    pointerEvents: 'none',
    position: 'absolute',
    width: '50%',
  },
} satisfies Record<string, React.CSSProperties>;

/**
 *
 * @param root0
 * @param root0.customStyle
 * @param root0.id
 * @param root0.value
 * @param root0.onCheck
 */
export default function Checkbox(
    {customStyle, id, value, onCheck}:
  {customStyle: React.CSSProperties, id: string, value: boolean, onCheck: () => void},
) {
  return <div style={{...styles.container, ...customStyle}}>
    <input
      id={id}
      style={styles.primary}
      type="checkbox"
      onChange={() => onCheck()}
    />
    {value && <div style={styles.fill}></div>}
  </div>;
}
