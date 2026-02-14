'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

type AnalyticsData = {
  monthlySignups: { month: string; count: number }[];
  avgDailyLogs: number; avgDailyInteractions: number;
  topCategories: { category: string; count: number }[];
  stageDistribution: Record<string, number>;
  totalUsers: number; totalPostmen: number; totalInteractions: number;
  totalGive: number; totalTake: number;
  avgPostmenPerUser: number; avgInteractionsPerUser: number;
  avgWeeklyRate: number; churnRate: number;
  monthlyActivity: { month: string; dailyLogs: number; interactions: number }[];
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const STAGE_COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!data) return <div className="text-center py-20 text-red-400">데이터를 불러올 수 없습니다.</div>;

  const stageData = Object.entries(data.stageDistribution).map(([name, value]) => ({ name, value }));
  const gtRatio = data.totalGive + data.totalTake > 0 ? Math.round((data.totalGive / (data.totalGive + data.totalTake)) * 100) : 50;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">서비스 통계</h1>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">사용자당 평균 포스트맨</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.avgPostmenPerUser}명</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">사용자당 평균 소통</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.avgInteractionsPerUser}건</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">위클리 평균 완료율</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.avgWeeklyRate}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">이탈률 (30일)</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{data.churnRate}%</div>
        </div>
      </div>

      {/* 일평균 활동 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{data.avgDailyLogs}</div>
          <div className="text-sm text-gray-500 mt-1">일평균 데일리로그</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{data.avgDailyInteractions}</div>
          <div className="text-sm text-gray-500 mt-1">일평균 소통 기록</div>
        </div>
      </div>

      {/* Give/Take 비율 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">전체 Give & Take 비율</h2>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-blue-600 font-bold">Give {data.totalGive}건</span>
          <span className="text-sm text-green-600 font-bold">Take {data.totalTake}건</span>
        </div>
        <div className="flex rounded-full overflow-hidden h-6">
          <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${gtRatio}%` }}>
            {data.totalGive > 0 && `${gtRatio}%`}
          </div>
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${100 - gtRatio}%` }}>
            {data.totalTake > 0 && `${100 - gtRatio}%`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 월별 가입자 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">월별 가입자 추이 (12개월)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlySignups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} name="가입자" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 월별 활동 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">월별 활동 추이</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="dailyLogs" fill="#8B5CF6" name="데일리로그" radius={[4,4,0,0]} />
              <Bar dataKey="interactions" fill="#3B82F6" name="소통기록" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 소통 카테고리 TOP 5 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">소통 카테고리 TOP 5</h2>
          {data.topCategories.length > 0 ? (
            <div className="space-y-2">
              {data.topCategories.map((c, i) => (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="text-sm font-bold w-6" style={{ color: COLORS[i] }}>{i+1}</span>
                  <span className="text-sm dark:text-gray-300 flex-1">{c.category}</span>
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.count / data.topCategories[0].count) * 100}%`, backgroundColor: COLORS[i] }} />
                  </div>
                  <span className="text-sm font-bold dark:text-gray-300 w-8 text-right">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">데이터 없음</div>
          )}
        </div>

        {/* 파이프라인 분포 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">포스트맨 단계 분포</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" label={({ name, value }) => value > 0 ? `${name} ${value}` : ''}>
                {stageData.map((_, i) => <Cell key={i} fill={STAGE_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
