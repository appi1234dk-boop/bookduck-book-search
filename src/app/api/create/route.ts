import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/sheetsClient'
import { createPage, NotionTokenExpiredError } from '@/lib/notion'
import { getWidgetUserIdFromRequest } from '@/lib/session'

export async function POST(request: NextRequest) {
  const userId = getWidgetUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'No session' }, { status: 400 })
  }

  const user = await getUser(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.selectedDatabaseId) {
    return NextResponse.json({ error: 'No database selected' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const pageId = await createPage(user.notionAccessToken, user.selectedDatabaseId, {
      title: body.title || '',
      authors: body.authors || '',
      publisher: body.publisher || '',
      datetime: body.datetime || '',
      isbn: body.isbn || '',
      thumbnail: body.thumbnail || '',
      contents: body.contents || '',
      url: body.url || '',
    })

    return NextResponse.json({ success: true, pageId })
  } catch (err) {
    if (err instanceof NotionTokenExpiredError) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }
    const errMsg = err instanceof Error ? err.message : String(err)
    console.error('Create page error:', errMsg)
    return NextResponse.json({ error: errMsg }, { status: 500 })
  }
}
