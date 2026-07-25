import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-medium text-text-primary">{item.title}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-text-secondary leading-relaxed">{item.content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Accordion({ items, allowMultiple = false }) {
  const [open, setOpen] = useState([])

  const toggle = (idx) => {
    if (allowMultiple) {
      setOpen((p) => p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx])
    } else {
      setOpen((p) => p.includes(idx) ? [] : [idx])
    }
  }

  return (
    <div>
      {items.map((item, i) => (
        <AccordionItem key={i} item={item} isOpen={open.includes(i)} onToggle={() => toggle(i)} />
      ))}
    </div>
  )
}
