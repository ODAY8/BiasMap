import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ShieldAlert } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getPropagandaTechniques } from '@/services/propagandaService'
import SearchInput from '@/components/ui/SearchInput'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Badge from '@/components/ui/Badge'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } }

function TechniqueCard({ technique }) {
  const [open, setOpen] = useState(false)
  const examples = Array.isArray(technique.real_examples) ? technique.real_examples : []

  return (
    <motion.div variants={up} layout className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center gap-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-danger" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">{technique.name}</p>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{technique.definition}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">

              <div>
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1.5">Definition</p>
                <p className="text-sm text-text-secondary leading-relaxed">{technique.definition}</p>
              </div>

              <div>
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1.5">Psychology</p>
                <p className="text-sm text-text-secondary leading-relaxed">{technique.psychology}</p>
              </div>

              <div>
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1.5">How to recognize it</p>
                <p className="text-sm text-text-secondary leading-relaxed">{technique.how_to_recognize}</p>
              </div>

              <div>
                <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-1.5">How to protect yourself</p>
                <p className="text-sm text-text-secondary leading-relaxed">{technique.how_to_avoid}</p>
              </div>

              {examples.length > 0 && (
                <div>
                  <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-2">Real-world examples</p>
                  <div className="space-y-1.5">
                    {examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-danger font-bold shrink-0 mt-0.5">·</span>
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function PropagandaPage() {
  const { data: techniques, loading, error, refetch } = useAsync(getPropagandaTechniques)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!techniques) return []
    if (!query) return techniques
    const q = query.toLowerCase()
    return techniques.filter((t) =>
      t.name.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    )
  }, [techniques, query])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      <motion.div variants={up} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-text-muted text-xs mb-1">Reference library</p>
          <h2 className="text-2xl font-bold text-text-primary">Propaganda Techniques</h2>
        </div>
        {techniques && (
          <Badge color="danger">{techniques.length} techniques</Badge>
        )}
      </motion.div>

      <motion.div variants={up}>
        <SearchInput value={query} onChange={setQuery} placeholder="Search techniques…" />
      </motion.div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && filtered.length === 0 && query && (
        <motion.div variants={up} className="py-16 text-center">
          <p className="text-sm text-text-muted">No techniques matched "{query}"</p>
        </motion.div>
      )}

      <motion.div variants={stagger} className="space-y-2">
        {filtered.map((t) => (
          <TechniqueCard key={t.id} technique={t} />
        ))}
      </motion.div>
    </motion.div>
  )
}
