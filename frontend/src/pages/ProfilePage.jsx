import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Calendar, Zap, Flame, FileText, BookOpen,
  Search, Brain, Crosshair, Award, LogOut, Shield, Trash2, TrendingUp,
} from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getUserProfile } from '@/services/userService'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import { formatDate, biasLevel } from '@/utils'
import GuestPrompt from '@/components/ui/GuestPrompt'
import ProgressBar from '@/components/ui/ProgressBar'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const up = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }

const BADGE_ICONS = {
  search:      { Icon: Search,    color: 'text-primary', bg: 'bg-primary/10' },
  flame:       { Icon: Flame,     color: 'text-warning', bg: 'bg-warning/10' },
  brain:       { Icon: Brain,     color: 'text-accent',  bg: 'bg-accent/10'  },
  crosshair:   { Icon: Crosshair, color: 'text-danger',  bg: 'bg-danger/10'  },
  'book-open': { Icon: BookOpen,  color: 'text-success', bg: 'bg-success/10' },
}

const SKILL_COLORS = ['bg-primary', 'bg-accent', 'bg-success', 'bg-warning', 'bg-info']

export default function ProfilePage() {
  const { logout } = useUser()
  const toast = useToast()
  const { data, loading, error, refetch } = useAsync(getUserProfile)

  const handleLogout = async () => {
    await logout()
    toast.info('Signed out')
  }

  if (loading) return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={5} /></div>
        <div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={4} /></div>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={6} /></div>
      </div>
    </div>
  )

  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const xpPct = Math.round((data.xp / data.nextLevelXp) * 100)
  const topSkills = [...(data.skillProgress ?? [])].sort((a, b) => b.level - a.level).slice(0, 3)

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      <motion.div variants={up}>
        <p className="text-text-muted text-xs mb-1">Your account</p>
        <h2 className="text-2xl font-bold text-text-primary">Profile</h2>
      </motion.div>

      {/* Guest warning banner */}
      {data.isGuest && (
        <motion.div variants={up}>
          <GuestPrompt feature="analyses and progress" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Identity card */}
          <motion.div variants={up} className="rounded-2xl border border-border bg-surface overflow-hidden">
            <div className="h-20 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <div className="px-6 pb-5 -mt-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-surface flex items-center justify-center mb-3">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-bold text-text-primary leading-tight">{data.name}</p>
                {data.isGuest && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">Guest</span>
                )}
              </div>
              {data.email && <p className="text-xs text-text-muted mt-0.5">{data.email}</p>}

              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                  <Zap className="w-3 h-3" />
                  Level {data.level}
                </span>
                <span className="text-xs text-text-muted">
                  {(data.nextLevelXp - data.xp).toLocaleString()} XP to next
                </span>
              </div>

              <div className="mt-3">
                <ProgressBar value={xpPct} color="primary" />
                <p className="text-2xs text-text-muted mt-1">{data.xp.toLocaleString()} / {data.nextLevelXp.toLocaleString()} XP</p>
              </div>
            </div>
          </motion.div>

          {/* Account details — read only */}
          <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-5 py-4 space-y-3">
            <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest">Account details</p>
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <User className="w-4 h-4 text-text-muted shrink-0" />
              <div>
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-0.5">Name</p>
                <p className="text-sm text-text-primary">{data.name}</p>
              </div>
            </div>
            {data.email && (
              <div className="flex items-center gap-3 py-2 border-b border-border">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <div>
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm text-text-primary">{data.email}</p>
                </div>
              </div>
            )}
            {data.joinedAt && (
              <div className="flex items-center gap-3 py-2">
                <Calendar className="w-4 h-4 text-text-muted shrink-0" />
                <div>
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-0.5">Member since</p>
                  <p className="text-sm text-text-primary">{formatDate(data.joinedAt)}</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Account actions */}
          <motion.div variants={up} className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left group"
            >
              <LogOut className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
              Sign out
            </button>
            {!data.isGuest && (
              <>
                <button
                  onClick={() => toast.warning('Not implemented', 'Data export coming soon')}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left group"
                >
                  <Shield className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
                  Export my data
                </button>
                <button
                  onClick={() => toast.error('Not implemented', 'Account deletion coming soon')}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm text-danger/70 hover:text-danger hover:bg-danger/5 transition-colors text-left group"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete account
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Stats row */}
          <motion.div variants={up} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FileText, value: data.articlesAnalyzed, label: 'Analyses',  color: 'text-primary', bg: 'bg-primary/10' },
              { icon: BookOpen, value: data.lessonsCompleted, label: 'Lessons',   color: 'text-success', bg: 'bg-success/10' },
              { icon: Flame,    value: `${data.streak}d`,     label: 'Streak',    color: 'text-warning', bg: 'bg-warning/10' },
              { icon: Award,    value: data.badges.length,    label: 'Badges',    color: 'text-accent',  bg: 'bg-accent/10'  },
            ].map(({ icon: Icon, value, label, color, bg }) => (
              <motion.div
                key={label}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-border bg-surface p-4 flex flex-col items-center gap-2 text-center"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xl font-bold text-text-primary leading-none">{value}</p>
                <p className="text-2xs text-text-muted">{label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Top skills */}
          <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-6 py-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-text-muted" />
              <p className="text-sm font-semibold text-text-primary">Top skills</p>
            </div>
            <div className="space-y-4">
              {topSkills.length === 0 ? (
                <p className="text-xs text-text-muted py-2">Complete challenges to build skill scores.</p>
              ) : topSkills.map((skill, i) => (
                <div key={skill.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-text-secondary">{skill.skill}</span>
                    <span className="text-xs font-semibold text-text-primary">{skill.level}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${SKILL_COLORS[i]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-text-muted" />
                <p className="text-sm font-semibold text-text-primary">Badges</p>
              </div>
              <Badge color="default">{data.badges.length} earned</Badge>
            </div>
            {data.badges.length === 0 ? (
              <p className="text-xs text-text-muted py-2">No badges yet. Complete analyses and challenges to earn them.</p>
            ) : (
              <div className="space-y-3">
                {data.badges.map((badge, i) => {
                  const entry = BADGE_ICONS[badge.icon] ?? { Icon: Award, color: 'text-primary', bg: 'bg-primary/10' }
                  const { Icon, color, bg } = entry
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary">{badge.name}</p>
                        <p className="text-xs text-text-muted">{badge.description}</p>
                      </div>
                      {badge.earnedAt && (
                        <p className="text-xs text-text-muted shrink-0">{formatDate(badge.earnedAt)}</p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}
