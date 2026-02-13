import './globals.css'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import DarkModeToggle from '@/components/DarkModeToggle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-xl font-bold">
                RelationCraft
              </Link>
              <div className="flex items-center gap-4">
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
                {/* 다크 모드 토글 */}
                <DarkModeToggle />
                {/* 모바일 햄버거 메뉴 */}
                <MobileNav />
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
