'use client'

import type { Book, BookCardStatus } from '@/types'
import { MESSAGES } from '@/constants'

interface BookCardProps {
  book: Book
  status: BookCardStatus
  onAdd: () => void
}

export default function BookCard({ book, status, onAdd }: BookCardProps) {
  const dateStr = book.datetime
    ? new Date(book.datetime).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : ''

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C0" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
            }}
          />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C4C4C0" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div className="book-title">{book.title}</div>
        <div className="book-meta">
          {book.authors.join(', ')}{book.publisher ? ` · ${book.publisher}` : ''}
        </div>
        {dateStr && <div className="book-date">{dateStr}</div>}
      </div>
      <div style={{ flexShrink: 0, alignSelf: 'center' }}>
        {status === 'default' && (
          <button type="button" className="btn-add" onClick={onAdd}>
            {MESSAGES.ADD}
          </button>
        )}
        {status === 'adding' && (
          <button type="button" className="btn-add" disabled>
            <svg className="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </button>
        )}
        {status === 'added' && (
          <span className="btn-added">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="2.5 7 5.5 10 11.5 4" />
            </svg>
            {MESSAGES.ADDED}
          </span>
        )}
      </div>
    </div>
  )
}
