import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'relative px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0',
            active === tab.value ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
              active === tab.value ? 'bg-primary/15 text-primary' : 'bg-surface-2 text-text-muted'
            )}>
              {tab.count}
            </span>
          )}
          {active === tab.value && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-px bg-primary"
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
