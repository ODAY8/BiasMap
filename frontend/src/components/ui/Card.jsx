import clsx from 'clsx'

export default function Card({ children, className, hover = false, padding = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface border border-border rounded-xl',
        padding && 'p-5',
        hover && 'hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
