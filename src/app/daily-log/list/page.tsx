'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type DailyLog = {
  id: string;
  date: string;
  content: string;
  goals: string | null;
  achievements: string | null;
  createdAt: string;
};

export default function DailyLogListPage() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/daily-log');
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // HTML 태그 제거 (리치 에디터 내용에서 텍스트만 추출)
  function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // 미리보기 텍스트 (최대 100자)
  function getPreview(text: string, maxLength: number = 100): string {
    const plain = stripHtml(text);
    if (plain.length <= maxLength) return plain;
    return plain.substring(0, maxLength) + '...';
  }

  if (loading) {
    return <div className="container mx-auto p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">데일리 로그 목록</h1>
        <Link
          href="/daily-log"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 오늘 로그 작성
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">아직 작성된 데일리 로그가 없습니다</p>
          <Link href="/daily-log" className="text-blue-500 hover:underline">
            첫 데일리 로그 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const dateObj = new Date(log.date);
            const dateStr = dateObj.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            });
            const queryDate = dateObj.toISOString().split('T')[0];

            return (
              <Link
                key={log.id}
                href={`/daily-log?date=${queryDate}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-bold text-gray-800">{dateStr}</h2>
                </div>

                {log.goals && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      목표
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{getPreview(log.goals, 80)}</p>
                  </div>
                )}

                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    기록
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{getPreview(log.content)}</p>
                </div>

                {log.achievements && (
                  <div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      성과
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{getPreview(log.achievements, 80)}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        총 {logs.length}개의 기록
      </div>
    </div>
  );
}
