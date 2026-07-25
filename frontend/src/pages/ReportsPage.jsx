import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Share2, Trash2, Plus, Link } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getSavedReports, deleteReport, getShareLink, exportReportPdf, saveReport } from '@/services/reportsService'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/utils'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import Modal from '@/components/ui/Modal'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } }
const up = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } } }

function ReportRow({ report, onDelete, onShare, onExport }) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(report.id)
    setDeleting(false)
  }

  return (
    <motion.div variants={up} layout
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-4 rounded-2xl border border-border bg-surface hover:border-primary/20 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{report.title}</p>
        <p className="text-xs text-text-muted mt-0.5">{formatDate(report.created_at)}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onShare(report.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
          title="Copy share link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onExport(report.id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-success hover:bg-success/10 transition-colors"
          title="Export PDF"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

export default function ReportsPage() {
  const toast = useToast()
  const { data: reports, loading, error, refetch } = useAsync(getSavedReports)
  const [saveModal, setSaveModal] = useState(false)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const handleDelete = async (id) => {
    try {
      await deleteReport(id)
      toast.success('Report deleted')
      refetch()
    } catch (err) {
      toast.error('Delete failed', err.message)
    }
  }

  const handleShare = async (id) => {
    try {
      const { share_token } = await getShareLink(id)
      const url = `${window.location.origin}/reports/shared/${share_token}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied', 'Share link copied to clipboard')
    } catch (err) {
      toast.error('Share failed', err.message)
    }
  }

  const handleExport = (id) => {
    exportReportPdf(id)
    toast.info('Downloading PDF…')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await saveReport({ title: title.trim() })
      toast.success('Report saved')
      setTitle('')
      setSaveModal(false)
      refetch()
    } catch (err) {
      toast.error('Save failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">

      {/* Header */}
      <motion.div variants={up} className="flex items-end justify-between gap-4">
        <div>
          <p className="text-text-muted text-xs mb-1">Your saved analyses</p>
          <h2 className="text-2xl font-bold text-text-primary">
            {loading ? '—' : `${reports?.length ?? 0} reports`}
          </h2>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setSaveModal(true)}
        >
          Save report
        </Button>
      </motion.div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
              <Skeleton lines={2} />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!loading && !error && reports?.length === 0 && (
        <motion.div variants={up} className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <FileText className="w-6 h-6 text-text-muted" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">No saved reports</p>
            <p className="text-xs text-text-muted">Save an analysis to access it later or export as PDF</p>
          </div>
          <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setSaveModal(true)}>
            Save your first report
          </Button>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {!loading && reports?.length > 0 && (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
            {reports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onDelete={handleDelete}
                onShare={handleShare}
                onExport={handleExport}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save modal */}
      <Modal
        open={saveModal}
        onClose={() => setSaveModal(false)}
        title="Save report"
        description="Give this report a title to save it for later"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Climate article analysis"
            className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" type="button" onClick={() => setSaveModal(false)}>Cancel</Button>
            <Button size="sm" type="submit" loading={saving}>Save</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
