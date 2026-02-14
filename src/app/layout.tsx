import './globals.css'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import DarkModeToggle from '@/components/DarkModeToggle'
import AuthSessionProvider from '@/components/SessionProvider'
import UserMenu from '@/components/UserMenu'
import BottomNav from '@/components/BottomNav'
import PWARegister from '@/components/PWARegister'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="포스트맨" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="포스트맨" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
        <AuthSessionProvider>
          <nav className="bg-blue-600 dark:bg-gray-800 text-white shadow-lg">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-12 md:h-16">
                <Link href="/" className="text-lg md:text-xl font-bold">
                  포스트맨
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
                  <div className="hidden md:block"><DarkModeToggle /></div>
                  {/* 사용자 메뉴 */}
                  <UserMenu />
                  {/* 모바일 햄버거 메뉴 - 하단탭바로 대체 */}
                  {/* <MobileNav /> */}
                </div>
              </div>
            </div>
          </nav>
          <main className="pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <PWARegister />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
