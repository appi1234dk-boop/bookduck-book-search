'use client'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text'
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
}: ButtonProps) {
  const cls = variant === 'primary'
    ? `btn-primary ${size}`
    : variant === 'secondary'
      ? 'btn-secondary'
      : 'btn-text'

  return (
    <button
      type="button"
      className={`${cls} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : children}
    </button>
  )
}
