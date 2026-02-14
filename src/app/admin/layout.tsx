'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/admin', label: '대시보드', icon: '📊' },
  { href: '/admin/users', label: '회원 활동', icon: '👥' },
  { href: '/admin/analytics', label: '통계', icon: '📈' },
  { href: '/admin/system', label: '시스템', icon: '🖥️' },
  { href: '/admin/notices', label: '공지', icon: '📢' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-gray-900 dark:bg-black text-white px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-lg font-bold shrink-0">🛡️</span>
            <div className="flex gap-1">
              {menuItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
                    pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white shrink-0 ml-2">← 앱</Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {children}
      </div>
    </div>
  );
}
