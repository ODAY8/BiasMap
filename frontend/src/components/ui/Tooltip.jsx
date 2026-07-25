import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tooltip({ content, children, side = 'top' }) {
  const [visible, setVisible] = useState(false)

  const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full  left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full  top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{    opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 pointer-events-none ${positions[side]}`}
          >
            <div className="px-2.5 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-text-primary whitespace-nowrap shadow-card">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
