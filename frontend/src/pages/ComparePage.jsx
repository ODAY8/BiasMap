import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ArrowLeftRight } from 'lucide-react'
import { compareArticles } from '@/services/comparisonService'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import EmotionChart from '@/components/charts/EmotionChart'
import Skeleton from '@/components/ui/Skeleton'

const up = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }

function ArticleInput({ index, value, onChange }) {
  const labels = ['Source A', 'Source B']
  return (
    <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">{labels[index]}</span>
        {value.trim() && (
          <span className="text-xs text-text-muted">{value.trim().split(/\s+/).length} words</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Paste ${labels[index].toLowerCase()} here…`}
        rows={10}
        className="flex-1 w-full bg-transparent px-5 py-4 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none leading-relaxed"
      />
    </div>
  )
}

function DiffRow({ label, a, b }) {
  const same = a === b
  return (
    <div className="py-3 border-b border-border last:border-0 space-y-2 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4 sm:items-start">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider sm:col-span-1 sm:pt-0.5">{label}</p>
      <div className="sm:col-span-2">
        <p className="text-xs text-text-muted sm:hidden mb-0.5">Source A</p>
        <p className="text-sm text-text-primary">{a}</p>
      </div>
      <div className="sm:col-span-2">
        <p className="text-xs text-text-muted sm:hidden mb-0.5">Source B</p>
        <p className={`text-sm ${same ? 'text-text-muted' : 'text-text-primary'}`}>{b}</p>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [articles, setArticles] = useState(['', ''])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canCompare = articles[0].trim().length > 20 && articles[1].trim().length > 20

  const toast = useToast()

  const handleCompare = async () => {
    setLoading(true); setError(null); setResult(null)
    try {
      setResult(await compareArticles(articles))
      toast.success('Comparison ready')
    } catch (err) {
      setError(err.message || 'Comparison failed.')
      toast.error('Comparison failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  const update = (i, val) => {
    const next = [...articles]; next[i] = val; setArticles(next)
  }

  return (
    <div className="space-y-6">

      {/* ── Split editor ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch">
          <ArticleInput index={0} value={articles[0]} onChange={(v) => update(0, v)} />

          {/* Divider with action */}
          <div className="flex sm:flex-col items-center justify-center gap-3 shrink-0">
            <div className="sm:w-px sm:flex-1 h-px sm:h-auto w-full bg-border" />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleCompare}
                loading={loading}
                disabled={!canCompare}
                size="sm"
                icon={<ArrowLeftRight className="w-3.5 h-3.5" />}
                className="rounded-full px-3"
              >
                {loading ? '…' : 'Compare'}
              </Button>
            </motion.div>
            <div className="sm:w-px sm:flex-1 h-px sm:h-auto w-full bg-border" />
          </div>

          <ArticleInput index={1} value={articles[1]} onChange={(v) => update(1, v)} />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-danger/8 border border-danger/20"
            >
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Skeleton lines={6} />
        </div>
      )}

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">

            {/* Column headers — hidden on mobile, shown on sm+ */}
            <motion.div variants={up} className="hidden sm:grid grid-cols-5 gap-4 px-1">
              <div className="col-span-1" />
              {result.comparison.map((a, i) => (
                <div key={i} className="col-span-2">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">
                    {['Source A', 'Source B'][i]}
                  </p>
                  <p className="text-sm font-semibold text-text-primary">{a.title}</p>
                </div>
              ))}
            </motion.div>

            {/* Diff table — stacked on mobile */}
            <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-4 sm:px-6 py-2">
              <DiffRow label="Framing"
                a={result.comparison[0].framing}
                b={result.comparison[1].framing}
              />
              <DiffRow label="Tone"
                a={result.comparison[0].tone}
                b={result.comparison[1].tone}
              />
              <DiffRow label="Dominant emotion"
                a={Object.entries(result.comparison[0].emotion).sort((x,y)=>y[1]-x[1])[0]?.[0] ?? '—'}
                b={Object.entries(result.comparison[1].emotion).sort((x,y)=>y[1]-x[1])[0]?.[0] ?? '—'}
              />
              <DiffRow label="Key omissions"
                a={result.comparison[0].stakeholders?.join(', ') || '—'}
                b={result.comparison[1].stakeholders?.join(', ') || '—'}
              />
            </motion.div>

            {/* Emotion charts side by side */}
            <motion.div variants={up} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.comparison.map((a, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface px-6 py-5">
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1">
                    {['Source A', 'Source B'][i]} — emotional profile
                  </p>
                  <EmotionChart data={a.emotion} />
                </div>
              ))}
            </motion.div>

            {/* Summaries */}
            <motion.div variants={up} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {result.comparison.map((a, i) => (
                <div key={i} className="rounded-2xl border border-border bg-surface px-6 py-5">
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                    {['Source A', 'Source B'][i]} — summary
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">{a.summary}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(a.stakeholders ?? []).map((s) => <Badge key={s} color="accent">{s}</Badge>)}
                  </div>
                </div>
              ))}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
