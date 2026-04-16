export interface User {
  connected: boolean
  selectedDatabaseId: string | null
  workspaceName: string | null
}

export interface NotionDatabase {
  id: string
  title: string
  icon: string
  pageCount: number
}

export interface Book {
  title: string
  authors: string[]
  publisher: string
  datetime: string
  isbn: string
  thumbnail: string
  contents: string
  url: string
}

export interface SearchMeta {
  totalCount: number
  pageableCount: number
  isEnd: boolean
}

export interface SearchResult {
  books: Book[]
  meta: SearchMeta
}

export type Screen = 'onboarding' | 'db-select' | 'main'

export type BookCardStatus = 'default' | 'adding' | 'added'

export type BannerType = 'warning' | 'error' | 'success'

export interface BannerState {
  type: BannerType
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}
