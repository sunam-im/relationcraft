'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type UserDetail = {
  id: string; email: string; role: string; isActive: boolean;
  createdAt: string; lastLoginAt: string | null;
  postmenCount: number; interactionCount: number;
  dailyLogCount: number; weeklyPlanCount: number;
  giveTotal: number; takeTotal: number;
  monthlyActivity: { month: string; dailyLogs: number; interactions: number }[];
  pipeline: Record<string, number>;
  weeklyTrend: { week: string; total: number; done: number; rate: number }[];
  logHeatmap: string[];
  currentStreak: number; maxStreak: number;
};

const STAGE_COLORS: Record<string, string> = {
  '첫만남': '#6B7280', '관계형성': '#3B82F6', '신뢰구축': '#10B981',
  '포스트맨PLUS': '#F59E0B', 'VIP': '#8B5CF6'
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleRoleChange = async (newRole: string) => {
    if (!confirm(`역할을 ${newRole}로 변경하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole })
    });
    const d = await res.json();
    if (d.success) { setData(prev => prev ? { ...prev, role: newRole } : prev); alert('변경 완료'); }
  };

  const handleToggleActive = async () => {
    if (!data) return;
    const newActive = !data.isActive;
    if (!confirm(`계정을 ${newActive ? '활성화' : '비활성화'}하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: newActive })
    });
    const d = await res.json();
    if (d.success) { setData(prev => prev ? { ...prev, isActive: newActive } : prev); alert('변경 완료'); }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 히트맵 생성 (최근 90일)
  const generateHeatmap = () => {
    if (!data) return [];
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({ date: dateStr, active: data.logHeatmap.includes(dateStr) });
    }
    return days;
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!data) return <div className="text-center py-20 text-red-400">데이터를 불러올 수 없습니다.</div>;

  const heatmap = generateHeatmap();
  const gtRatio = data.giveTotal + data.takeTotal > 0
    ? Math.round((data.giveTotal / (data.giveTotal + data.takeTotal)) * 100) : 50;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-blue-500 text-sm">← 목록</Link>
        <h1 className="text-xl font-bold dark:text-white">회원 활동 상세</h1>
      </div>

      {/* 기본 정보 + 관리 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold dark:text-white">{data.email}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${data.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>{data.role}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${data.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
            <div className="text-sm text-gray-500">가입일: {formatDate(data.createdAt)} · 최근활동: {formatDate(data.lastLoginAt)}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleRoleChange(data.role === 'admin' ? 'user' : 'admin')}
              className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white transition">
              {data.role === 'admin' ? '일반으로 변경' : '관리자로 변경'}
            </button>
            <button onClick={handleToggleActive}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${data.isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
              {data.isActive ? '계정 비활성화' : '계정 활성화'}
            </button>
          </div>
        </div>
      </div>

      {/* 활동 요약 카드 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{data.postmenCount}</div>
          <div className="text-[10px] text-gray-500">포스트맨</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">{data.interactionCount}</div>
          <div className="text-[10px] text-gray-500">소통 기록</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{data.dailyLogCount}</div>
          <div className="text-[10px] text-gray-500">데일리로그</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{data.giveTotal}</div>
          <div className="text-[10px] text-gray-500">GIVE</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{data.takeTotal}</div>
          <div className="text-[10px] text-gray-500">TAKE</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{data.weeklyPlanCount}</div>
          <div className="text-[10px] text-gray-500">위클리플랜</div>
        </div>
      </div>

      {/* Give/Take 비율 바 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Give & Take 비율</h2>
        <div className="flex rounded-full overflow-hidden h-6">
          <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${gtRatio}%` }}>
            {data.giveTotal > 0 && `G ${gtRatio}%`}
          </div>
          <div className="bg-green-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${100 - gtRatio}%` }}>
            {data.takeTotal > 0 && `T ${100 - gtRatio}%`}
          </div>
        </div>
      </div>

      {/* 파이프라인 분포 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">포스트맨 단계 분포</h2>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(data.pipeline).map(([stage, count]) => (
            <div key={stage} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: STAGE_COLORS[stage] + '15' }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
              <span className="text-sm dark:text-gray-300">{stage}</span>
              <span className="text-sm font-bold" style={{ color: STAGE_COLORS[stage] }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 월별 활동 차트 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">월별 활동 추이</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.monthlyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="dailyLogs" fill="#8B5CF6" name="데일리로그" radius={[4,4,0,0]} />
            <Bar dataKey="interactions" fill="#3B82F6" name="소통기록" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 위클리플랜 완료율 추이 */}
      {data.weeklyTrend.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">위클리플랜 완료율 추이</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="rate" fill="#F59E0B" name="완료율" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 데일리로그 히트맵 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">데일리로그 작성 히트맵 (최근 90일)</h2>
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
          <span>연속: {data.currentStreak}일</span>
          <span>·</span>
          <span>최장: {data.maxStreak}일</span>
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {heatmap.map(d => (
            <div key={d.date} title={d.date}
              className={`w-3 h-3 rounded-sm ${d.active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
