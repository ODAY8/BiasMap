import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useAsync } from '@/hooks/useAsync'
import { getUserProgress } from '@/services/progressService'
import { useUser } from '@/context/UserContext'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import GuestPrompt from '@/components/ui/GuestPrompt'
import ActivityChart from '@/components/charts/ActivityChart'
import SkillRadar from '@/components/charts/SkillRadar'
import {
  Flame, Trophy, BookOpen, FileText, Zap,
  Search, Crosshair, Brain, Star, TrendingUp,
  BarChart2, Target, Award,
} from 'lucide-react'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const fadeUp = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }
const fadeIn  = { hidden: { opacity: 0, scale: 0.93 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

const BADGE_ICONS = {
  search:      { Icon: Search,    color: 'text-primary', bg: 'bg-primary/10' },
  flame:       { Icon: Flame,     color: 'text-warning', bg: 'bg-warning/10' },
  brain:       { Icon: Brain,     color: 'text-accent',  bg: 'bg-accent/10'  },
  crosshair:   { Icon: Crosshair, color: 'text-danger',  bg: 'bg-danger/10'  },
  'book-open': { Icon: BookOpen,  color: 'text-success', bg: 'bg-success/10' },
}

function MagneticIcon({ children, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0); const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 18 })
  const sy = useSpring(y, { stiffness: 200, damping: 18 })
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width  / 2)) * 0.35)
    y.set((e.clientY - (r.top  + r.height / 2)) * 0.35)
  }
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0) }} className={className}>
      {children}
    </motion.div>
  )
}

function FloatingIcon({ icon: Icon, color, bg, delay = 0 }) {
  return (
    <MagneticIcon>
      <motion.div animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
        <motion.div animate={{ rotate: [0, 7, -7, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.4 }}>
          <Icon className={`w-5 h-5 ${color}`} />
        </motion.div>
      </motion.div>
    </MagneticIcon>
  )
}

function PulsingIcon({ icon: Icon, color, bg, ringColor, delay = 0 }) {
  return (
    <MagneticIcon>
      <div className="relative w-10 h-10 flex items-center justify-center">
        <motion.span className="absolute inset-0 rounded-xl" style={{ background: ringColor }}
          animate={{ scale: [1, 1.65, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay }} />
        <motion.span className="absolute inset-0 rounded-xl" style={{ background: ringColor }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.55 }} />
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </MagneticIcon>
  )
}

function SpinningIcon({ icon: Icon, color, bg }) {
  return (
    <MagneticIcon>
      <motion.div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
        animate={{ rotate: [0, 6, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ rotate: 360, transition: { duration: 0.5 } }}>
        <Icon className={`w-5 h-5 ${color}`} />
      </motion.div>
    </MagneticIcon>
  )
}

function BouncingIcon({ icon: Icon, color, bg }) {
  return (
    <MagneticIcon>
      <motion.div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
        animate={{ y: [0, -4, 0], scaleY: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.4, 0.7, 1] }}>
        <Icon className={`w-5 h-5 ${color}`} />
      </motion.div>
    </MagneticIcon>
  )
}

const colorMap = {
  primary: { text: 'text-primary', bg: 'bg-primary/10', glow: 'rgba(99,102,241,0.18)', ring: 'rgba(99,102,241,0.15)' },
  success: { text: 'text-success', bg: 'bg-success/10', glow: 'rgba(16,185,129,0.18)', ring: 'rgba(16,185,129,0.15)' },
  warning: { text: 'text-warning', bg: 'bg-warning/10', glow: 'rgba(245,158,11,0.18)', ring: 'rgba(245,158,11,0.15)' },
  accent:  { text: 'text-accent',  bg: 'bg-accent/10',  glow: 'rgba(139,92,246,0.18)', ring: 'rgba(139,92,246,0.15)' },
}

function StatCard({ iconType, icon: Icon, label, value, color = 'primary', delay = 0 }) {
  const c = colorMap[color]
  const iconEl =
    iconType === 'pulse'  ? <PulsingIcon  icon={Icon} color={c.text} bg={c.bg} ringColor={c.ring} delay={delay} /> :
    iconType === 'spin'   ? <SpinningIcon icon={Icon} color={c.text} bg={c.bg} /> :
    iconType === 'bounce' ? <BouncingIcon icon={Icon} color={c.text} bg={c.bg} /> :
                            <FloatingIcon icon={Icon} color={c.text} bg={c.bg} delay={delay} />
  return (
    <motion.div variants={fadeIn}>
      <motion.div whileHover={{ y: -4, boxShadow: `0 12px 32px ${c.glow}` }}
        transition={{ duration: 0.2 }}
        className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4 cursor-default">
        {iconEl}
        <div>
          <motion.p className="text-xl font-bold text-text-primary"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + delay, duration: 0.4 }}>
            {value}
          </motion.p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

function BadgeCard({ badge, index }) {
  const entry = BADGE_ICONS[badge.icon] ?? { Icon: Award, color: 'text-primary', bg: 'bg-primary/10' }
  const { Icon, color, bg } = entry
  return (
    <motion.div variants={fadeIn}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(99,102,241,0.15)' }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-surface-2 border border-border text-center cursor-default">
      <MagneticIcon>
        <motion.div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}
          animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3 + index * 0.3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
          whileHover={{ scale: 1.15, rotate: 0 }}>
          <Icon className={`w-6 h-6 ${color}`} />
        </motion.div>
      </MagneticIcon>
      <p className="text-xs font-semibold text-text-primary">{badge.name}</p>
      <p className="text-2xs text-text-muted leading-tight">{badge.description}</p>
    </motion.div>
  )
}

const SKILL_ICONS = {
  'Emotion Detection':    { Icon: Target,     color: 'text-warning' },
  'Source Evaluation':    { Icon: Search,     color: 'text-info'    },
  'Framing Analysis':     { Icon: BarChart2,  color: 'text-primary' },
  'Logical Fallacies':    { Icon: Brain,      color: 'text-accent'  },
  'Statistical Literacy': { Icon: TrendingUp, color: 'text-success' },
}

function SkillRow({ skill, index }) {
  const entry = SKILL_ICONS[skill.skill] ?? { Icon: Star, color: 'text-primary' }
  const barColor = skill.level >= 70 ? 'success' : skill.level >= 40 ? 'warning' : 'danger'
  return (
    <motion.div variants={fadeIn} className="flex items-center gap-3">
      <motion.div animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
        whileHover={{ scale: 1.2, rotate: 0 }} className="shrink-0">
        <entry.Icon className={`w-4 h-4 ${entry.color}`} />
      </motion.div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-text-secondary">{skill.skill}</span>
          <motion.span className="text-xs text-text-muted"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}>
            {skill.level}%
          </motion.span>
        </div>
        <ProgressBar value={skill.level} color={barColor} />
      </div>
    </motion.div>
  )
}

export default function ProgressPage() {
  const { isGuest } = useUser()
  const { data, loading, error, refetch } = useAsync(getUserProgress)

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton className="h-16" /></Card>)}
      </div>
      <Card><Skeleton lines={5} /></Card>
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />

  if (isGuest) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <p className="text-text-muted text-xs mb-1">Your learning journey</p>
          <h2 className="text-2xl font-bold text-text-primary">Progress</h2>
        </div>
        <GuestPrompt feature="XP, streaks, badges, and skill progress" />
        <div className="rounded-2xl border border-border bg-surface px-6 py-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto">
            <BarChart2 className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-sm font-semibold text-text-primary">No progress to show</p>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Sign in to track your learning, earn badges, and build your streak across sessions.
          </p>
        </div>
      </motion.div>
    )
  }

  if (!data) return null

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">

      {/* XP Level card */}
      <motion.div variants={fadeUp}>
        <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-surface to-accent/5 border border-border p-6">
          <motion.div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full bg-accent/10 blur-3xl pointer-events-none"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <motion.p className="text-xs text-text-muted uppercase tracking-wider mb-1"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                Level {data.level}
              </motion.p>
              <motion.p className="text-2xl font-bold text-text-primary"
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
                {data.xp.toLocaleString()} XP
              </motion.p>
            </div>
            <MagneticIcon>
              <motion.div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                whileHover={{ scale: 1.15, rotate: 0 }}>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  <Zap className="w-7 h-7 text-primary" />
                </motion.div>
              </motion.div>
            </MagneticIcon>
          </div>

          <div className="relative z-10">
            <ProgressBar value={data.xp} max={data.nextLevelXp} color="primary" showLabel />
            <motion.p className="text-xs text-text-muted mt-2"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              {(data.nextLevelXp - data.xp).toLocaleString()} XP to Level {data.level + 1}
            </motion.p>
          </div>

          <motion.div className="absolute right-20 top-3 opacity-10 pointer-events-none"
            animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <Star className="w-5 h-5 text-warning" />
          </motion.div>
          <motion.div className="absolute right-8 bottom-3 opacity-10 pointer-events-none"
            animate={{ y: [0, 5, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}>
            <Trophy className="w-5 h-5 text-accent" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Stat cards */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" variants={container} initial="hidden" animate="show">
        <StatCard iconType="bounce" icon={FileText} label="Articles Analyzed" value={data.articlesAnalyzed}    color="primary" delay={0}   />
        <StatCard iconType="spin"   icon={BookOpen} label="Lessons Completed" value={data.lessonsCompleted}    color="success" delay={0.1} />
        <StatCard iconType="pulse"  icon={Flame}    label="Day Streak"        value={data.streak}              color="warning" delay={0.2} />
        <StatCard iconType="float"  icon={Trophy}   label="Badges Earned"     value={data.badges?.length ?? 0} color="accent"  delay={0.3} />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                <BarChart2 className="w-4 h-4 text-primary" />
              </motion.div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Weekly Activity</h3>
            </div>
            <ActivityChart data={data.weeklyActivity ?? []} />
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />Analyses
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent inline-block" />Lessons
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Target className="w-4 h-4 text-accent" />
              </motion.div>
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Skill Radar</h3>
            </div>
            <SkillRadar data={data.skillProgress ?? []} />
            <motion.div className="space-y-3 mt-2" variants={container} initial="hidden" animate="show">
              {(data.skillProgress ?? []).map((skill, i) => <SkillRow key={skill.skill} skill={skill} index={i} />)}
            </motion.div>
          </Card>
        </motion.div>
      </div>

      {/* Badges */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <Award className="w-4 h-4 text-warning" />
            </motion.div>
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Badges Earned</h3>
          </div>
          {(data.badges ?? []).length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                <Trophy className="w-10 h-10 text-text-muted opacity-30" />
              </motion.div>
              <p className="text-sm text-text-muted">Complete challenges to earn badges.</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
              variants={container} initial="hidden" animate="show">
              {(data.badges ?? []).map((badge, i) => <BadgeCard key={badge.id} badge={badge} index={i} />)}
            </motion.div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  )
}
