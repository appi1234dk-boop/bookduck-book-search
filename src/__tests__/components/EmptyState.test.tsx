import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import EmptyState from '@/components/ui/EmptyState'

describe('EmptyState', () => {
  it('renders message', () => {
    const { container } = render(<EmptyState message="검색 결과가 없어요" />)
    expect(container.textContent).toContain('검색 결과가 없어요')
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    const { container } = render(
      <EmptyState message="DB 없음" action={{ label: '권한 추가하기', onClick }} />
    )
    const actionBtn = container.querySelector('button')!
    expect(actionBtn.textContent).toContain('권한 추가하기')
    fireEvent.click(actionBtn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render action when not provided', () => {
    const { container } = render(<EmptyState message="빈 상태" />)
    expect(container.querySelector('button')).toBeNull()
  })
})
