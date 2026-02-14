'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QuickData {
  totalPostmen: number;
  todayLog: boolean;
  weeklyDone: number;
  weeklyTotal: number;
  needContactCount: number;
  upcoming: Array<{id:string;name:string;type:string;label:string;date:string;daysLeft:number}>;
}

export default function Home() {
  const [data, setData] = useState<QuickData | null>(null);
  const [notices, setNotices] = useState<Array<{id:string;title:string;content:string;createdAt:string}>>([]);
  const [dismissedNotice, setDismissedNotice] = useState<string>('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('새벽에도 열심히!');
    else if (hour < 12) setGreeting('좋은 아침이에요');
    else if (hour < 18) setGreeting('오늘도 화이팅!');
    else setGreeting('수고하셨어요');

    loadQuickData();
    loadNotices();
    setDismissedNotice(localStorage.getItem('dismissedNotice') || '');
  }, []);

  const loadNotices = async () => {
    try {
      const res = await fetch('/api/notices');
      const d = await res.json();
      if (d.success) setNotices(d.data);
    } catch {}
  };

  const dismissNotice = (id: string) => {
    setDismissedNotice(id);
    localStorage.setItem('dismissedNotice', id);
  };

  const loadQuickData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (result.success) {
        const d = result.data;
        setData({
          totalPostmen: d.summary?.totalPostmen || 0,
          todayLog: d.dailyLogStatus?.[0]?.hasLog || false,
          weeklyDone: d.weeklyPlanSummary?.doneCount || 0,
          weeklyTotal: d.weeklyPlanSummary?.totalCount || 0,
          needContactCount: d.needContact?.length || 0,
          upcoming: d.upcoming || [],
        });
      }
    } catch (e) { console.error(e); }
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth()+1}월 ${today.getDate()}일`;
  const days = ['일','월','화','수','목','금','토'];
  const dayStr = days[today.getDay()];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 text-white px-5 pt-6 pb-8 rounded-b-3xl">
        <div className="max-w-lg mx-auto">
          <div className="text-sm opacity-80 mb-1">{dateStr} ({dayStr})</div>
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="포스트맨" className="w-10 h-10" />
            <span className="text-lg font-bold opacity-90">포스트맨</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{greeting} 👋</h1>
          <p className="text-sm opacity-80">오늘도 소중한 관계를 가꿔보세요</p>

          {/* Quick Stats */}
          {data && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{data.totalPostmen}</div>
                <div className="text-xs opacity-80">포스트맨</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{data.weeklyDone}/{data.weeklyTotal}</div>
                <div className="text-xs opacity-80">위클리 달성</div>
              </div>
              <div className={`${data.needContactCount > 0 ? 'bg-red-500/30' : 'bg-white/15'} backdrop-blur rounded-xl p-3 text-center`}>
                <div className="text-2xl font-bold">{data.needContactCount}</div>
                <div className="text-xs opacity-80">연락 필요</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-4">
        {/* 공지 배너 */}
        {notices.length > 0 && notices[0].id !== dismissedNotice && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">📢</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-yellow-800 dark:text-yellow-200">{notices[0].title}</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 line-clamp-2">{notices[0].content}</div>
                </div>
              </div>
              <button onClick={() => dismissNotice(notices[0].id)} className="text-yellow-500 hover:text-yellow-700 text-lg flex-shrink-0">✕</button>
            </div>
          </div>
        )}
        
        {/* 다가오는 생일/기념일 */}
        {data && data.upcoming && data.upcoming.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">🎉 다가오는 이벤트</h2>
            <div className="space-y-2">
              {data.upcoming.slice(0, 5).map((evt, i) => (
                <a key={i} href={`/postman/${evt.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${evt.type === 'birthday' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                    {evt.type === 'birthday' ? '🎂' : '💝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium dark:text-white">{evt.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{evt.label} · {evt.date}</div>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full ${evt.daysLeft === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : evt.daysLeft <= 7 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {evt.daysLeft === 0 ? '오늘!' : `D-${evt.daysLeft}`}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Today's Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">오늘 할 일</h2>
          <div className="space-y-2">
            <Link href="/daily-log" className={`flex items-center gap-3 p-3 rounded-xl transition active:scale-[0.98] ${
              data?.todayLog ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20'
            }`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white dark:bg-gray-700 shadow-sm">
                {data?.todayLog ? '✅' : '📝'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold dark:text-white">데일리 로그</div>
                <div className={`text-xs ${data?.todayLog ? 'text-green-500' : 'text-orange-500'}`}>
                  {data?.todayLog ? '오늘 작성 완료!' : '아직 작성하지 않았어요'}
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>

            <Link href="/weekly-plan" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 transition active:scale-[0.98]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white dark:bg-gray-700 shadow-sm">📅</div>
              <div className="flex-1">
                <div className="text-sm font-semibold dark:text-white">위클리 3 플랜</div>
                <div className="text-xs text-blue-500">
                  {data ? `${data.weeklyDone}/${data.weeklyTotal} 완료` : '확인하기'}
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>

            {data && data.needContactCount > 0 && (
              <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 transition active:scale-[0.98]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white dark:bg-gray-700 shadow-sm">🔔</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold dark:text-white">연락 필요</div>
                  <div className="text-xs text-red-500">{data.needContactCount}명에게 연락하세요</div>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick Menu Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Link href="/postman" className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm transition active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">👥</div>
            <span className="text-xs font-medium dark:text-gray-300">포스트맨</span>
          </Link>
          <Link href="/pipeline" className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm transition active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">🔄</div>
            <span className="text-xs font-medium dark:text-gray-300">파이프라인</span>
          </Link>
          <Link href="/calendar" className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm transition active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">🗓️</div>
            <span className="text-xs font-medium dark:text-gray-300">캘린더</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1.5 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm transition active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-2xl">📊</div>
            <span className="text-xs font-medium dark:text-gray-300">대시보드</span>
          </Link>
        </div>

        {/* Motivational Quote */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-5 text-white mb-4 shadow-lg">
          <div className="text-xs opacity-80 mb-1">💡 오늘의 한마디</div>
          <p className="text-sm font-medium leading-relaxed">
            "매일 20분, 포스트맨 수첩을 점검하라.<br/>
            통화 기록, 카카오톡 대화를 살피고<br/>
            관계의 씨앗을 뿌려라."
          </p>
          <div className="text-xs opacity-70 mt-2 text-right">— 정성만식 포스트맨</div>
        </div>

        {/* Quick Add */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">빠른 추가</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/postman/new" className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl transition active:scale-[0.98]">
              <span className="text-lg">➕</span>
              <span className="text-sm font-medium dark:text-white">포스트맨 추가</span>
            </Link>
            <Link href="/daily-log" className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl transition active:scale-[0.98]">
              <span className="text-lg">✏️</span>
              <span className="text-sm font-medium dark:text-white">로그 작성</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
