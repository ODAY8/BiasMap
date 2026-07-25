import clsx from 'clsx'

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-glow-primary',
  secondary: 'bg-surface-2 hover:bg-[#22222e] text-text-primary border border-border',
  ghost: 'hover:bg-surface-2 text-text-secondary hover:text-text-primary',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  icon,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
