import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import Button from './Button'

export default function AuthModal() {
  const { register, login, continueAsGuest } = useUser()
  const toast = useToast()
  const [tab, setTab]           = useState('login')   // 'login' | 'register'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [guestWarning, setGuestWarning] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'register') {
        await register({ name: form.name, email: form.email, password: form.password })
        toast.success('Account created! Welcome to BiasMap.')
      } else {
        await login({ email: form.email, password: form.password })
        toast.success('Welcome back!')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    if (!guestWarning) { setGuestWarning(true); return }
    setLoading(true)
    try {
      await continueAsGuest()
    } catch (err) {
      toast.error(err.message || 'Could not start guest session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-card overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center border-b border-border">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-glow-primary">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Welcome to BiasMap</h2>
          <p className="text-xs text-text-muted mt-1">Analyze media. Think critically.</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setGuestWarning(false) }}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                tab === t
                  ? 'text-primary border-b-2 border-primary -mb-px'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4">
          <form onSubmit={submit} className="space-y-3">
            {tab === 'register' && (
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={set('name')}
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              />
            )}
            <input
              required
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={set('email')}
              className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
            />
            <div className="relative">
              <input
                required
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={set('password')}
                className="w-full bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Guest option */}
          <div className="space-y-2">
            <AnimatePresence>
              {guestWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/8 px-3.5 py-3"
                >
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    <span className="font-semibold text-warning">Your data won't be saved.</span>{' '}
                    Analyses and progress are stored only in this browser and will be lost if you clear your data or switch devices.{' '}
                    <button
                      onClick={() => { setGuestWarning(false); setTab('register') }}
                      className="text-primary hover:underline font-medium"
                    >
                      Create a free account instead.
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-border text-xs font-medium text-text-muted hover:text-text-primary hover:border-border/80 hover:bg-surface-2 transition-colors disabled:opacity-50"
            >
              {guestWarning ? 'Continue anyway as guest →' : 'Continue as guest'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
