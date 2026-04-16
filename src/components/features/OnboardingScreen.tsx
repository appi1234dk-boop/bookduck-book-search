'use client'

import Button from '@/components/ui/Button'
import { MESSAGES } from '@/constants'

interface OnboardingScreenProps {
  onConnect: () => void
  loading?: boolean
}

export default function OnboardingScreen({ onConnect, loading = false }: OnboardingScreenProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
      <div className="onboarding">
        <div className="icon">
          <svg viewBox="0 0 48 48">
            <path d="M8 6h24l8 8v28a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
            <polyline points="32 6 32 14 40 14" />
            <line x1="16" y1="22" x2="32" y2="22" />
            <line x1="16" y1="28" x2="32" y2="28" />
            <line x1="16" y1="34" x2="24" y2="34" />
            <circle cx="36" cy="36" r="8" fill="#FFFFFF" stroke="#2383E2" strokeWidth="1.5" />
            <path d="M36 32v8" stroke="#2383E2" />
            <path d="M32 36h8" stroke="#2383E2" />
          </svg>
        </div>
        <h1>{MESSAGES.ONBOARDING_TITLE}</h1>
        <p className="subtitle">{MESSAGES.ONBOARDING_SUBTITLE_LINE1}<br />{MESSAGES.ONBOARDING_SUBTITLE_LINE2}</p>
        <Button onClick={onConnect} loading={loading}>
          {MESSAGES.ONBOARDING_CTA}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 3l4 4-4 4" />
          </svg>
        </Button>
        <p className="trust">{MESSAGES.ONBOARDING_TRUST}</p>
      </div>
    </div>
  )
}
