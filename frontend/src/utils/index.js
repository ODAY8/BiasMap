import clsx from 'clsx'

/** Merge class names (alias for clsx) */
export const cn = (...args) => clsx(...args)

/** Format ISO date string → "Jan 15, 2024" */
export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** Clamp a number between min and max */
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max)

/** Bias score → label + color */
export const biasLevel = (score) =>
  score > 70
    ? { label: 'High bias',  color: 'text-danger',  bg: 'bg-danger/10'  }
    : score > 50
    ? { label: 'Moderate',   color: 'text-warning', bg: 'bg-warning/10' }
    : { label: 'Low bias',   color: 'text-success', bg: 'bg-success/10' }

/** Truncate a string to n chars */
export const truncate = (str, n = 80) =>
  str.length > n ? str.slice(0, n).trimEnd() + '…' : str
