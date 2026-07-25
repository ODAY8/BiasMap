import clsx from 'clsx'

export default function Textarea({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-secondary">{label}</label>}
      <textarea
        className={clsx(
          'w-full bg-surface-2 border border-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors',
          error && 'border-danger/50 focus:border-danger/50 focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
