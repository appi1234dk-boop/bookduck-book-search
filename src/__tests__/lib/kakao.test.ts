import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks } from '@/lib/kakao'

describe('searchBooks', () => {
  beforeEach(() => {
    vi.stubEnv('KAKAO_REST_API_KEY', 'test-api-key')
  })

  it('throws when API key is missing', async () => {
    vi.stubEnv('KAKAO_REST_API_KEY', '')
    await expect(searchBooks('test')).rejects.toThrow('KAKAO_REST_API_KEY not configured')
  })

  it('calls kakao API with correct params', async () => {
    const mockResponse = {
      documents: [{
        title: '테스트 책',
        authors: ['저자'],
        publisher: '출판사',
        datetime: '2024-01-01T00:00:00.000+09:00',
        isbn: '1234567890',
        thumbnail: 'https://img.com/thumb.jpg',
        contents: '설명',
        url: 'https://example.com',
      }],
      meta: { total_count: 1, pageable_count: 1, is_end: true },
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await searchBooks('테스트', 1, 10)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('dapi.kakao.com/v3/search/book'),
      expect.objectContaining({
        headers: { Authorization: 'KakaoAK test-api-key' },
      })
    )

    expect(result.books).toHaveLength(1)
    expect(result.books[0].title).toBe('테스트 책')
    expect(result.meta.isEnd).toBe(true)
  })

  it('throws on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(searchBooks('test')).rejects.toThrow('Kakao API error: 500')
  })
})
