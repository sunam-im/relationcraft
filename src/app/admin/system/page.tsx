'use client';

import { useState, useEffect } from 'react';

type SystemData = {
  disk: { usage: number; total: string; used: string };
  db: { size: string; tables: Record<string, number> };
  backups: Array<{ name: string; size: string; date: string }>;
  recentLogs: Array<{ id: string; action: string; detail: string | null; createdAt: string }>;
};

export default function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [backing, setBacking] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/system')
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleBackup = async () => {
    if (!confirm('수동 백업을 실행하시겠습니까?')) return;
    setBacking(true);
    try {
      const res = await fetch('/api/admin/system', { method: 'POST' });
      const d = await res.json();
      if (d.success) { alert(`백업 완료: ${d.message}`); load(); }
      else alert(`백업 실패: ${d.error || ''}`);
    } catch { alert('백업 오류'); }
    finally { setBacking(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;
  if (!data) return <div className="text-center py-20 text-red-400">데이터를 불러올 수 없습니다.</div>;

  const tableNames: Record<string, string> = {
    users: '회원', postmen: '포스트맨', interactions: '소통기록',
    dailyLogs: '데일리로그', weeklyPlans: '위클리플랜', notices: '공지', adminLogs: '관리자로그'
  };

  const totalRecords = Object.values(data.db.tables).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">스토리지 관리</h1>
        <button onClick={load} className="text-sm text-blue-500 hover:underline">새로고침</button>
      </div>

      {/* 스토리지 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-blue-600">{data.db.size}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">DB 크기</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-green-600">{totalRecords}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">총 레코드</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-purple-600">{data.disk.used}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">디스크 사용</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow text-center">
          <div className="text-2xl font-bold text-orange-600">{data.backups.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">백업 파일</div>
        </div>
      </div>

      {/* 디스크 사용량 바 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold dark:text-white">디스크 사용량</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{data.disk.used} / {data.disk.total}</span>
        </div>
        <div className="w-full h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${data.disk.usage > 80 ? 'bg-red-500' : data.disk.usage > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(data.disk.usage, 100)}%` }}
          />
        </div>
        <div className="text-right text-sm mt-1 dark:text-gray-300">{data.disk.usage}% 사용 중</div>
      </div>

      {/* 테이블별 데이터 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow">
        <h2 className="font-bold text-lg mb-4 dark:text-white">테이블별 데이터</h2>
        <div className="space-y-3">
          {Object.entries(data.db.tables).map(([key, count]) => {
            const percent = totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="dark:text-gray-300">{tableNames[key] || key}</span>
                  <span className="text-gray-500 dark:text-gray-400">{count}건 ({percent}%)</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 백업 관리 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg dark:text-white">백업 관리</h2>
          <button
            onClick={handleBackup}
            disabled={backing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {backing ? '백업 중...' : '수동 백업'}
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {data.backups.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm text-center">백업 파일 없음</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.backups.map((b, i) => (
                <div key={i} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-blue-500">💾</span>
                    <span className="text-sm dark:text-white truncate">{b.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <span>{b.size}</span>
                    <span>{b.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 관리자 활동 로그 */}
      <div>
        <h2 className="font-bold text-lg mb-3 dark:text-white">최근 관리 활동</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          {data.recentLogs.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm text-center">활동 로그 없음</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.recentLogs.map((log, i) => (
                <div key={i} className="p-3 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium dark:text-white">{log.action}</div>
                    {log.detail && <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.detail}</div>}
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(log.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
