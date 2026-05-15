// Client-side identifier fallback.
// Pairs with the server-side `getWidgetUserIdFromRequest` in @/lib/session, which reads
// the cookie first and falls back to this header. Both layers exist because Partitioned
// cookies are silently dropped by some browsers/WebViews in cross-site iframe contexts
// (Notion embeds), and localStorage alone was the original bug we migrated away from.

export const LS_USER_ID_KEY = 'notion_book_widget_user_id'
export const ID_HEADER = 'x-widget-user-id'

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(LS_USER_ID_KEY)
  } catch {
    return null
  }
}

export function setStoredUserId(userId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_USER_ID_KEY, userId)
  } catch {
    // Strict iframe contexts may block localStorage; cookie path is still primary.
  }
}

export function widgetHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {}
  if (extra) Object.assign(headers, extra as Record<string, string>)
  const id = getStoredUserId()
  if (id) headers[ID_HEADER] = id
  return headers
}
