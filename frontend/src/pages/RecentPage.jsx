import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, Search, FileText, ArrowRight } from 'lucide-react'
import { formatDate } from '@/utils'
import { useAsync } from '@/hooks/useAsync'
import { getRecentAnalyses } from '@/services/analysisService'
import { useUser } from '@/context/UserContext'
import Badge from '@/components/ui/Badge'
import SearchInput from '@/components/ui/SearchInput'
import FilterChips from '@/components/ui/FilterChips'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import GuestPrompt from '@/components/ui/GuestPrompt'
import BiasScoreRing from '@/components/charts/BiasScoreRing'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

const TYPE_COLORS = { News: 'info', Social: 'warning', Speech: 'success', Blog: 'accent', Caption: 'default' }

const FILTER_OPTIONS = [
  { value: 'all',     label: 'All'     },
  { value: 'News',    label: 'News'    },
  { value: 'Social',  label: 'Social'  },
  { value: 'Speech',  label: 'Speech'  },
  { value: 'Blog',    label: 'Blog'    },
  { value: 'Caption', label: 'Caption' },
]

export default function RecentPage() {
  const navigate = useNavigate()
  const { isGuest } = useUser()
  const { data, loading, error, refetch } = useAsync(getRecentAnalyses)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (!data) return []
    return data.filter((item) => {
      const matchType  = filter === 'all' || item.contentType === filter
      const matchQuery = !query || item.title.toLowerCase().includes(query.toLowerCase())
      return matchType && matchQuery
    })
  }, [data, query, filter])

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={up} className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-text-muted text-xs mb-1">Your analysis history</p>
          <h2 className="text-2xl font-bold text-text-primary">
            {loading ? '—' : `${data?.length ?? 0} analyses`}
          </h2>
        </div>
        <motion.button
          onClick={() => navigate('/analyze')}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-glow-primary hover:bg-primary-hover transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          New analysis
        </motion.button>
      </motion.div>

      {/* Guest prompt */}
      {isGuest && (
        <motion.div variants={up}>
          <GuestPrompt feature="analysis history" />
        </motion.div>
      )}

      {/* Search + filters */}
      <motion.div variants={up} className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search analyses…"
          className="flex-1"
        />
        <FilterChips
          options={FILTER_OPTIONS}
          active={filter}
          onChange={(v) => setFilter(v ?? 'all')}
        />
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <motion.div variants={up} className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <FileText className="w-6 h-6 text-text-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">
              {query ? 'No results found' : 'No analyses yet'}
            </p>
            <p className="text-xs text-text-muted">
              {query ? `Nothing matched "${query}"` : 'Start by analyzing an article'}
            </p>
          </div>
          {!query && (
            <button
              onClick={() => navigate('/analyze')}
              className="text-sm text-primary hover:underline"
            >
              Analyze something →
            </button>
          )}
        </motion.div>
      )}

      {/* List */}
      <AnimatePresence mode="popLayout">
        {!loading && filtered.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={up}
                layout
                onClick={() => navigate('/analyze')}
                className="group"
              >
                <motion.div
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-5 px-5 py-4 rounded-2xl border border-border bg-surface hover:border-primary/20 transition-colors cursor-pointer"
                >
                  {/* Score ring */}
                  <div className="shrink-0">
                    <BiasScoreRing score={item.biasScore} size={52} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={TYPE_COLORS[item.contentType] || 'default'} className="text-2xs">
                        {item.contentType}
                      </Badge>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />{formatDate(item.date)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{item.preview}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
