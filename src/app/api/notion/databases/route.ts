import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/sheetsClient'
import { searchDatabases, getDatabasePageCount, NotionTokenExpiredError } from '@/lib/notion'
import { getWidgetUserIdFromRequest } from '@/lib/session'

export async function GET(request: NextRequest) {
  const userId = getWidgetUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: 'No session' }, { status: 400 })
  }

  const user = await getUser(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const databases = await searchDatabases(user.notionAccessToken)

    const withCounts = await Promise.all(
      databases.map(async (db: { id: string; title: string; icon: string }) => {
        try {
          const pageCount = await getDatabasePageCount(user.notionAccessToken, db.id)
          return { ...db, pageCount }
        } catch {
          return { ...db, pageCount: 0 }
        }
      })
    )

    return NextResponse.json({ databases: withCounts })
  } catch (err) {
    if (err instanceof NotionTokenExpiredError) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }
    console.error('Databases fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch databases' }, { status: 500 })
  }
}
