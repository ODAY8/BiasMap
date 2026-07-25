import { Search, X, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function SearchInput({ value, onChange, placeholder = 'Search…', loading, className }) {
  return (
    <div className={clsx('relative flex items-center', className)}>
      <div className="absolute left-3 text-text-muted pointer-events-none">
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Search className="w-4 h-4" />}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-8 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
