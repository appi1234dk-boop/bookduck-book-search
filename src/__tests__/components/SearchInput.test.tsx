import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchInput from '@/components/ui/SearchInput'

describe('SearchInput', () => {
  it('renders with placeholder', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} onSearch={vi.fn()} />)
    const input = container.querySelector('input')!
    expect(input.placeholder).toBe('책 제목, 저자, ISBN으로 검색')
  })

  it('displays current value', () => {
    const { container } = render(<SearchInput value="도쿄" onChange={vi.fn()} onSearch={vi.fn()} />)
    const input = container.querySelector('input')!
    expect(input.value).toBe('도쿄')
  })

  it('calls onChange on input', () => {
    const onChange = vi.fn()
    const { container } = render(<SearchInput value="" onChange={onChange} onSearch={vi.fn()} />)
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { value: '테스트' } })
    expect(onChange).toHaveBeenCalledWith('테스트')
  })

  it('calls onSearch on Enter key', () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchInput value="검색어" onChange={vi.fn()} onSearch={onSearch} />)
    const input = container.querySelector('input')!
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSearch).toHaveBeenCalledWith('검색어')
  })

  it('does not call onSearch on Enter with empty value', () => {
    const onSearch = vi.fn()
    const { container } = render(<SearchInput value="  " onChange={vi.fn()} onSearch={onSearch} />)
    const input = container.querySelector('input')!
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('shows clear button when value exists', () => {
    const { container } = render(<SearchInput value="텍스트" onChange={vi.fn()} onSearch={vi.fn()} />)
    const clearBtn = container.querySelector('button[aria-label="검색어 지우기"]')
    expect(clearBtn).toBeTruthy()
  })

  it('hides clear button when value is empty', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} onSearch={vi.fn()} />)
    const clearBtn = container.querySelector('button[aria-label="검색어 지우기"]')
    expect(clearBtn).toBeNull()
  })

  it('calls onChange with empty string when clear is clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<SearchInput value="텍스트" onChange={onChange} onSearch={vi.fn()} />)
    const clearBtn = container.querySelector('button[aria-label="검색어 지우기"]')!
    fireEvent.click(clearBtn)
    expect(onChange).toHaveBeenCalledWith('')
  })
})
