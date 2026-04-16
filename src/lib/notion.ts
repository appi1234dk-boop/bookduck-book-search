const NOTION_API_BASE = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

export async function notionFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${NOTION_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 401) {
    throw new NotionTokenExpiredError()
  }

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Notion API error: ${res.status} ${body}`)
  }

  return res.json()
}

export class NotionTokenExpiredError extends Error {
  constructor() {
    super('Notion token expired')
    this.name = 'NotionTokenExpiredError'
  }
}

export async function searchDatabases(token: string) {
  const data = await notionFetch('/search', token, {
    method: 'POST',
    body: JSON.stringify({
      filter: { value: 'database', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
    }),
  })

  return data.results.map((db: Record<string, unknown>) => ({
    id: db.id as string,
    title: extractTitle(db),
    icon: extractIcon(db),
  }))
}

export async function getDatabasePageCount(token: string, databaseId: string): Promise<number> {
  const data = await notionFetch(`/databases/${databaseId}/query`, token, {
    method: 'POST',
    body: JSON.stringify({ page_size: 1 }),
  })
  // Notion doesn't return total count directly; approximate from has_more
  // For MVP, we query with page_size: 100 to get a rough count
  const fullData = await notionFetch(`/databases/${databaseId}/query`, token, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100 }),
  })
  return fullData.results.length
}

export async function createPage(
  token: string,
  databaseId: string,
  book: {
    title: string
    authors: string
    publisher: string
    datetime: string
    isbn: string
    thumbnail: string
    contents: string
    url: string
  }
) {
  const properties: Record<string, unknown> = {
    'Name': {
      title: [{ text: { content: book.title } }],
    },
    '작가': {
      rich_text: [{ text: { content: book.authors } }],
    },
    '출판사': {
      rich_text: [{ text: { content: book.publisher } }],
    },
  }

  // 커버이미지 속성 (files 타입) — ISBN 기반 교보문고 이미지 URL 사용
  const isbn13 = extractIsbn13(book.isbn)
  if (isbn13) {
    const coverUrl = `https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/${isbn13}.jpg`
    properties['커버이미지'] = {
      files: [{
        type: 'external',
        name: book.title || '표지',
        external: { url: coverUrl },
      }],
    }
  }

  const data = await notionFetch('/pages', token, {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  })

  return data.id as string
}

function extractTitle(db: Record<string, unknown>): string {
  const titleArr = (db as { title: Array<{ plain_text: string }> }).title
  if (Array.isArray(titleArr) && titleArr.length > 0) {
    return titleArr[0].plain_text || 'Untitled'
  }
  return 'Untitled'
}

function extractIsbn13(isbn: string): string | null {
  if (!isbn) return null
  const parts = isbn.split(' ')
  const isbn13 = parts.find((p) => p.length === 13)
  return isbn13 || null
}

function extractIcon(db: Record<string, unknown>): string {
  const icon = db.icon as Record<string, unknown> | null
  if (!icon) return '📄'
  if (icon.type === 'emoji') return icon.emoji as string
  return '📄'
}
