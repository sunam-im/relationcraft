import './globals.css'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <nav className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold">
                RelationCraft
              </Link>
              {/* PC 메뉴 */}
              <div className="hidden md:flex gap-6">
                <Link href="/postman" className="hover:text-blue-200 transition">
                  포스트맨 100명
                </Link>
                <Link href="/daily-log" className="hover:text-blue-200 transition">
                  데일리 로그
                </Link>
                <Link href="/weekly-plan" className="hover:text-blue-200 transition">
                  Weekly 3 Plan
                </Link>
                <Link href="/calendar" className="hover:text-blue-200 transition">
                  캘린더
                </Link>
                <Link href="/dashboard" className="hover:text-blue-200 transition">
                  대시보드
                </Link>
              </div>
              {/* 모바일 햄버거 메뉴 */}
              <MobileNav />
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
