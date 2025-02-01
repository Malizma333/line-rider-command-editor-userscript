const {React} = window;

const styles = {
  container: {
    alignItems: 'center',
    display: 'flex',
    height: '20px',
    justifyContent: 'center',
    marginLeft: '5px',
    position: 'relative',
    width: '20px',
  },
  primary: {
    appearance: 'none',
    background: '#FFF',
    border: '2px solid black',
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  fill: {
    backgroundColor: '#000',
    height: '60%',
    pointerEvents: 'none',
    position: 'absolute',
    width: '60%',
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
    {value as boolean && <div style={styles.fill}></div>}
  </div>;
}
