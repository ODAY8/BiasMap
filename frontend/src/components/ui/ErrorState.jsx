import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-danger" />
      </div>
      <h3 className="text-text-primary font-semibold text-lg mb-2">Something went wrong</h3>
      <p className="text-text-muted text-sm max-w-sm mb-6">{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
