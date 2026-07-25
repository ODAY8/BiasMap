import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

let id = 0

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const COLORS = {
  success: 'text-success border-success/20 bg-success/8',
  error:   'text-danger  border-danger/20  bg-danger/8',
  warning: 'text-warning border-warning/20 bg-warning/8',
  info:    'text-info    border-info/20    bg-info/8',
}

function Toast({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] ?? Info
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: -8, scale: 0.96  }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-card max-w-sm w-full ${COLORS[toast.type]}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {toast.title && <p className="text-sm font-semibold text-text-primary">{toast.title}</p>}
        {toast.message && <p className="text-xs text-text-secondary mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 text-text-muted hover:text-text-primary transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((toastId) => {
    setToasts((t) => t.filter((x) => x.id !== toastId))
  }, [])

  const push = useCallback((type, title, message, duration = 4000) => {
    const toastId = ++id
    setToasts((t) => [...t, { id: toastId, type, title, message }])
    if (duration > 0) setTimeout(() => dismiss(toastId), duration)
    return toastId
  }, [dismiss])

  const toast = {
    success: (title, message, dur) => push('success', title, message, dur),
    error:   (title, message, dur) => push('error',   title, message, dur),
    warning: (title, message, dur) => push('warning', title, message, dur),
    info:    (title, message, dur) => push('info',    title, message, dur),
    dismiss,
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
