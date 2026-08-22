import './Spinner.css'

export function Spinner({ size = 40, label }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" style={{ width: size, height: size }} />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  )
}
