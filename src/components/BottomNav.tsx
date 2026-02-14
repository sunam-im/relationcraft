'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '홈', icon: '🏠', activeIcon: '🏠' },
  { href: '/postman', label: '포스트맨', icon: '👥', activeIcon: '👥' },
  { href: '/daily-log', label: '데일리', icon: '📝', activeIcon: '📝' },
  { href: '/weekly-plan', label: '위클리', icon: '📅', activeIcon: '📅' },
  { href: '/more', label: '더보기', icon: '☰', activeIcon: '☰' },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Hide on login/register pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                active ? 'text-blue-500' : 'text-gray-400'
              }`}>
              <span className={`text-xl mb-0.5 ${active ? 'scale-110' : ''} transition-transform`}>
                {active ? tab.activeIcon : tab.icon}
              </span>
              <span className={`text-[10px] font-medium ${active ? 'text-blue-500' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
