import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, RotateCcw } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getSettings, updateSettings } from '@/services/settingsService'
import { resetOnboarding } from '@/components/ui/SplashScreen'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Toggle from '@/components/ui/Toggle'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

function SectionLabel({ children }) {
  return (
    <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-4 mt-8 first:mt-0">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="border-t border-border my-1" />
}

export default function SettingsPage() {
  const { data: initial, loading, error, refetch } = useAsync(getSettings)
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  const set = (path, value) => {
    setForm((prev) => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const toast = useToast()

  const handleSave = async () => {
    setSaving(true)
    await updateSettings(form)
    setSaving(false); setSaved(true)
    toast.success('Settings saved')
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div className="max-w-lg space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!form) return null

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-lg space-y-1">

      {/* Appearance */}
      <motion.div variants={up}>
        <SectionLabel>Appearance</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <div className="px-5 py-4">
            <Select label="Theme" value={form.theme} onChange={(e) => set('theme', e.target.value)}
              options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'system', label: 'System' }]} />
          </div>
          <div className="px-5 py-4">
            <Select label="Font scale" value={form.fontScale} onChange={(e) => set('fontScale', e.target.value)}
              options={[{ value: 'small', label: 'Small' }, { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }]} />
          </div>
          <div className="px-5 py-4">
            <Toggle label="Animations" description="Smooth transitions and motion effects"
              checked={form.animations} onChange={(v) => set('animations', v)} />
          </div>
        </div>
      </motion.div>

      {/* Language */}
      <motion.div variants={up}>
        <SectionLabel>Language</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4">
          <Select label="Interface language" value={form.language} onChange={(e) => set('language', e.target.value)}
            options={[
              { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },  { value: 'de', label: 'German' },
            ]} />
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={up}>
        <SectionLabel>Notifications</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <div className="px-5 py-4">
            <Toggle label="Daily challenge" description="Remind me to complete today's challenge"
              checked={form.notifications.dailyChallenge} onChange={(v) => set('notifications.dailyChallenge', v)} />
          </div>
          <div className="px-5 py-4">
            <Toggle label="Weekly report" description="Summary of my weekly activity"
              checked={form.notifications.weeklyReport} onChange={(v) => set('notifications.weeklyReport', v)} />
          </div>
          <div className="px-5 py-4">
            <Toggle label="New lessons" description="Notify when new modules are available"
              checked={form.notifications.newLessons} onChange={(v) => set('notifications.newLessons', v)} />
          </div>
        </div>
      </motion.div>

      {/* Analysis defaults */}
      <motion.div variants={up}>
        <SectionLabel>Analysis defaults</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <div className="px-5 py-4">
            <Select label="Default content type" value={form.analysisDefaults.contentType}
              onChange={(e) => set('analysisDefaults.contentType', e.target.value)}
              options={[
                { value: 'news', label: 'News article' }, { value: 'opinion', label: 'Opinion' },
                { value: 'social', label: 'Social media' }, { value: 'academic', label: 'Academic' },
              ]} />
          </div>
          <div className="px-5 py-4">
            <Select label="Default depth" value={form.analysisDefaults.analysisDepth}
              onChange={(e) => set('analysisDefaults.analysisDepth', e.target.value)}
              options={[
                { value: 'quick', label: 'Quick scan' }, { value: 'detailed', label: 'Detailed' },
                { value: 'deep', label: 'Deep dive' },
              ]} />
          </div>
          <div className="px-5 py-4">
            <Toggle label="Auto-highlight bias" description="Highlight detected bias in results automatically"
              checked={form.analysisDefaults.autoHighlight} onChange={(v) => set('analysisDefaults.autoHighlight', v)} />
          </div>
        </div>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={up}>
        <SectionLabel>Privacy</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface divide-y divide-border overflow-hidden">
          <div className="px-5 py-4">
            <Toggle label="Save analysis history" description="Store past analyses for future reference"
              checked={form.privacy.saveHistory} onChange={(v) => set('privacy.saveHistory', v)} />
          </div>
          <div className="px-5 py-4">
            <Toggle label="Share anonymous data" description="Help improve BiasMap with anonymized usage data"
              checked={form.privacy.shareAnonymousData} onChange={(v) => set('privacy.shareAnonymousData', v)} />
          </div>
        </div>
      </motion.div>

      {/* Onboarding */}
      <motion.div variants={up}>
        <SectionLabel>Onboarding</SectionLabel>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Replay intro tour</p>
            <p className="text-xs text-text-muted mt-0.5">Show the onboarding screen on next load</p>
          </div>
          <Button variant="secondary" size="sm" icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => { resetOnboarding(); window.location.reload() }}>
            Reset
          </Button>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div variants={up} className="pt-4">
        <Button onClick={handleSave} loading={saving} className="w-full"
          icon={saved ? <CheckCircle className="w-4 h-4" /> : undefined}
          style={saved ? { background: 'var(--color-success)' } : {}}>
          {saved ? 'Saved' : 'Save changes'}
        </Button>
      </motion.div>

    </motion.div>
  )
}
