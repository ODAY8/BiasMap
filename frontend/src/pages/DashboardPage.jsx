import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Flame, Zap, BookOpen, FileText, TrendingUp, Clock } from 'lucide-react'
import { biasLevel, formatDate } from '@/utils'
import { useAsync } from '@/hooks/useAsync'
import { getRecentAnalyses } from '@/services/analysisService'
import { getUserProgress } from '@/services/progressService'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Badge from '@/components/ui/Badge'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const up = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

function MagneticIcon({ children }) {
  const ref = useRef(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 20 })
  const sy = useSpring(y, { stiffness: 220, damping: 20 })
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width  / 2) * 0.3)
    y.set((e.clientY - r.top  - r.height / 2) * 0.3)
  }
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={move} onMouseLeave={() => { x.set(0); y.set(0) }}>
      {children}
    </motion.div>
  )
}

const contentTypeColor = { News: 'info', Opinion: 'warning', Science: 'success', Finance: 'accent' }

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isGuest } = useUser()
  const { data: recent, loading: rLoading, error: rError, refetch } = useAsync(getRecentAnalyses)
  const { data: progress, loading: pLoading } = useAsync(getUserProgress)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 sm:space-y-8">

      {/* Primary action */}
      <motion.div variants={up}>
        <motion.button
          onClick={() => navigate('/analyze')}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full text-left group relative overflow-hidden rounded-2xl border border-border bg-surface px-5 py-6 sm:px-8 sm:py-7 transition-colors hover:border-primary/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-2">Start here</p>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-tight mb-1">Analyze an article</h2>
              <p className="text-text-muted text-sm hidden sm:block">
                Paste any text — news, opinion, social post — and see exactly how it's framing you.
              </p>
            </div>
            <motion.div
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </div>
        </motion.button>
      </motion.div>

      {/* Two-column layout — stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Recent analyses */}
        <motion.div variants={up} className="lg:col-span-3 space-y-1">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Recent analyses</h3>
            <button onClick={() => navigate('/analyze')} className="text-xs text-text-muted hover:text-primary transition-colors">
              New analysis
            </button>
          </div>

          {rLoading && (
            <div className="space-y-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-4 border-b border-border"><Skeleton lines={2} /></div>
              ))}
            </div>
          )}

          {rError && <ErrorState message={rError} onRetry={refetch} />}

          {recent && recent.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-sm text-text-muted">No analyses yet.</p>
            </div>
          )}

          {recent && (
            <div className="divide-y divide-border">
              {recent.map((item) => {
                const bias = biasLevel(item.biasScore)
                return (
                  <motion.div
                    key={item.id}
                    variants={up}
                    onClick={() => navigate('/analyze')}
                    className="group flex items-start justify-between gap-3 py-4 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge color={contentTypeColor[item.contentType] || 'default'} className="text-2xs">
                          {item.contentType}
                        </Badge>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors truncate">
                        {item.title || `${item.contentType} analysis`}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.preview}</p>
                    </div>
                    <div className="shrink-0 text-right pt-0.5">
                      <p className={`text-xs font-semibold ${bias.color}`}>{bias.label}</p>
                      <p className="text-lg font-bold text-text-primary leading-tight">{item.biasScore}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Right sidebar */}
        <div className="lg:col-span-2 space-y-4">

          {pLoading ? (
            <div className="rounded-xl border border-border bg-surface p-5"><Skeleton lines={3} /></div>
          ) : progress && (
            <motion.div variants={up} className="rounded-xl border border-border bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Level {progress.level}</p>
                  <p className="text-xl font-bold text-text-primary">{progress.xp.toLocaleString()} XP</p>
                </div>
                <MagneticIcon>
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Zap className="w-5 h-5 text-primary" />
                  </motion.div>
                </MagneticIcon>
              </div>

              <div className="space-y-1.5">
                <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.xp / progress.nextLevelXp) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-xs text-text-muted">
                  {(progress.nextLevelXp - progress.xp).toLocaleString()} XP to next level
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
                {[
                  { icon: FileText, value: progress.articlesAnalyzed, label: 'Analyzed', anim: { y: [0, -3, 0] }, dur: 2 },
                  { icon: Flame,    value: `${progress.streak}d`,     label: 'Streak',   anim: { scale: [1, 1.15, 1] }, dur: 1.8 },
                  { icon: BookOpen, value: progress.lessonsCompleted, label: 'Lessons',  anim: { rotate: [0, 6, -6, 0] }, dur: 3 },
                ].map(({ icon: Icon, value, label, anim, dur }) => (
                  <MagneticIcon key={label}>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <motion.div animate={anim} transition={{ duration: dur, repeat: Infinity, ease: 'easeInOut' }}>
                        <Icon className="w-4 h-4 text-text-muted" />
                      </motion.div>
                      <p className="text-base font-bold text-text-primary">{value}</p>
                      <p className="text-2xs text-text-muted">{label}</p>
                    </div>
                  </MagneticIcon>
                ))}
              </div>
            </motion.div>
          )}

          {[
            { label: 'Compare two sources', sub: 'Side-by-side framing analysis',    to: '/compare',   icon: TrendingUp },
            { label: "Today's challenge",   sub: 'Test your critical thinking',       to: '/challenge', icon: Flame      },
            { label: 'Learning hub',        sub: 'Build your media literacy skills',  to: '/learn',     icon: BookOpen   },
          ].map(({ label, sub, to, icon: Icon }, i) => (
            <motion.div key={to} variants={up}>
              <motion.button
                onClick={() => navigate(to)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border bg-surface hover:border-primary/25 transition-colors group"
              >
                <motion.div
                  className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0"
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                >
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
