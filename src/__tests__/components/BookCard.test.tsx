import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BookCard from '@/components/features/BookCard'
import type { Book } from '@/types'

const mockBook: Book = {
  title: '도쿄 하이드어웨이',
  authors: ['이동진'],
  publisher: '문학동네',
  datetime: '2024-03-15T00:00:00.000+09:00',
  isbn: '1234567890123',
  thumbnail: '',
  contents: '설명 텍스트',
  url: 'https://example.com',
}

describe('BookCard', () => {
  it('renders book title and meta', () => {
    const { container } = render(<BookCard book={mockBook} status="default" onAdd={vi.fn()} />)
    expect(container.textContent).toContain('도쿄 하이드어웨이')
    expect(container.textContent).toContain('이동진')
    expect(container.textContent).toContain('문학동네')
  })

  it('shows add button in default state', () => {
    const { container } = render(<BookCard book={mockBook} status="default" onAdd={vi.fn()} />)
    const buttons = container.querySelectorAll('button[type="button"]')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    const addButton = Array.from(buttons).find(b => b.textContent?.trim() === '추가')
    expect(addButton).toBeTruthy()
  })

  it('calls onAdd when add button is clicked', () => {
    const onAdd = vi.fn()
    const { container } = render(<BookCard book={mockBook} status="default" onAdd={onAdd} />)
    const buttons = container.querySelectorAll('button[type="button"]')
    const addButton = Array.from(buttons).find(b => b.textContent?.trim() === '추가')
    fireEvent.click(addButton!)
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('shows spinner in adding state', () => {
    const { container } = render(<BookCard book={mockBook} status="adding" onAdd={vi.fn()} />)
    const disabledButtons = container.querySelectorAll('button[disabled]')
    expect(disabledButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('shows added state with checkmark', () => {
    const { container } = render(<BookCard book={mockBook} status="added" onAdd={vi.fn()} />)
    expect(container.textContent).toContain('추가됨')
  })

  it('renders multiple authors joined by comma', () => {
    const multiAuthorBook = { ...mockBook, authors: ['저자1', '저자2'] }
    const { container } = render(<BookCard book={multiAuthorBook} status="default" onAdd={vi.fn()} />)
    expect(container.textContent).toContain('저자1, 저자2')
  })
})
