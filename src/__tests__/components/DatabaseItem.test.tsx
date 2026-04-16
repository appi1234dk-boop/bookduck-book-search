import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DatabaseItem from '@/components/features/DatabaseItem'

describe('DatabaseItem', () => {
  it('renders database name and count', () => {
    const { container } = render(
      <DatabaseItem icon="📚" name="독서노트" count="24개의 항목" selected={false} onClick={vi.fn()} />
    )
    expect(container.textContent).toContain('독서노트')
    expect(container.textContent).toContain('24개의 항목')
    expect(container.textContent).toContain('📚')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    const { container } = render(
      <DatabaseItem icon="📚" name="독서노트" count="24개의 항목" selected={false} onClick={onClick} />
    )
    fireEvent.click(container.querySelector('[role="radio"]')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies selected class when selected', () => {
    const { container } = render(
      <DatabaseItem icon="📚" name="독서노트" count="24개의 항목" selected={true} onClick={vi.fn()} />
    )
    const item = container.querySelector('[role="radio"]')!
    expect(item.className).toContain('selected')
  })

  it('does not have selected class when not selected', () => {
    const { container } = render(
      <DatabaseItem icon="📚" name="독서노트" count="24개의 항목" selected={false} onClick={vi.fn()} />
    )
    const item = container.querySelector('[role="radio"]')!
    expect(item.className).not.toContain('selected')
  })

  it('handles Enter key', () => {
    const onClick = vi.fn()
    const { container } = render(
      <DatabaseItem icon="📚" name="독서노트" count="24개의 항목" selected={false} onClick={onClick} />
    )
    fireEvent.keyDown(container.querySelector('[role="radio"]')!, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledOnce()
  })
})
