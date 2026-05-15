import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'wbw_uid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export function getWidgetUserIdFromRequest(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null
}

// Raw Set-Cookie header so we can include `Partitioned` (CHIPS) reliably across runtimes.
// HttpOnly + Secure + SameSite=None + Partitioned: required to survive in cross-site iframes
// (Notion embeds the widget; without Partitioned, Safari/Brave drop the cookie on reload).
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
