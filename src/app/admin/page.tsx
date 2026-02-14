'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type DashboardData = {
  totalUsers: number; activeUsers: number; todayActiveUsers: number;
  totalPostmen: number; totalInteractions: number; totalDailyLogs: number;
  weeklySignups: { date: string; count: number }[];
  weeklyActive: { date: string; count: number }[];
  stageDistribution: Record<string, number>;
  inactiveRate: number;
};

const STAGE_COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!data) return <div className="text-center py-20 text-red-400">권한이 없거나 오류가 발생했습니다.</div>;

  const stageData = Object.entries(data.stageDistribution).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">서비스 현황</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">전체 회원</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.totalUsers}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">활성 회원</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.activeUsers}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">오늘 활동</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{data.todayActiveUsers}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">총 포스트맨</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.totalPostmen}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">총 소통 기록</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.totalInteractions}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">미활동률</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.inactiveRate}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 주간 가입자 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">주간 가입자 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weeklySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} name="가입자" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 일별 활성 사용자 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">일별 활성 사용자</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.weeklyActive}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" radius={[4,4,0,0]} name="활성 사용자" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 파이프라인 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">전체 포스트맨 단계 분포</h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" label={({ name, value }) => `${name} ${value}`}>
                  {stageData.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i % STAGE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2">
              {stageData.map((s, i) => (
                <span key={s.name} className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[i] + '20', color: STAGE_COLORS[i] }}>
                  {s.name}: {s.value}명
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
