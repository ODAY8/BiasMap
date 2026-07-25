import { motion } from 'framer-motion'

const scoreColor = (score) =>
  score > 70 ? '#ef4444' : score > 50 ? '#f59e0b' : '#10b981'

const scoreLabel = (score) =>
  score > 70 ? 'High' : score > 50 ? 'Moderate' : 'Low'

export default function BiasScoreRing({ score, size = 80 }) {
  const strokeWidth = size < 60 ? 4 : 6
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className="font-bold tabular-nums" style={{ color, fontSize: size < 60 ? 11 : 15 }}>{score}</span>
        {size >= 60 && (
          <span className="text-text-muted" style={{ fontSize: 9, marginTop: 2 }}>{scoreLabel(score)}</span>
        )}
      </div>
    </div>
  )
}
