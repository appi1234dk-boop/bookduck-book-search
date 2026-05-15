import { NextRequest, NextResponse } from 'next/server'
import { getUser, updateSelectedDatabase } from '@/lib/sheetsClient'
import {
  generateWidgetUserId,
  getWidgetUserIdFromRequest,
  setWidgetUserIdCookie,
} from '@/lib/session'

export async function GET(request: NextRequest) {
  const existing = getWidgetUserIdFromRequest(request)

  if (!existing) {
    // First visit (or cookie+header both missing). Mint a new id; client mirrors it
    // into localStorage so subsequent requests can include it as a header fallback if
    // the cookie doesn't persist.
    const userId = generateWidgetUserId()
    const res = NextResponse.json({ connected: false, userId })
    setWidgetUserIdCookie(res, userId)
    return res
  }

  const user = await getUser(existing)
  if (!user) {
    // Identifier known but no DB row yet (post-mint, pre-OAuth, or row wiped).
    const res = NextResponse.json({ connected: false, userId: existing })
    // Refresh the cookie in case it's the header path that carried the id this time.
    setWidgetUserIdCookie(res, existing)
    return res
  }

  const res = NextResponse.json({
    connected: true,
    userId: existing,
    selectedDatabaseId: user.selectedDatabaseId || null,
    workspaceName: user.notionWorkspaceName,
  })
  setWidgetUserIdCookie(res, existing)
  return res
}

export async function PATCH(request: NextRequest) {
  const userId = getWidgetUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'No session' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { selectedDatabaseId } = body

    if (!selectedDatabaseId) {
      return NextResponse.json({ error: 'Missing selectedDatabaseId' }, { status: 400 })
    }

    await updateSelectedDatabase(userId, selectedDatabaseId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('User update error:', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
