export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-4xl mb-4 opacity-50">{icon}</div>}
      <h3 className="text-text-primary font-semibold text-lg mb-2">{title}</h3>
      {description && <p className="text-text-muted text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  )
}
