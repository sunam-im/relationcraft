'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

const menuItems = [
  { href: '/pipeline', label: '관계 파이프라인', icon: '🔄', desc: '관계 단계 칸반 보드' },
  { href: '/dashboard', label: '대시보드', icon: '📊', desc: '통계 및 분석' },
  { href: '/calendar', label: '캘린더', icon: '🗓️', desc: '일정 관리' },
  { href: '/postman/new', label: '포스트맨 추가', icon: '➕', desc: '새 포스트맨 등록' },
  { href: '/daily-log/list', label: '데일리 로그 목록', icon: '📋', desc: '과거 기록 보기' },
];

export default function MorePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notices, setNotices] = useState<Array<{id:string;title:string;content:string;createdAt:string}>>([]);
  const [showNotices, setShowNotices] = useState(false);
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
    fetch('/api/notices').then(r=>r.json()).then(d=>{ if(d.success) setNotices(d.data); }).catch(()=>{});
  }, []);
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };
  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24">
      <h1 className="text-xl font-bold dark:text-white mb-6">더보기</h1>
      <div className="space-y-2 mb-6">
        {menuItems.map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition active:scale-[0.98]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">{item.icon}</div>
            <div className="flex-1">
              <div className="font-semibold dark:text-white">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
            <span className="text-gray-300">›</span>
          </Link>
        ))}
      </div>
      {/* 공지사항 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <button 
          onClick={() => setShowNotices(!showNotices)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📢</span>
            <div className="text-left">
              <div className="font-medium dark:text-white">공지사항</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{notices.length}개의 공지</div>
            </div>
          </div>
          <span className="text-gray-400">{showNotices ? '▲' : '▼'}</span>
        </button>
        {showNotices && (
          <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {notices.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">공지사항이 없습니다</div>
            ) : notices.map(n => (
              <div key={n.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm dark:text-white">{n.title}</span>
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">설정</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl">{darkMode ? '🌙' : '☀️'}</div>
            <div>
              <div className="font-semibold dark:text-white">다크 모드</div>
              <div className="text-xs text-gray-500">{darkMode ? '어두운 테마' : '밝은 테마'}</div>
            </div>
          </div>
          <button onClick={toggleDarkMode}
            className={`w-14 h-8 rounded-full relative transition-colors ${darkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 p-4 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xl">🚪</div>
          <div>
            <div className="font-semibold text-red-500">로그아웃</div>
            <div className="text-xs text-gray-500">계정에서 로그아웃</div>
          </div>
        </button>
      </div>
      <div className="text-center text-xs text-gray-400 mt-8">
        <p>포스트맨 v1.0</p>
        <p className="mt-1">1인 기업을 위한 인맥 관리 플랫폼</p>
      </div>
    </div>
  );
}
