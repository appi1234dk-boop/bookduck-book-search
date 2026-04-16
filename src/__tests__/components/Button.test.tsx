import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders children text', () => {
    const { container } = render(<Button>테스트 버튼</Button>)
    expect(container.textContent).toContain('테스트 버튼')
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    const { container } = render(<Button onClick={onClick}>클릭</Button>)
    fireEvent.click(container.querySelector('button')!)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('is disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>비활성</Button>)
    expect(container.querySelector('button')!.disabled).toBe(true)
  })

  it('is disabled when loading', () => {
    const { container } = render(<Button loading>로딩</Button>)
    expect(container.querySelector('button')!.disabled).toBe(true)
  })

  it('shows spinner when loading', () => {
    const { container } = render(<Button loading>로딩</Button>)
    expect(container.textContent).not.toContain('로딩')
    expect(container.querySelector('svg.spinner')).toBeTruthy()
  })

  it('applies primary variant class by default', () => {
    const { container } = render(<Button>Primary</Button>)
    expect(container.querySelector('button')!.className).toContain('btn-primary')
  })

  it('applies secondary variant class', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>)
    expect(container.querySelector('button')!.className).toContain('btn-secondary')
  })

  it('applies text variant class', () => {
    const { container } = render(<Button variant="text">Text</Button>)
    expect(container.querySelector('button')!.className).toContain('btn-text')
  })
})
