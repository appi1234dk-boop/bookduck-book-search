import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StatusBanner from '@/components/ui/StatusBanner'

describe('StatusBanner', () => {
  it('renders warning banner', () => {
    const { container } = render(<StatusBanner type="warning" message="연결이 만료됐어요" />)
    expect(container.textContent).toContain('연결이 만료됐어요')
    expect(container.textContent).toContain('⚠')
  })

  it('renders error banner', () => {
    const { container } = render(<StatusBanner type="error" message="에러 발생" />)
    expect(container.textContent).toContain('에러 발생')
    expect(container.textContent).toContain('✕')
  })

  it('renders success banner', () => {
    const { container } = render(<StatusBanner type="success" message="성공" />)
    expect(container.textContent).toContain('성공')
    expect(container.textContent).toContain('✓')
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    const { container } = render(
      <StatusBanner type="warning" message="만료됨" action={{ label: '다시 연결', onClick }} />
    )
    const actionBtn = container.querySelector('button')!
    expect(actionBtn.textContent).toContain('다시 연결')
    fireEvent.click(actionBtn)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render action button when not provided', () => {
    const { container } = render(<StatusBanner type="error" message="에러" />)
    expect(container.querySelector('button')).toBeNull()
  })
})
