import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-widget-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: user, error } = await supabase
    .from('users')
    .select('selected_database_id, notion_workspace_name')
    .eq('widget_user_id', userId)
    .single()

  if (error || !user) {
    return NextResponse.json({ connected: false })
  }

  return NextResponse.json({
    connected: true,
    selectedDatabaseId: user.selected_database_id,
    workspaceName: user.notion_workspace_name,
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

    const supabase = getSupabase()
    const { error } = await supabase
      .from('users')
      .update({
        selected_database_id: selectedDatabaseId,
        updated_at: new Date().toISOString(),
      })
      .eq('widget_user_id', userId)

    if (error) {
      console.error('User update error:', error)
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
