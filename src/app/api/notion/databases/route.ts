import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { searchDatabases, getDatabasePageCount, NotionTokenExpiredError } from '@/lib/notion'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-widget-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  // Get user token from Supabase
  const supabase = getSupabase()
  const { data: user, error } = await supabase
    .from('users')
    .select('notion_access_token')
    .eq('widget_user_id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const databases = await searchDatabases(user.notion_access_token)

    // Fetch page counts in parallel
    const withCounts = await Promise.all(
      databases.map(async (db: { id: string; title: string; icon: string }) => {
        try {
          const pageCount = await getDatabasePageCount(user.notion_access_token, db.id)
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
