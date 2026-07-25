import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap } from 'lucide-react'
import { startSession, askCoach } from '@/services/coachService'
import { useToast } from '@/context/ToastContext'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
        ${isUser ? 'bg-primary/20' : 'bg-accent/20'}`}>
        {isUser
          ? <User className="w-3.5 h-3.5 text-primary" />
          : <Bot className="w-3.5 h-3.5 text-accent" />}
      </div>
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'bg-primary/10 border border-primary/20 text-text-primary rounded-tr-sm'
          : 'bg-surface-2 border border-border text-text-secondary rounded-tl-sm'}`}>
        {msg.content}
      </div>
    </motion.div>
  )
}

export default function CoachPage() {
  const toast = useToast()
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    startSession()
      .then((id) => {
        setSessionId(id)
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm your media literacy coach. I'm here to help you think critically about what you read and watch. What would you like to explore today?",
        }])
      })
      .catch(() => toast.error('Could not start session', 'Please refresh and try again'))
      .finally(() => setInitializing(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !sessionId || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const reply = await askCoach(sessionId, text)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (err) {
      toast.error('Coach error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100dvh - 8rem)' }}>

      {/* Header */}
      <motion.div variants={up} initial="hidden" animate="show" className="mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
          <Zap className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">Media Literacy Coach</h2>
          <p className="text-xs text-text-muted">Socratic AI guide — asks questions, never tells you what to think</p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-2">
        {initializing ? (
          <div className="space-y-4 pt-2">
            <Skeleton lines={2} />
            <Skeleton lines={3} />
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-surface-2 border border-border">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-text-muted"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-border">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question or share something you read…"
            rows={2}
            disabled={initializing || !sessionId}
            className="flex-1 bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || !sessionId}
            loading={loading}
            size="md"
            icon={<Send className="w-4 h-4" />}
            className="shrink-0 self-end"
          >
            Send
          </Button>
        </div>
        <p className="text-2xs text-text-muted mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
