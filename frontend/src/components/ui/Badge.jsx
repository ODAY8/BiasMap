import clsx from 'clsx'

const colors = {
  default: 'bg-surface-2 text-text-secondary border-border',
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
}

export default function Badge({ children, color = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border',
        colors[color],
        className
      )}
    >
      {children}
    </span>
  )
}
