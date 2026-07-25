import clsx from 'clsx'

export default function Skeleton({ className, lines, ...props }) {
  if (lines) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx('skeleton rounded-md h-4', i === lines - 1 && 'w-3/4', className)}
          />
        ))}
      </div>
    )
  }
  return <div className={clsx('skeleton rounded-md', className)} {...props} />
}
