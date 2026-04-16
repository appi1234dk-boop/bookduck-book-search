'use client'

import { useRef, useEffect, useCallback } from 'react'

interface SearchInputProps {
  value: string
  placeholder?: string
  onSearch: (query: string) => void
  onChange: (value: string) => void
  autoFocus?: boolean
}

export default function SearchInput({
  value,
  placeholder = '책 제목, 저자, ISBN으로 검색',
  onSearch,
  onChange,
  autoFocus = false,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (newValue.trim()) onSearch(newValue.trim())
    }, 300)
  }, [onChange, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      onSearch(value.trim())
    }
  }, [value, onSearch])

  const handleClear = useCallback(() => {
    onChange('')
    inputRef.current?.focus()
  }, [onChange])

  return (
    <div className="search-input-wrap">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#C4C4C0" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <circle cx="7" cy="7" r="5" />
        <path d="M11 11l3.5 3.5" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="검색어 지우기"
          style={{ flexShrink: 0, color: '#C4C4C0', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      )}
    </div>
  )
}
