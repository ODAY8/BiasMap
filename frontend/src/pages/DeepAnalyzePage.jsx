import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import {
  analyzeViewpoints, analyzeEmotion, rewriteHeadline,
  segmentClaims, verifyClaims, analyzeSourceQuality,
} from '@/services/deepAnalysisService'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Tabs from '@/components/ui/Tabs'
import Skeleton from '@/components/ui/Skeleton'

const TABS = [
  { value: 'viewpoints',     label: 'Viewpoints'      },
  { value: 'emotion',        label: 'Emotion'         },
  { value: 'headline',       label: 'Rewrite Headline'},
  { value: 'claims',         label: 'Segment Claims'  },
  { value: 'verify',         label: 'Verify Claims'   },
  { value: 'source',         label: 'Source Quality'  },
]

// ── Result renderers ──────────────────────────────────────────────

function ViewpointsResult({ data }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary leading-relaxed">{data.summary}</p>
      <div className="space-y-2">
        {data.viewpoints.map((v, i) => (
          <div key={i} className={`px-4 py-3 rounded-xl border text-sm
            ${v.present ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Badge color={v.present ? 'success' : 'warning'}>{v.category}</Badge>
              <span className="text-xs text-text-muted">{v.present ? 'Present' : 'Missing'}</span>
            </div>
            {v.present && v.evidence && <p className="text-xs text-text-secondary">{v.evidence}</p>}
            {!v.present && v.missing_perspective && <p className="text-xs text-text-secondary">{v.missing_perspective}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmotionResult({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Dominant emotion:</span>
        <Badge color="accent">{data.dominant_emotion}</Badge>
      </div>
      <p className="text-sm text-text-secondary">{data.summary}</p>
      <div className="space-y-2">
        {Object.entries(data.emotions).map(([emotion, val]) => (
          <div key={emotion}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-secondary capitalize">{emotion}</span>
              <span className="text-xs text-text-muted">{val.score}</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${val.score}%` }} />
            </div>
            {val.examples.length > 0 && (
              <p className="text-2xs text-text-muted mt-1 italic">e.g. "{val.examples[0]}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeadlineResult({ data }) {
  return (
    <div className="space-y-3">
      <div className="px-4 py-3 rounded-xl border border-border bg-surface-2">
        <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1">Original</p>
        <p className="text-sm text-text-primary italic">"{data.original}"</p>
      </div>
      {Object.entries(data.variants).map(([style, val]) => (
        <div key={style} className="px-4 py-3 rounded-xl border border-border bg-surface">
          <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1 capitalize">{style}</p>
          <p className="text-sm text-text-primary mb-2">"{val.headline}"</p>
          <p className="text-xs text-text-secondary">{val.explanation}</p>
        </div>
      ))}
    </div>
  )
}

function ClaimsResult({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(data.summary).map(([type, count]) => count > 0 && (
          <Badge key={type} color="default">{count} {type}</Badge>
        ))}
      </div>
      <div className="space-y-2">
        {data.claims.map((c, i) => (
          <div key={i} className="px-4 py-3 rounded-xl border border-border bg-surface">
            <Badge color="info" className="mb-2">{c.type}</Badge>
            <p className="text-sm text-text-primary mb-1">"{c.text}"</p>
            <p className="text-xs text-text-secondary">{c.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VerifyResult({ data }) {
  return (
    <div className="space-y-3">
      {data.claims.map((c, i) => (
        <div key={i} className="px-4 py-4 rounded-xl border border-border bg-surface space-y-3">
          <p className="text-sm font-medium text-text-primary">"{c.claim_text}"</p>
          {c.verification_guidance.map((g, j) => (
            <div key={j} className="pl-3 border-l border-border space-y-0.5">
              <Badge color="primary" className="mb-1">{g.source_type}</Badge>
              <p className="text-xs text-text-secondary">{g.why}</p>
              {g.caution && <p className="text-xs text-warning">⚠ {g.caution}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function SourceResult({ data }) {
  return (
    <div className="space-y-3">
      <div className="px-4 py-3 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Overall guidance</p>
        <p className="text-sm text-text-secondary">{data.overall_guidance}</p>
      </div>
      {data.indicators.map((ind, i) => (
        <div key={i} className="px-4 py-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-primary capitalize">{ind.name.replace(/_/g, ' ')}</span>
            <Badge color="default">{ind.value}</Badge>
          </div>
          <p className="text-xs text-text-secondary mb-1">{ind.meaning}</p>
          <p className="text-xs text-text-muted italic">Q: {ind.reader_question}</p>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function DeepAnalyzePage() {
  const toast = useToast()
  const [tab, setTab] = useState('viewpoints')
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isHeadlineTab = tab === 'headline'
  const placeholder = isHeadlineTab
    ? 'Paste a headline…'
    : 'Paste article text…'

  const handleRun = async () => {
    const val = text.trim()
    if (!val) return
    setLoading(true); setError(null); setResult(null)
    try {
      let data
      if (tab === 'viewpoints')  data = await analyzeViewpoints(val)
      else if (tab === 'emotion') data = await analyzeEmotion(val)
      else if (tab === 'headline') data = await rewriteHeadline(val)
      else if (tab === 'claims')  data = await segmentClaims(val)
      else if (tab === 'verify')  data = await verifyClaims(val)
      else if (tab === 'source')  data = await analyzeSourceQuality(val)
      setResult(data)
      toast.success('Analysis complete')
    } catch (err) {
      setError(err.message)
      toast.error('Analysis failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reset result when tab changes
  const handleTabChange = (val) => { setTab(val); setResult(null); setError(null) }

  return (
    <div className="space-y-5">

      <div>
        <p className="text-text-muted text-xs mb-1">Advanced tools</p>
        <h2 className="text-2xl font-bold text-text-primary">Deep Analysis</h2>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={handleTabChange} />

      {/* Input */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden focus-within:border-primary/30">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={isHeadlineTab ? 2 : 6}
          className="w-full resize-none bg-transparent px-6 pb-3 pt-5 text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface-2/40 px-4 py-3">
          <Button onClick={handleRun} loading={loading} disabled={!text.trim()} size="sm">
            {loading ? 'Analyzing…' : 'Run'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/8 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
            <p className="text-sm text-danger">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <Skeleton lines={4} />
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-surface px-6 py-5">
          {tab === 'viewpoints' && <ViewpointsResult data={result} />}
          {tab === 'emotion'    && <EmotionResult    data={result} />}
          {tab === 'headline'   && <HeadlineResult   data={result} />}
          {tab === 'claims'     && <ClaimsResult     data={result} />}
          {tab === 'verify'     && <VerifyResult     data={result} />}
          {tab === 'source'     && <SourceResult     data={result} />}
        </motion.div>
      )}
    </div>
  )
}
