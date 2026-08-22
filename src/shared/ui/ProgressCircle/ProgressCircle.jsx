const RADIUS = 35
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ProgressCircle({ percent = 0 }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div className="progress-circle">
      <svg width="80" height="80">
        <circle className="bg" cx="40" cy="40" r={RADIUS}></circle>
        <circle
          className="progress"
          cx="40"
          cy="40"
          r={RADIUS}
          style={{
            strokeDasharray: CIRCUMFERENCE,
            strokeDashoffset: offset,
          }}
        ></circle>
      </svg>
      <div className="percentage-text">{percent}%</div>
    </div>
  )
}
