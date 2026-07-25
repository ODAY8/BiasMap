import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Award, RotateCcw, Zap, Trophy } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getDailyChallenge, submitChallenge } from '@/services/challengeService'
import { useUser } from '@/context/UserContext'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import GuestPrompt from '@/components/ui/GuestPrompt'
import clsx from 'clsx'

function ResultScreen({ result, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-md mx-auto text-center space-y-8 py-12"
    >
      <div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6
            ${result.correct ? 'bg-success/10' : 'bg-danger/10'}`}
        >
          {result.correct
            ? <Award className="w-10 h-10 text-success" />
            : <XCircle className="w-10 h-10 text-danger" />}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`text-3xl font-bold ${result.correct ? 'text-success' : 'text-danger'}`}
        >
          {result.correct ? 'Correct!' : 'Incorrect'}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-text-muted text-sm mt-2"
        >
          The answer was <span className="font-semibold text-text-primary">{result.selectedAnswer}</span>
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 text-warning" />
        <p className="text-2xl font-bold text-warning">+{result.xp} XP</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <Button variant="secondary" onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
          Try again
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default function ChallengePage() {
  const { data: challenge, loading, error, refetch } = useAsync(getDailyChallenge)
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { isGuest } = useUser()
  const toast = useToast()

  const handleSubmit = async () => {
    if (!challenge || selectedIndex === null) return
    setSubmitting(true)
    try {
      const q = challenge.questions[0]
      const selectedOption = q.options[selectedIndex]
      const res = await submitChallenge(challenge.id, selectedOption)
      setResult({ ...res, selectedAnswer: selectedOption })
    } catch (err) {
      if (err.status === 409) {
        toast.warning('Already submitted', "You already completed today's challenge")
      } else {
        toast.error('Submit failed', err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setSelectedIndex(null)
    setResult(null)
    refetch()
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={3} /></div>
      <div className="rounded-2xl border border-border bg-surface p-6"><Skeleton lines={5} /></div>
    </div>
  )

  if (error) {
    // No challenge seeded for today — not a real error
    const isNoChallenge = error.includes('No challenge') || error.includes('404')
    if (isNoChallenge) return (
      <div className="max-w-2xl mx-auto py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
          <Award className="w-6 h-6 text-text-muted" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">No challenge today</p>
          <p className="text-xs text-text-muted">A new challenge will be available tomorrow. Check back soon!</p>
        </div>
      </div>
    )
    return <ErrorState message={error} onRetry={refetch} />
  }

  if (!challenge) return null
  if (result) return <ResultScreen result={result} onRetry={handleRetry} />

  const q = challenge.questions[0]

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {isGuest && <GuestPrompt feature="challenge scores and streaks" compact />}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-1">Daily challenge</p>
        <h2 className="text-xl font-bold text-text-primary">{challenge.title}</h2>
        <p className="text-sm text-text-muted mt-1">{challenge.description}</p>
      </motion.div>

      {/* Article excerpt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border-l-2 border-l-primary border border-border bg-surface px-6 py-5"
      >
        <p className="text-2xs font-semibold text-text-muted uppercase tracking-widest mb-3">Read carefully</p>
        <p className="text-sm text-text-secondary leading-relaxed italic">"{challenge.article}"</p>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border bg-surface px-6 py-5 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Badge color="default">Q1</Badge>
        </div>
        <p className="text-base font-semibold text-text-primary leading-snug">{q.text}</p>

        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const selected = selectedIndex === i
            return (
              <motion.button
                key={i}
                onClick={() => setSelectedIndex(i)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                className={clsx(
                  'w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all duration-150',
                  selected
                    ? 'bg-primary/8 border-primary/30 text-primary'
                    : 'bg-surface-2 border-border text-text-secondary hover:border-primary/25 hover:text-text-primary'
                )}
              >
                <span className={clsx(
                  'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0',
                  selected ? 'border-primary bg-primary/10' : 'border-current'
                )}>
                  {selected
                    ? <CheckCircle className="w-3.5 h-3.5" />
                    : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          size="sm"
          loading={submitting}
          disabled={selectedIndex === null}
          onClick={handleSubmit}
        >
          Submit answer
        </Button>
      </div>
    </div>
  )
}
