'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

type NeedContact = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  profileImage: string | null;
  phone: string | null;
  stage: string;
  daysSince: number;
  lastContactDate: string;
  urgency: string;
};
type DashboardData = {
  needContact: NeedContact[];
  stageCount: Record<string, number>;
  commStats: { month: string; label: string; letters: number; calls: number; sns: number; gifts: number }[];
  commTotals: { letters: number; calls: number; sns: number; gifts: number };
  summary: {
    totalPostmen: number;
    totalGiveScore: number;
    totalTakeScore: number;
    totalInteractions: number;
  };
  topGive: { id: string; name: string; company: string | null; score: number }[];
  topTake: { id: string; name: string; company: string | null; score: number }[];
  topActive: {
    id: string;
    name: string;
    company: string | null;
    giveScore: number;
    takeScore: number;
    totalScore: number;
  }[];
  categoryCount: Record<string, number>;
  monthlyChartData: { month: string; label: string; give: number; take: number }[];
  categoryChartData: { name: string; value: number }[];
  latestInteractions: {
    id: string;
    type: string;
    category: string;
    description: string;
    date: string;
    postman: { name: string; company: string | null };
  }[];
  dailyLogStatus: { date: string; dayLabel: string; hasLog: boolean }[];
  weeklyPlanSummary: {
    plans: { text: string | null; status: string }[];
    doneCount: number;
    totalCount: number;
  } | null;
  neglectedPostmen: {
    id: string;
    name: string;
    company: string | null;
    lastContact: string | null;
  }[];
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="text-center py-20 text-gray-500">대시보드를 불러오는 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-20 text-red-500">데이터를 불러오지 못했습니다.</div>
      </div>
    );
  }

  const giveTakeRatio = [
    { name: 'Give', value: data.summary.totalGiveScore },
    { name: 'Take', value: data.summary.totalTakeScore },
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-xl font-bold mb-4 dark:text-white">대시보드</h1>

      {/* ===== 요약 카드 ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-indigo-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">총 포스트맨</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.summary.totalPostmen}명</div>
          <div className="text-xs text-gray-400 mt-1">/ 100명</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">총 Give</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.summary.totalGiveScore}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">총 Take</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{data.summary.totalTakeScore}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border-l-4 border-amber-500">
          <div className="text-sm text-gray-500 dark:text-gray-400">총 상호작용</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{data.summary.totalInteractions}</div>
        </div>
      </div>

      {/* ===== 연락 필요 리마인더 ===== */}
      {data.needContact && data.needContact.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-600">🔔 연락 필요 ({data.needContact.length}명)</h2>
            <span className="text-xs text-gray-400">7일 이상 미연락</span>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {data.needContact.slice(0, 15).map((p: NeedContact) => (
              <div key={p.id} className={`flex items-center gap-3 p-2 rounded-lg ${
                p.urgency === 'high' ? 'bg-red-50 border border-red-200' :
                p.urgency === 'medium' ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}>
                {p.profileImage ? (
                  <img src={p.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {p.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link href={`/postman/${p.id}`} className="text-sm font-semibold hover:text-blue-500">{p.name}</Link>
                  <div className="text-xs text-gray-500">{[p.company, p.position].filter(Boolean).join(' · ') || '-'}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-sm font-bold ${p.urgency === 'high' ? 'text-red-500' : p.urgency === 'medium' ? 'text-yellow-600' : 'text-gray-500'}`}>
                    {p.daysSince}일 전
                  </div>
                </div>
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm shrink-0 hover:bg-green-600">📞</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 관계 단계 분포 ===== */}
      {data.stageCount && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">📊 관계 단계 분포</h2>
            <Link href="/pipeline" className="text-sm text-blue-500 hover:underline">파이프라인 →</Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {['첫만남','관계형성','신뢰구축','포스트맨PLUS','VIP'].map(stage => {
              const count = (data.stageCount && data.stageCount[stage]) || 0;
              const colors: Record<string,string> = {'첫만남':'bg-gray-100 border-gray-300','관계형성':'bg-blue-100 border-blue-300','신뢰구축':'bg-green-100 border-green-300','포스트맨PLUS':'bg-yellow-100 border-yellow-300','VIP':'bg-purple-100 border-purple-300'};
              const icons: Record<string,string> = {'첫만남':'🤝','관계형성':'💬','신뢰구축':'🤗','포스트맨PLUS':'⭐','VIP':'👑'};
              return (
                <div key={stage} className={`text-center rounded-lg p-3 border ${colors[stage]}`}>
                  <div className="text-xl">{icons[stage]}</div>
                  <div className="text-2xl font-bold mt-1">{count}</div>
                  <div className="text-xs text-gray-600 mt-1">{stage}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 차트 영역 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 월별 Give & Take 추이 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">월별 Give & Take 추이</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="give" name="Give" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="take" name="Take" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Give & Take 비율 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Give & Take 비율</h2>
          {data.summary.totalInteractions > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={giveTakeRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              아직 상호작용 데이터가 없습니다
            </div>
          )}
        </div>

        {/* 상호작용 카테고리 분포 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">상호작용 카테고리 분포</h2>
          {data.categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {data.categoryChartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              아직 상호작용 데이터가 없습니다
            </div>
          )}
        </div>

        {/* 이번 주 Weekly Plan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">이번 주 Weekly 3 Plan</h2>
          {data.weeklyPlanSummary && data.weeklyPlanSummary.totalCount > 0 ? (
            <div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>달성률</span>
                  <span className="font-bold">
                    {data.weeklyPlanSummary.doneCount}/{data.weeklyPlanSummary.totalCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{
                      width: `${(data.weeklyPlanSummary.doneCount / data.weeklyPlanSummary.totalCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {data.weeklyPlanSummary.plans.map((plan, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        plan.status === 'DONE'
                          ? 'bg-green-100 text-green-700'
                          : plan.status === 'DOING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {plan.status}
                    </span>
                    <span className={plan.status === 'DONE' ? 'line-through text-gray-400' : ''}>
                      {plan.text}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/weekly-plan" className="text-blue-500 hover:underline text-sm">
                  Weekly Plan 바로가기 →
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <p>이번 주 계획이 없습니다</p>
              <Link href="/weekly-plan" className="text-blue-500 hover:underline text-sm mt-2">
                계획 세우러 가기 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== 하단 영역 ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 데일리 로그 현황 (최근 7일) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">데일리 로그 (최근 7일)</h2>
          <div className="flex justify-between gap-2">
            {data.dailyLogStatus.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    day.hasLog
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {day.hasLog ? '✓' : '·'}
                </div>
                <span className="text-xs text-gray-500">{day.dayLabel}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            작성: {data.dailyLogStatus.filter((d) => d.hasLog).length}/7일
          </div>
          <div className="mt-2 text-right">
            <Link href="/daily-log" className="text-blue-500 hover:underline text-sm">
              데일리 로그 바로가기 →
            </Link>
          </div>
        </div>

        {/* Top 5 활발한 포스트맨 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top 5 활발한 인맥</h2>
          {data.topActive.length > 0 ? (
            <div className="space-y-3">
              {data.topActive.map((person, idx) => (
                <Link
                  key={person.id}
                  href={`/postman/${person.id}`}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                      idx === 0
                        ? 'bg-yellow-500'
                        : idx === 1
                        ? 'bg-gray-400'
                        : idx === 2
                        ? 'bg-amber-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.company || '-'}</div>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-blue-600">G:{person.giveScore}</span>
                    {' / '}
                    <span className="text-green-600">T:{person.takeScore}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">데이터 없음</div>
          )}
        </div>

        {/* 오래 연락 안 한 포스트맨 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">연락이 뜸한 인맥</h2>
          {data.neglectedPostmen.length > 0 ? (
            <div className="space-y-3">
              {data.neglectedPostmen.map((person) => (
                <Link
                  key={person.id}
                  href={`/postman/${person.id}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <div>
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-xs text-gray-500">{person.company || '-'}</div>
                  </div>
                  <div className="text-sm text-red-500">
                    {person.lastContact
                      ? `${Math.floor(
                          (Date.now() - new Date(person.lastContact).getTime()) / (1000 * 60 * 60 * 24)
                        )}일 전`
                      : '연락 없음'}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">모두 활발히 연락 중!</div>
          )}
        </div>
      </div>

      {/* ===== 최근 상호작용 ===== */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">최근 상호작용</h2>
        {data.latestInteractions.length > 0 ? (
          <div className="space-y-3">
            {data.latestInteractions.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold mt-0.5 ${
                    item.type === 'GIVE'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {item.type}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.postman.name}</span>
                    <span className="text-xs text-gray-400">{item.postman.company}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(item.date).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">아직 상호작용 기록이 없습니다</div>
        )}
      </div>
    </div>
  );
}
