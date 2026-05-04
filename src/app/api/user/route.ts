import { NextRequest, NextResponse } from 'next/server'
import { getUser, updateSelectedDatabase } from '@/lib/sheetsClient'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-widget-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const user = await getUser(userId)
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
  const userId = request.headers.get('x-widget-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
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
