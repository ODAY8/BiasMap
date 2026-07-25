import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-text-muted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 opacity-40" />}
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-text-primary transition-colors">{item.label}</Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-text-secondary' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
