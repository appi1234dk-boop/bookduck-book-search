const KAKAO_API_URL = 'https://dapi.kakao.com/v3/search/book'

export interface KakaoBook {
  title: string
  authors: string[]
  publisher: string
  datetime: string
  isbn: string
  thumbnail: string
  contents: string
  url: string
}

interface KakaoSearchResponse {
  documents: KakaoBook[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

export async function searchBooks(query: string, page: number = 1, size: number = 10) {
  const apiKey = process.env.KAKAO_REST_API_KEY
  if (!apiKey) throw new Error('KAKAO_REST_API_KEY not configured')

  const params = new URLSearchParams({
    query,
    page: String(page),
    size: String(size),
  })

  const res = await fetch(`${KAKAO_API_URL}?${params}`, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
  })

  if (!res.ok) {
    throw new Error(`Kakao API error: ${res.status}`)
  }

  const data: KakaoSearchResponse = await res.json()

  return {
    books: data.documents.map((doc) => ({
      title: doc.title,
      authors: doc.authors,
      publisher: doc.publisher,
      datetime: doc.datetime,
      isbn: doc.isbn,
      thumbnail: doc.thumbnail,
      contents: doc.contents,
      url: doc.url,
    })),
    meta: {
      totalCount: data.meta.total_count,
      pageableCount: data.meta.pageable_count,
      isEnd: data.meta.is_end,
    },
  }
}
