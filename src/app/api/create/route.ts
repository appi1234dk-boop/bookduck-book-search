import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { createPage, NotionTokenExpiredError } from '@/lib/notion'

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-widget-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  // Get user from Supabase
  const supabase = getSupabase()
  const { data: user, error } = await supabase
    .from('users')
    .select('notion_access_token, selected_database_id')
    .eq('widget_user_id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (!user.selected_database_id) {
    return NextResponse.json({ error: 'No database selected' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const pageId = await createPage(user.notion_access_token, user.selected_database_id, {
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
