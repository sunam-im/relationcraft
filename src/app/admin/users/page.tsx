'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type UserActivity = {
  id: string; email: string; role: string; isActive: boolean;
  createdAt: string; lastLoginAt: string | null;
  postmenCount: number; interactionCount: number;
  dailyLogCount: number; weeklyPlanCount: number;
  recentLogDays: number; weeklyCompletionRate: number;
  pipeline: Record<string, number>;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => { if (d.success) setUsers(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' });
  };

  const sorted = [...users].sort((a, b) => {
    if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'postmen') return b.postmenCount - a.postmenCount;
    if (sortBy === 'interactions') return b.interactionCount - a.interactionCount;
    if (sortBy === 'logDays') return b.recentLogDays - a.recentLogDays;
    return 0;
  });

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">회원 활동 현황</h1>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="text-sm border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2">
          <option value="createdAt">가입일순</option>
          <option value="postmen">포스트맨수순</option>
          <option value="interactions">소통기록순</option>
          <option value="logDays">로그작성순</option>
        </select>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        총 {users.length}명 · 개인정보보호를 위해 이메일은 마스킹 처리됩니다
      </div>

      {/* 모바일: 카드 / 데스크톱: 테이블 */}
      <div className="space-y-3 md:hidden">
        {sorted.map(u => (
          <Link key={u.id} href={`/admin/users/${u.id}`}
            className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm active:scale-[0.98] transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold dark:text-white">{u.email}</span>
                {u.role === 'admin' && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">관리자</span>}
              </div>
              <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{u.postmenCount}</div>
                <div className="text-[10px] text-gray-500">포스트맨</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{u.interactionCount}</div>
                <div className="text-[10px] text-gray-500">소통</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{u.recentLogDays}</div>
                <div className="text-[10px] text-gray-500">로그(30일)</div>
              </div>
              <div>
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{u.weeklyCompletionRate}%</div>
                <div className="text-[10px] text-gray-500">위클리</div>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              {Object.entries(u.pipeline).map(([stage, count]) => (
                count > 0 && <span key={stage} className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400">{stage}:{count}</span>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-2">가입: {formatDate(u.createdAt)} · 최근활동: {formatDate(u.lastLoginAt)}</div>
          </Link>
        ))}
      </div>

      {/* 데스크톱 테이블 */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-750 border-b dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">이메일</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">상태</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">포스트맨</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">소통</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">로그(30일)</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">위클리</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">가입일</th>
              <th className="px-3 py-3 font-semibold text-gray-600 dark:text-gray-300">최근활동</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(u => (
              <tr key={u.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${u.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    {u.email}
                  </Link>
                  {u.role === 'admin' && <span className="ml-1 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">관리자</span>}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${u.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                </td>
                <td className="px-3 py-3 text-center font-semibold">{u.postmenCount}</td>
                <td className="px-3 py-3 text-center font-semibold">{u.interactionCount}</td>
                <td className="px-3 py-3 text-center font-semibold">{u.recentLogDays}일</td>
                <td className="px-3 py-3 text-center font-semibold">{u.weeklyCompletionRate}%</td>
                <td className="px-3 py-3 text-center text-gray-500 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-3 text-center text-gray-500 text-xs">{formatDate(u.lastLoginAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
