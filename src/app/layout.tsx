import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '책 검색 위젯',
  description: '책을 검색하고 노션에 추가하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
