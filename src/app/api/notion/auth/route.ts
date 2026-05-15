import { NextRequest, NextResponse } from 'next/server'
import {
  generateWidgetUserId,
  getWidgetUserIdFromRequest,
  setWidgetUserIdCookie,
} from '@/lib/session'

// POST so we can read/set the cookie in the iframe's partition before opening the OAuth popup.
// The popup itself is top-level and lives in a different storage partition, so it can't help
// the iframe persist identity — the cookie must be set here.
export async function POST(request: NextRequest) {
  let userId = getWidgetUserIdFromRequest(request)
  const needCookie = !userId
  if (!userId) {
    userId = generateWidgetUserId()
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/notion/callback`

  const state = Buffer.from(
    JSON.stringify({ userId, csrf: crypto.randomUUID() })
  ).toString('base64url')

  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize')
  authUrl.searchParams.set('client_id', clientId!)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('owner', 'user')
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)

  const res = NextResponse.json({ authUrl: authUrl.toString() })
  if (needCookie) {
    setWidgetUserIdCookie(res, userId)
  }
  return res
}
