import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, BookOpen, Trophy } from 'lucide-react'
import Button from '@/components/ui/Button'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const up = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16"
    >
      {/* Large 404 */}
      <motion.div variants={up} className="relative mb-8 select-none">
        <p className="text-[120px] sm:text-[160px] font-black leading-none text-surface-2 tracking-tighter">
          404
        </p>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Search className="w-7 h-7 text-primary" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div variants={up} className="space-y-2 mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Page not found</h1>
        <p className="text-text-muted text-sm max-w-sm">
          This page doesn't exist — but your critical thinking skills do.
          Let's get you back on track.
        </p>
      </motion.div>

      <motion.div variants={up} className="flex flex-wrap items-center justify-center gap-3 mb-12">
        <Button onClick={() => navigate('/')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate('/analyze')} icon={<Search className="w-4 h-4" />}>
          Analyze something
        </Button>
      </motion.div>

      {/* Helpful links */}
      <motion.div variants={up} className="grid sm:grid-cols-2 gap-3 w-full max-w-sm">
        {[
          { icon: BookOpen, label: 'Learning Hub',    sub: 'Build media literacy skills', to: '/learn'     },
          { icon: Trophy,   label: 'Daily Challenge', sub: 'Test your critical thinking',  to: '/challenge' },
        ].map(({ icon: Icon, label, sub, to }) => (
          <motion.button
            key={to}
            onClick={() => navigate(to)}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:border-primary/20 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-text-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{label}</p>
              <p className="text-xs text-text-muted">{sub}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}
