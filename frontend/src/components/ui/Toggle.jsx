import clsx from 'clsx'

export default function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group">
      <div>
        {label && <p className="text-sm font-medium text-text-primary">{label}</p>}
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-5.5 rounded-full transition-colors duration-200 focus-ring shrink-0',
          checked ? 'bg-primary' : 'bg-surface-2 border border-border'
        )}
        style={{ height: '22px', width: '40px' }}
      >
        <span
          className={clsx(
            'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
            checked && 'translate-x-[18px]'
          )}
        />
      </button>
    </label>
  )
}
