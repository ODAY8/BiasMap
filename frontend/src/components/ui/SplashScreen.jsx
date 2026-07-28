import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Zap, ArrowRight, X, Newspaper, MessageSquare, Mic, PenLine } from 'lucide-react'

const STORAGE_KEY = 'biasmap_onboarding_seen'

export function hasSeenOnboarding() {
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Animation config ──────────────────────────────────────────────
const PHASE_DURATION = {
  logo: 1400,       // 0–1.4s  : logo + tagline
  merge: 1600,      // 1.4–3s  : content types merge
  concepts: 1200,   // 3–4.2s  : concepts highlight
  cta: 800,         // 4.2–5s  : CTA slide in
}

const CONTENT_TYPES = [
  { label: 'News',         Icon: Newspaper,    color: '#6366f1' },
  { label: 'Social Media', Icon: MessageSquare, color: '#8b5cf6' },
  { label: 'Speeches',     Icon: Mic,          color: '#a78bfa' },
  { label: 'Blogs',        Icon: PenLine,       color: '#818cf8' },
]

const CONCEPTS = [
  { label: 'Emotional Language', color: '#f59e0b' },
  { label: 'Framing', color: '#6366f1' },
  { label: 'Evidence Signals', color: '#10b981' },
  { label: 'Perspective Coverage', color: '#8b5cf6' },
  { label: 'Missing Context', color: '#ef4444' },
]

// ── Merge positions for content type chips ────────────────────────
const MERGE_POSITIONS = [
  { x: -160, y: -60 },
  { x: 160,  y: -60 },
  { x: -160, y:  60 },
  { x: 160,  y:  60 },
]

export default function SplashScreen({ onDone }) {
  const prefersReduced = useReducedMotion()
  const [phase, setPhase] = useState('logo')   // logo → merge → concepts → cta → exit
  const [visibleConcepts, setVisibleConcepts] = useState([])
  const [exiting, setExiting] = useState(false)

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setExiting(true)
    setTimeout(onDone, 600)
  }, [onDone])

  // Phase sequencer
  useEffect(() => {
    if (prefersReduced) {
      setPhase('cta')
      return
    }

    const t1 = setTimeout(() => setPhase('merge'),    PHASE_DURATION.logo)
    const t2 = setTimeout(() => setPhase('concepts'), PHASE_DURATION.logo + PHASE_DURATION.merge)
    const t3 = setTimeout(() => setPhase('cta'),      PHASE_DURATION.logo + PHASE_DURATION.merge + PHASE_DURATION.concepts)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [prefersReduced])  // finish is not used inside this effect — removing it stops the timer reset loop

  // Stagger concept reveals
  useEffect(() => {
    if (phase !== 'concepts') return
    setVisibleConcepts([])
    CONCEPTS.forEach((_, i) => {
      setTimeout(() => setVisibleConcepts((p) => [...p, i]), i * 180)
    })
  }, [phase])

  const dur = prefersReduced ? 0.01 : undefined

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-background select-none"
        >
          {/* ── Background glows ── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px]"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-accent/10 blur-[90px]"
              animate={{ scale: [1.1, 1, 1.1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
          </div>

          {/* ── Skip button ── */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: dur ?? 0.4 }}
            onClick={finish}
            className="absolute top-5 right-5 flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-2 border border-transparent hover:border-border"
          >
            <X className="w-3.5 h-3.5" /> Skip
          </motion.button>

          {/* ── Progress bar ── */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-2">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: '0%' }}
              animate={{ width: exiting ? '100%' : phase === 'cta' ? '85%' : phase === 'concepts' ? '65%' : phase === 'merge' ? '35%' : '10%' }}
              transition={{ duration: prefersReduced ? 0.01 : 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* ── Main content ── */}
          <div className="relative flex flex-col items-center gap-8 px-6 max-w-lg w-full text-center">

            {/* Logo — always visible */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: dur ?? 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-4"
            >
              {/* Icon */}
              <div className="relative flex items-center justify-center">
                <motion.span
                  className="absolute w-20 h-20 rounded-2xl bg-primary/10"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                  className="absolute w-16 h-16 rounded-2xl bg-primary/15"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                />
                <div className="relative w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow-primary">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>

              {/* Wordmark */}
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text">BiasMap</h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dur ? 0 : 0.4, duration: dur ?? 0.5 }}
                  className="text-text-muted text-sm sm:text-base mt-2 tracking-wide"
                >
                  Understand the message behind the message.
                </motion.p>
              </div>
            </motion.div>

            {/* ── Phase: merge — content types flying into document ── */}
            <AnimatePresence>
              {(phase === 'merge' || phase === 'concepts') && !prefersReduced && (
                <motion.div
                  key="merge"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="relative flex items-center justify-center w-full"
                  style={{ height: 180 }}
                >
                  {/* Content type chips flying in */}
                  {CONTENT_TYPES.map((ct, i) => (
                    <motion.div
                      key={ct.label}
                      initial={{ x: MERGE_POSITIONS[i].x * 1.8, y: MERGE_POSITIONS[i].y * 1.8, opacity: 0, scale: 0.7 }}
                      animate={
                        phase === 'concepts'
                          ? { x: 0, y: 0, opacity: 0, scale: 0.4 }
                          : { x: MERGE_POSITIONS[i].x, y: MERGE_POSITIONS[i].y, opacity: 1, scale: 1 }
                      }
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                      className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full glass border text-xs font-medium"
                      style={{ borderColor: ct.color + '40', background: ct.color + '15', color: ct.color }}
                    >
                      <ct.Icon style={{ width: 12, height: 12 }} />
                      <span>{ct.label}</span>
                    </motion.div>
                  ))}

                  {/* Central document */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-28 h-36 rounded-xl glass border border-border flex flex-col gap-1.5 p-3 shadow-card"
                  >
                    {[100, 80, 90, 60, 75].map((w, i) => (
                      <motion.div
                        key={i}
                        className="h-1.5 rounded-full bg-surface-2"
                        style={{ width: `${w}%` }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.5 + i * 0.06, duration: 0.3, ease: 'easeOut' }}
                      />
                    ))}
                    <motion.div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring', stiffness: 400 }}
                    >
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase: concepts — highlighted tags ── */}
            <AnimatePresence>
              {phase === 'concepts' && !prefersReduced && (
                <motion.div
                  key="concepts"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-wrap justify-center gap-2"
                >
                  {CONCEPTS.map((c, i) => (
                    <motion.span
                      key={c.label}
                      initial={{ opacity: 0, scale: 0.8, y: 8 }}
                      animate={visibleConcepts.includes(i) ? { opacity: 1, scale: 1, y: 0 } : {}}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{ color: c.color, borderColor: c.color + '40', background: c.color + '12' }}
                    >
                      {c.label}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase: CTA ── */}
            <AnimatePresence>
              {phase === 'cta' && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: dur ?? 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <p className="text-xl sm:text-2xl font-bold text-text-primary">
                    Learn to think critically.
                  </p>
                  <p className="text-sm text-text-muted max-w-xs">
                    Recognize framing, compare perspectives, and ask better questions.
                  </p>

                  <motion.button
                    onClick={finish}
                    whileHover={prefersReduced ? {} : { scale: 1.03 }}
                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-glow-primary transition-colors"
                  >
                    Start Exploring
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  <p className="text-xs text-text-muted">
                    BiasMap analyzes <span className="text-text-secondary font-medium">how</span> information is communicated — not what you should believe.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
