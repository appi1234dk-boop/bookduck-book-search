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
    // First visit (or cookie was wiped). Mint a new id, return disconnected.
    const userId = generateWidgetUserId()
    const res = NextResponse.json({ connected: false })
    setWidgetUserIdCookie(res, userId)
    return res
  }

  const user = await getUser(existing)
  if (!user) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    selectedDatabaseId: user.selectedDatabaseId || null,
    workspaceName: user.notionWorkspaceName,
  })
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
