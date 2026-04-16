'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import DatabaseItem from '@/components/features/DatabaseItem'
import { MESSAGES } from '@/constants'
import type { NotionDatabase } from '@/types'

interface DbSelectScreenProps {
  databases: NotionDatabase[]
  loading: boolean
  onSelect: (databaseId: string) => void
}

export default function DbSelectScreen({ databases, loading, onSelect }: DbSelectScreenProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    if (!selectedId) return
    setConfirming(true)
    await onSelect(selectedId)
    setConfirming(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
        <div style={{ width: '100%', maxWidth: 480, padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="skeleton" style={{ height: 20, width: 192, margin: '0 auto 8px' }} />
            <div className="skeleton" style={{ height: 16, width: 256, margin: '0 auto' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 64, width: '100%' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (databases.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
        <EmptyState
          icon="database"
          message={MESSAGES.DB_SELECT_EMPTY}
          action={{
            label: MESSAGES.DB_SELECT_EMPTY_GUIDE,
            onClick: () => window.open('https://www.notion.so/my-integrations', '_blank'),
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400 }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '32px 24px' }}>
        <div className="db-select-header">
          <h1>{MESSAGES.DB_SELECT_TITLE}</h1>
          <p>{MESSAGES.DB_SELECT_SUBTITLE}</p>
        </div>
        <div className="db-list" role="radiogroup">
          {databases.map((db) => (
            <DatabaseItem
              key={db.id}
              icon={db.icon}
              name={db.title}
              count={`${db.pageCount}개의 항목`}
              selected={selectedId === db.id}
              onClick={() => setSelectedId(db.id)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleConfirm} disabled={!selectedId} loading={confirming}>
            {MESSAGES.DB_SELECT_CONFIRM}
          </Button>
        </div>
      </div>
    </div>
  )
}
