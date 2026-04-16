'use client'

import { useEffect, useRef } from 'react'

interface SettingsMenuProps {
  open: boolean
  onClose: () => void
  onChangeDb: () => void
}

export default function SettingsMenu({ open, onClose, onChangeDb }: SettingsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div ref={menuRef} className="settings-menu">
      <button
        type="button"
        onClick={() => { onChangeDb(); onClose() }}
      >
        데이터베이스 변경
      </button>
    </div>
  )
}
