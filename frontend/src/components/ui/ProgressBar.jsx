import clsx from 'clsx'

const colors = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  accent: 'bg-accent',
}

export default function ProgressBar({ value, max = 100, color = 'primary', className, showLabel }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={clsx('flex items-center gap-3', className)}>
      <div className="flex-1 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-text-muted w-8 text-right">{pct}%</span>}
    </div>
  )
}
