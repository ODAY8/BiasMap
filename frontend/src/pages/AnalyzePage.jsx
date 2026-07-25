import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ChevronDown, HelpCircle, Search } from 'lucide-react'
import { analyzeContent } from '@/services/analysisService'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import BiasScoreRing from '@/components/charts/BiasScoreRing'
import { useToast } from '@/context/ToastContext'

const BIAS_COLORS = {
  'Loaded Language': { bg: 'bg-warning/8 border-warning/20', badge: 'warning', dot: 'bg-warning' },
  Propaganda: { bg: 'bg-danger/8 border-danger/20', badge: 'danger', dot: 'bg-danger' },
  'Framing Bias': { bg: 'bg-danger/8 border-danger/20', badge: 'danger', dot: 'bg-danger' },
  'Vague Attribution': { bg: 'bg-info/8 border-info/20', badge: 'info', dot: 'bg-info' },
  Emotion: { bg: 'bg-accent/8 border-accent/20', badge: 'accent', dot: 'bg-accent' },
}

function HighlightRow({ item }) {
  const [open, setOpen] = useState(false)
  const style = BIAS_COLORS[item.type] || { bg: 'bg-surface-2 border-border', badge: 'default', dot: 'bg-text-muted' }

  return (
    <motion.div layout className={`rounded-xl border p-4 ${style.bg}`}>
      <button className="w-full text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
          <div className="min-w-0 flex-1">
            <Badge color={style.badge} className="mb-1.5 text-2xs">{item.type}</Badge>
            <p className="text-sm leading-relaxed text-text-primary">“{item.sentence}”</p>
          </div>
          <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="ml-4 mt-4 space-y-3 border-l border-border pl-3">
          <div>
            <p className="mb-1 text-2xs font-semibold uppercase tracking-widest text-text-muted">Why it matters</p>
            <p className="text-sm text-text-secondary">{item.explanation}</p>
          </div>
          <div>
            <p className="mb-1 text-2xs font-semibold uppercase tracking-widest text-text-muted">Ask yourself</p>
            <p className="text-sm text-text-secondary">{item.impact}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function Score({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}<span className="text-sm text-text-muted">/100</span></p>
    </div>
  )
}

export default function AnalyzePage() {
  const toast = useToast()
  const [text, setText] = useState('')
  const [contentType, setContentType] = useState('news')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await analyzeContent({ text, contentType })
      setResult(data)
      toast.success('Analysis complete', `${data.highlights.length} signals returned by the server`)
    } catch (err) {
      const message = err.message || 'Analysis failed.'
      setError(message)
      toast.error('Analysis failed', message)
    } finally {
      setLoading(false)
    }
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface focus-within:border-primary/30">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste an article, speech, social post, or any text…"
          rows={7}
          className="w-full resize-none bg-transparent px-6 pb-3 pt-5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/40 px-4 py-3">
          <Select
            value={contentType}
            onChange={(event) => setContentType(event.target.value)}
            options={[
              { value: 'news', label: 'News' },
              { value: 'opinion', label: 'Opinion' },
              { value: 'social', label: 'Social' },
              { value: 'academic', label: 'Academic' },
            ]}
            className="w-28 text-xs"
          />
          <div className="flex items-center gap-3">
            {wordCount > 0 && <span className="text-xs text-text-muted">{wordCount} words</span>}
            <Button onClick={handleAnalyze} loading={loading} disabled={!text.trim()} size="sm" icon={<Search className="h-3.5 w-3.5" />}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/8 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <div className="space-y-4"><div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={3} /></div></div>}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center gap-2"><Badge color="success">Server analysis</Badge></div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-5">
              <p className="text-2xs font-semibold uppercase tracking-widest text-text-muted">Bias score</p>
              <BiasScoreRing score={result.biasScore} size={80} />
            </div>
            <Score label="Claim confidence" value={result.scores.confidence_score} />
            <Score label="Emotional intensity" value={result.scores.emotional_intensity} />
            <Score label="Perspective balance" value={result.scores.perspective_balance} />
          </div>

          <div className="rounded-2xl border border-border bg-surface px-6 py-5">
            <p className="mb-2 text-2xs font-semibold uppercase tracking-widest text-text-muted">Summary</p>
            <p className="text-sm text-text-secondary">{result.summary}</p>
          </div>

          <section>
            <div className="mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /><p className="text-sm font-semibold text-text-primary">{result.highlights.length} signals detected</p></div>
            <div className="space-y-2">{result.highlights.map((item, index) => <HighlightRow key={index} item={item} />)}</div>
          </section>

          {result.reflectionQuestions.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface px-6 py-5">
              <div className="mb-4 flex items-center gap-2"><HelpCircle className="h-4 w-4 text-text-muted" /><p className="text-sm font-semibold text-text-primary">Questions from the analysis</p></div>
              <ol className="space-y-3">{result.reflectionQuestions.map((question, index) => <li key={index} className="flex gap-3 text-sm text-text-secondary"><span className="font-bold text-primary">{index + 1}.</span>{question}</li>)}</ol>
            </section>
          )}
        </motion.div>
      )}
    </div>
  )
}
