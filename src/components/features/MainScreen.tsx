'use client'

import { useState, useCallback } from 'react'
import SearchInput from '@/components/ui/SearchInput'
import StatusBanner from '@/components/ui/StatusBanner'
import EmptyState from '@/components/ui/EmptyState'
import BookCard from '@/components/features/BookCard'
import SettingsMenu from '@/components/features/SettingsMenu'
import Button from '@/components/ui/Button'
import { MESSAGES, SEARCH_PAGE_SIZE } from '@/constants'
import { widgetHeaders } from '@/lib/clientSession'
import type { Book, BookCardStatus, BannerState, SearchMeta } from '@/types'

interface MainScreenProps {
  banner: BannerState | null
  onBannerDismiss: () => void
  onReconnect: () => void
  onChangeDb: () => void
}

export default function MainScreen({
  banner,
  onBannerDismiss,
  onReconnect,
  onChangeDb,
}: MainScreenProps) {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [meta, setMeta] = useState<SearchMeta | null>(null)
  const [page, setPage] = useState(1)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [addingBooks, setAddingBooks] = useState<Record<string, BookCardStatus>>({})
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchError, setSearchError] = useState(false)

  const doSearch = useCallback(async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) return
    if (pageNum === 1) {
      setSearching(true)
      setSearched(true)
      setSearchError(false)
    } else {
      setLoadingMore(true)
    }
    try {
      const params = new URLSearchParams({ query: searchQuery, page: String(pageNum), size: String(SEARCH_PAGE_SIZE) })
      const res = await fetch(`/api/search?${params}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      if (pageNum === 1) { setBooks(data.books) } else { setBooks((prev) => [...prev, ...data.books]) }
      setMeta(data.meta)
      setPage(pageNum)
    } catch {
      setSearchError(true)
    } finally {
      setSearching(false)
      setLoadingMore(false)
    }
  }, [])

  const handleSearch = useCallback((q: string) => doSearch(q, 1), [doSearch])
  const handleLoadMore = useCallback(() => { if (query.trim()) doSearch(query, page + 1) }, [doSearch, query, page])

  const handleAdd = useCallback(async (book: Book, index: number) => {
    const bookKey = `${index}-${book.isbn}`
    setAddingBooks((prev) => ({ ...prev, [bookKey]: 'adding' }))
    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        credentials: 'include',
        headers: widgetHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          title: book.title, authors: book.authors.join(', '), publisher: book.publisher,
          datetime: book.datetime, isbn: book.isbn, thumbnail: book.thumbnail,
          contents: book.contents, url: book.url,
        }),
      })
      if (res.status === 401) { setAddingBooks((prev) => ({ ...prev, [bookKey]: 'default' })); onReconnect(); return }
      if (!res.ok) throw new Error('Create failed')
      setAddingBooks((prev) => ({ ...prev, [bookKey]: 'added' }))
    } catch {
      setAddingBooks((prev) => ({ ...prev, [bookKey]: 'default' }))
    }
  }, [onReconnect])

  const getBookStatus = (index: number, book: Book): BookCardStatus => {
    return addingBooks[`${index}-${book.isbn}`] || 'default'
  }

  return (
    <div className="widget">
      {banner && (
        <StatusBanner
          type={banner.type} message={banner.message} action={banner.action}
          autoDismiss={banner.type === 'success'} onDismiss={onBannerDismiss}
        />
      )}
      {searchError && (
        <StatusBanner
          type="error" message={MESSAGES.API_ERROR}
          action={{ label: MESSAGES.API_ERROR_ACTION, onClick: () => { setSearchError(false); doSearch(query, 1) } }}
          onDismiss={() => setSearchError(false)}
        />
      )}

      <div className="search-bar">
        <div style={{ flex: 1 }}>
          <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} autoFocus />
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" className="settings-btn" onClick={() => setSettingsOpen(!settingsOpen)} title="설정">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="8" r="2" />
              <path d="M13.5 8a5.5 5.5 0 0 0-.15-.96l1.36-1.07-.75-1.3-1.6.54a5.5 5.5 0 0 0-.83-.48L11.28 3h-1.5l-.25 1.73a5.5 5.5 0 0 0-.83.48l-1.6-.54-.75 1.3 1.36 1.07A5.5 5.5 0 0 0 7.5 8c0 .33.05.65.15.96L6.3 10.03l.75 1.3 1.6-.54c.25.19.53.35.83.48L9.72 13h1.5l.25-1.73c.3-.13.58-.29.83-.48l1.6.54.75-1.3-1.36-1.07c.1-.31.15-.63.15-.96z" />
            </svg>
          </button>
          <SettingsMenu open={settingsOpen} onClose={() => setSettingsOpen(false)} onChangeDb={onChangeDb} />
        </div>
      </div>

      <div className="results">
        {searching && [1, 2, 3].map((i) => (
          <div key={i} className="book-card">
            <div className="skeleton" style={{ width: 56, height: 80, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ height: 16, width: '75%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 4 }} />
              <div className="skeleton" style={{ height: 12, width: '25%' }} />
            </div>
          </div>
        ))}

        {!searching && books.map((book, index) => (
          <BookCard
            key={`${index}-${book.isbn}`}
            book={book}
            status={getBookStatus(index, book)}
            onAdd={() => handleAdd(book, index)}
          />
        ))}

        {!searching && searched && books.length === 0 && !searchError && (
          <EmptyState icon="search" message={MESSAGES.SEARCH_EMPTY} />
        )}
        {!searching && !searched && (
          <EmptyState icon="search" message={MESSAGES.SEARCH_INITIAL} />
        )}
      </div>

      {!searching && meta && !meta.isEnd && books.length > 0 && (
        <div className="load-more">
          <Button variant="secondary" onClick={handleLoadMore} loading={loadingMore}>
            {MESSAGES.LOAD_MORE}
          </Button>
        </div>
      )}
    </div>
  )
}
