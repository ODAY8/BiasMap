import clsx from 'clsx'

export default function FilterChips({ options, active, onChange, multi = false }) {
  const toggle = (val) => {
    if (!multi) { onChange(active === val ? null : val); return }
    const arr = Array.isArray(active) ? active : []
    onChange(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val])
  }

  const isActive = (val) => multi
    ? (Array.isArray(active) && active.includes(val))
    : active === val

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => toggle(opt.value)}
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150',
            isActive(opt.value)
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-surface-2 border-border text-text-muted hover:text-text-primary hover:border-border'
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span className="ml-1 opacity-60">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
