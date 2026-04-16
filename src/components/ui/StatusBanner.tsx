'use client'

import { useEffect } from 'react'
import type { BannerType } from '@/types'

interface StatusBannerProps {
  type: BannerType
  message: string
  action?: { label: string; onClick: () => void }
  autoDismiss?: boolean
  onDismiss?: () => void
}

const CONFIG: Record<BannerType, { icon: string; iconColor: string; borderColor: string; textColor: string }> = {
  warning: { icon: '⚠', iconColor: '#D9730D', borderColor: '#E3E2DE', textColor: '#191919' },
  error:   { icon: '✕', iconColor: '#EB5757', borderColor: '#E3E2DE', textColor: '#191919' },
  success: { icon: '✓', iconColor: '#0F7B6C', borderColor: '#BBF7D0', textColor: '#0F7B6C' },
}

export default function StatusBanner({ type, message, action, autoDismiss = false, onDismiss }: StatusBannerProps) {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(onDismiss, 3000)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onDismiss])

  const c = CONFIG[type]

  return (
    <div className="status-banner" style={{ border: `1px solid ${c.borderColor}` }}>
      <span style={{ color: c.iconColor, fontSize: '14px' }}>{c.icon}</span>
      <span className="message" style={{ color: c.textColor }}>{message}</span>
      {action && (
        <button type="button" onClick={action.onClick} className="btn-text">
          {action.label}
        </button>
      )}
    </div>
  )
}
