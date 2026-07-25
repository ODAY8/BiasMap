import { motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import Button from './Button'
import { useToast } from '@/context/ToastContext'

export default function GuestPrompt({ feature = 'this feature', compact = false }) {
  const { isGuest, register } = useUser()
  const toast = useToast()
  const [dismissed, setDismissed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  if (!isGuest || dismissed) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Your data is now saved.')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-warning/25 bg-warning/6"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
        <p className="text-xs text-text-secondary flex-1">
          Guest data is stored locally and{' '}
          <span className="text-warning font-medium">may be lost</span>.{' '}
          <button onClick={() => setShowForm(true)} className="text-primary hover:underline font-medium">
            Save {feature}
          </button>
        </p>
        <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text-primary transition-colors">
          <X className="w-3 h-3" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-warning/25 bg-warning/5 px-6 py-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-warning/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">You're browsing as a guest</p>
          <p className="text-xs text-text-muted mt-0.5">
            Your {feature} is saved only in this browser.{' '}
            <span className="text-warning font-medium">Clearing browser data or switching devices will erase it.</span>
          </p>
        </div>
        <button onClick={() => setDismissed(true)} className="text-text-muted hover:text-text-primary transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {!showForm ? (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowForm(true)}>Create free account</Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>Maybe later</Button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-2.5">
          <input
            required placeholder="Your name" value={form.name} onChange={set('name')}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <input
            required type="email" placeholder="Email" value={form.email} onChange={set('email')}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <input
            required type="password" placeholder="Password" value={form.password} onChange={set('password')}
            className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <div className="flex gap-2">
            <Button size="sm" type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save my data & register'}</Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}
    </motion.div>
  )
}
