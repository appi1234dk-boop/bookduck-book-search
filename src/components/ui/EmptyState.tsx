'use client'

interface EmptyStateProps {
  icon?: 'search' | 'database' | 'error'
  message: string
  action?: { label: string; onClick: () => void }
}

const ICONS = {
  search: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#C4C4C0" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="18" cy="18" r="10" />
      <path d="M26 26l8 8" />
    </svg>
  ),
  database: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#C4C4C0" strokeWidth="1.5" strokeLinecap="round">
      <ellipse cx="20" cy="10" rx="14" ry="5" />
      <path d="M6 10v20c0 2.76 6.27 5 14 5s14-2.24 14-5V10" />
      <path d="M6 20c0 2.76 6.27 5 14 5s14-2.24 14-5" />
    </svg>
  ),
  error: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#C4C4C0" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="20" cy="20" r="14" />
      <path d="M20 14v8" />
      <circle cx="20" cy="26" r="0.5" fill="#C4C4C0" />
    </svg>
  ),
}

export default function EmptyState({ icon = 'search', message, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {ICONS[icon]}
      <p>{message}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="btn-text">
          {action.label}
        </button>
      )}
    </div>
  )
}
