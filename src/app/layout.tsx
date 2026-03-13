import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '우아한테크코스 8기 짝 프로그래밍 선언문',
  description: '우아한테크코스 8기 크루들이 함께 만든 짝 프로그래밍 선언문입니다.',
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
