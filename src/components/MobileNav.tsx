'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/postman', label: '📇 포스트맨 100명' },
    { href: '/daily-log', label: '📝 데일리 로그' },
    { href: '/weekly-plan', label: '📅 Weekly 3 Plan' },
    { href: '/calendar', label: '🗓️ 캘린더' },
    { href: '/dashboard', label: '📊 대시보드' },
  ];

  return (
    <div className="md:hidden">
      {/* 햄버거 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white focus:outline-none"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* 모바일 메뉴 드롭다운 */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-blue-700 shadow-lg z-50">
          <div className="flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-6 py-3 hover:bg-blue-800 transition border-b border-blue-600 ${
                  pathname === link.href ? 'bg-blue-800 font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
