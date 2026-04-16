import { NextRequest, NextResponse } from 'next/server'
import { searchBooks } from '@/lib/kakao'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const size = parseInt(request.nextUrl.searchParams.get('size') || '10', 10)

  if (!query || !query.trim()) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  try {
    const result = await searchBooks(query.trim(), page, size)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
