import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  // User denied access
  if (error) {
    return new NextResponse(closePopupHtml('연결이 취소되었어요'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  if (!code || !state) {
    return new NextResponse(closePopupHtml('잘못된 요청이에요'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Decode state
  let userId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    userId = decoded.userId
    if (!userId) throw new Error('No userId')
  } catch {
    return new NextResponse(closePopupHtml('잘못된 요청이에요'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Exchange code for token
  try {
    const clientId = process.env.NOTION_CLIENT_ID!
    const clientSecret = process.env.NOTION_CLIENT_SECRET!
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/notion/callback`

    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error('Token exchange failed:', body)
      return new NextResponse(closePopupHtml('연결에 실패했어요. 다시 시도해주세요'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const tokenData = await tokenRes.json()

    // Upsert user in Supabase
    const supabase = getSupabase()
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        widget_user_id: userId,
        notion_access_token: tokenData.access_token,
        notion_workspace_id: tokenData.workspace_id,
        notion_workspace_name: tokenData.workspace_name,
        notion_bot_id: tokenData.bot_id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'widget_user_id',
      })

    if (dbError) {
      console.error('Supabase upsert error:', dbError)
      return new NextResponse(closePopupHtml('연결에 실패했어요. 다시 시도해주세요'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new NextResponse(closePopupHtml('연결 완료!', true), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    console.error('OAuth callback error:', err)
    return new NextResponse(closePopupHtml('연결에 실패했어요. 다시 시도해주세요'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function closePopupHtml(message: string, success: boolean = false): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>노션 연결</title></head>
<body style="font-family:-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;color:#191919;">
  <div style="text-align:center;">
    <p style="font-size:16px;margin-bottom:8px;">${message}</p>
    <p style="font-size:13px;color:#787774;">이 창은 자동으로 닫힙니다</p>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'notion-oauth-complete', success: ${success} }, '*');
    }
    setTimeout(() => window.close(), 1500);
  </script>
</body></html>`
}
