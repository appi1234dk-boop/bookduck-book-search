import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'wbw_uid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year
const HEADER_NAME = 'x-widget-user-id'

// Cookie-first identification with a localStorage-backed header fallback.
//
// Why both: HttpOnly + Secure + SameSite=None + Partitioned (CHIPS) cookies are the
// modern way to persist identity in cross-site iframes (Notion embeds the widget). But
// some browsers / WebViews silently drop the cookie even with Partitioned — that was
// the reported failure mode. The localStorage fallback (carried in the x-widget-user-id
// header) buys us a survival path in those environments, at the cost of slightly weaker
// XSS posture (userId becomes readable by JS). Acceptable trade for this widget.
export function getWidgetUserIdFromRequest(request: NextRequest): string | null {
  const fromCookie = request.cookies.get(COOKIE_NAME)?.value
  if (fromCookie) return fromCookie
  const fromHeader = request.headers.get(HEADER_NAME)
  if (fromHeader) return fromHeader
  return null
}

// Raw Set-Cookie header so we can include `Partitioned` (CHIPS) reliably across runtimes.
export function setWidgetUserIdCookie(response: NextResponse, userId: string): void {
  const cookie = [
    `${COOKIE_NAME}=${userId}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=None',
    'Partitioned',
  ].join('; ')
  response.headers.append('Set-Cookie', cookie)
}

export function generateWidgetUserId(): string {
  return crypto.randomUUID()
}
