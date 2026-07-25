import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Clock, ArrowLeft, ChevronRight, Lock, Zap } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getLearningModules, getLessonById } from '@/services/learningService'
// Backend uses integer topic IDs; getLessonById(topicId) fetches topic + its lessons
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'

const up = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }

const DIFF_COLOR = { Beginner: 'success', Intermediate: 'warning', Advanced: 'danger' }
const DIFF_ORDER = ['Beginner', 'Intermediate', 'Advanced']

function ModuleRow({ module, index, onSelect, isLocked }) {
  return (
    <motion.div variants={up}>
      <motion.button
        onClick={() => !isLocked && onSelect(module.id)}
        whileHover={isLocked ? {} : { x: 4 }}
        whileTap={isLocked ? {} : { scale: 0.99 }}
        className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors
          ${module.completed
            ? 'border-success/20 bg-success/4'
            : isLocked
            ? 'border-border bg-surface opacity-50 cursor-not-allowed'
            : 'border-border bg-surface hover:border-primary/25 cursor-pointer'
          }`}
      >
        {/* Status indicator */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
          ${module.completed ? 'bg-success/15 text-success' : isLocked ? 'bg-surface-2 text-text-muted' : 'bg-primary/10 text-primary'}`}
        >
          {module.completed
            ? <CheckCircle className="w-4 h-4" />
            : isLocked
            ? <Lock className="w-3.5 h-3.5" />
            : <span>{index + 1}</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-text-primary">{module.title}</p>
            {module.completed && <Badge color="success" className="text-2xs">Done</Badge>}
          </div>
          <p className="text-xs text-text-muted line-clamp-1">{module.description}</p>
        </div>

        <div className="shrink-0 flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{module.duration}m</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-warning" />{module.xp}</span>
          {!isLocked && <ChevronRight className="w-4 h-4 text-text-muted" />}
        </div>
      </motion.button>
    </motion.div>
  )
}

function LessonDetail({ id, onBack }) {
  const { data: lesson, loading, error, refetch } = useAsync(() => getLessonById(id), [id])
  const toast = useToast()

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Skeleton className="h-8 w-1/2" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={4} /></div>
      ))}
    </div>
  )
  if (error) return <ErrorState message={error} onRetry={refetch} />

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-2xl mx-auto space-y-6">
      {/* Back + title */}
      <motion.div variants={up} className="flex items-start gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={onBack}>
          Back
        </Button>
      </motion.div>

      <motion.div variants={up}>
        <div className="flex items-center gap-2 mb-2">
          <Badge color={DIFF_COLOR[lesson.difficulty]}>{lesson.difficulty}</Badge>
          <span className="text-xs text-text-muted">{lesson.duration} min · {lesson.xp} XP</span>
        </div>
        <h2 className="text-3xl font-bold text-text-primary leading-tight">{lesson.title}</h2>
        <p className="text-text-muted mt-2 text-sm">{lesson.description}</p>
      </motion.div>

      {/* Objectives */}
      <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-6 py-5">
        <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-4">What you'll learn</p>
        <ul className="space-y-2.5">
          {lesson.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-secondary">
              <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
              {obj}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Sections */}
      {lesson.sections.map((section, i) => (
        <motion.div key={i} variants={up} className="rounded-2xl border border-border bg-surface px-6 py-5">
          <h3 className="text-base font-semibold text-text-primary mb-3">{section.title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{section.content}</p>
        </motion.div>
      ))}

      {/* Examples */}
      <motion.div variants={up} className="rounded-2xl border border-border bg-surface px-6 py-5">
        <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-4">Examples</p>
        <div className="space-y-3">
          {lesson.examples.map((ex, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-danger/5 border border-danger/15">
                <p className="text-2xs font-semibold text-danger uppercase tracking-widest mb-2">Biased</p>
                <p className="text-sm text-text-secondary leading-relaxed">"{ex.biased}"</p>
              </div>
              <div className="p-4 rounded-xl bg-success/5 border border-success/15">
                <p className="text-2xs font-semibold text-success uppercase tracking-widest mb-2">Neutral</p>
                <p className="text-sm text-text-secondary leading-relaxed">"{ex.neutral}"</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={up}>
        <Button className="w-full" size="lg" onClick={() => {
          toast.success('Lesson complete!', `+${lesson.xp} XP earned`)
          onBack()
        }}>
          Mark complete · +{lesson.xp} XP
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default function LearnPage() {
  const [selectedId, setSelectedId] = useState(null)
  const { data: modules, loading, error, refetch } = useAsync(getLearningModules)

  if (selectedId) return <LessonDetail id={selectedId} onBack={() => setSelectedId(null)} />

  const completed = modules?.filter((m) => m.completed).length ?? 0
  const total = modules?.length ?? 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">

      {/* Header — typographic, no card */}
      <motion.div variants={up} className="flex items-end justify-between">
        <div>
          <p className="text-text-muted text-sm mb-1">Media literacy curriculum</p>
          <h2 className="text-2xl font-bold text-text-primary">
            {completed === 0 ? 'Start learning' : `${completed} of ${total} complete`}
          </h2>
        </div>
        {modules && completed > 0 && (
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{Math.round((completed / total) * 100)}%</p>
            <p className="text-xs text-text-muted">progress</p>
          </div>
        )}
      </motion.div>

      {/* Progress track */}
      {modules && (
        <motion.div variants={up} className="flex gap-1">
          {modules.map((m, i) => (
            <div
              key={m.id}
              className={`flex-1 h-1 rounded-full transition-colors ${m.completed ? 'bg-success' : 'bg-surface-2'}`}
            />
          ))}
        </motion.div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5"><Skeleton lines={2} /></div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {modules && (
        <div className="space-y-8">
          {DIFF_ORDER.map((level) => {
            const group = modules.filter((m) => m.difficulty === level)
            if (!group.length) return null
            const groupCompleted = group.filter((m) => m.completed).length
            return (
              <motion.div key={level} variants={up}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge color={DIFF_COLOR[level]}>{level}</Badge>
                    <span className="text-xs text-text-muted">{groupCompleted}/{group.length} done</span>
                  </div>
                </div>
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                  {group.map((m, i) => (
                    <ModuleRow
                      key={m.id}
                      module={m}
                      index={i}
                      onSelect={setSelectedId}
                      isLocked={false}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
