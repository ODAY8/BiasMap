import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BarChart2, FileText } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getAdminAnalytics, getAdminUsers, getAdminAnalyses, getAdminFeedback } from '@/services/adminService'
import { useUser } from '@/context/UserContext'
import { formatDate } from '@/utils'
import Tabs from '@/components/ui/Tabs'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } }

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'users',    label: 'Users'    },
  { value: 'analyses', label: 'Analyses' },
  { value: 'feedback', label: 'Feedback' },
]

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div variants={up}>
      <Card className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-text-primary">{value?.toLocaleString() ?? '—'}</p>
          <p className="text-xs text-text-muted">{label}</p>
        </div>
      </Card>
    </motion.div>
  )
}

function OverviewTab() {
  const { data, loading, error, refetch } = useAsync(getAdminAnalytics)
  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Card key={i}><Skeleton lines={2} /></Card>)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard icon={Users}    label="Total users"       value={data?.total_users}         color="bg-primary/10 text-primary" />
      <StatCard icon={FileText} label="Total analyses"    value={data?.total_analyses}      color="bg-accent/10 text-accent"   />
      <StatCard icon={BarChart2} label="Quiz attempts"    value={data?.total_quiz_attempts} color="bg-success/10 text-success" />
    </motion.div>
  )
}

function UsersTab() {
  const { data, loading, error, refetch } = useAsync(getAdminUsers)
  const users = data?.users ?? data ?? []
  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Card key={i}><Skeleton lines={1} /></Card>)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-5 py-3 rounded-xl border border-border bg-surface">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{u.name}</p>
            <p className="text-xs text-text-muted">{u.email || 'Guest'}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {u.is_guest && <Badge color="warning">Guest</Badge>}
            <Badge color={u.role === 'admin' ? 'danger' : 'default'}>{u.role}</Badge>
            <span className="text-xs text-text-muted">{formatDate(u.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalysesTab() {
  const { data, loading, error, refetch } = useAsync(getAdminAnalyses)
  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Card key={i}><Skeleton lines={1} /></Card>)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  return (
    <div className="space-y-2">
      {(data ?? []).map((a) => (
        <div key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-5 py-3 rounded-xl border border-border bg-surface">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-muted truncate">{a.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color="info">{a.source_type}</Badge>
            {a.scores?.bias_score !== undefined && (
              <span className="text-xs text-text-muted">Bias: {a.scores.bias_score}</span>
            )}
            <span className="text-xs text-text-muted">{formatDate(a.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function FeedbackTab() {
  const { data, loading, error, refetch } = useAsync(getAdminFeedback)
  if (loading) return <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Card key={i}><Skeleton lines={2} /></Card>)}</div>
  if (error) return <ErrorState message={error} onRetry={refetch} />
  return (
    <div className="space-y-2">
      {(data ?? []).length === 0 && <p className="text-sm text-text-muted py-8 text-center">No feedback yet</p>}
      {(data ?? []).map((f) => (
        <div key={f.id} className="px-5 py-4 rounded-xl border border-border bg-surface space-y-1">
          <div className="flex items-center gap-2">
            <Badge color={f.category === 'bug' ? 'danger' : f.category === 'suggestion' ? 'info' : 'default'}>
              {f.category}
            </Badge>
            <span className="text-xs text-text-muted">{formatDate(f.created_at)}</span>
          </div>
          <p className="text-sm text-text-secondary">{f.message}</p>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  const { user } = useUser()
  const [tab, setTab] = useState('overview')

  if (user?.role !== 'admin') {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-text-primary mb-1">Access denied</p>
        <p className="text-xs text-text-muted">This page is only accessible to admins.</p>
      </div>
    )
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={up}>
        <p className="text-text-muted text-xs mb-1">Admin panel</p>
        <h2 className="text-2xl font-bold text-text-primary">Dashboard</h2>
      </motion.div>
      <motion.div variants={up}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </motion.div>
      <motion.div variants={up}>
        {tab === 'overview' && <OverviewTab />}
        {tab === 'users'    && <UsersTab    />}
        {tab === 'analyses' && <AnalysesTab />}
        {tab === 'feedback' && <FeedbackTab />}
      </motion.div>
    </motion.div>
  )
}
