'use client';

import { useState, useEffect } from 'react';

type Status = 'TODO' | 'DOING' | 'DONE';

export default function WeeklyPlanPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [mounted, setMounted] = useState(false);
  const [plan1, setPlan1] = useState('');
  const [plan2, setPlan2] = useState('');
  const [plan3, setPlan3] = useState('');
  const [status1, setStatus1] = useState<Status>('TODO');
  const [status2, setStatus2] = useState<Status>('TODO');
  const [status3, setStatus3] = useState<Status>('TODO');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

useEffect(() => {
  setMounted(true);
  setWeekStart(getWeekStart());
}, []);

useEffect(() => {
  if (weekStart) {
    loadWeeklyPlan();
  }
}, [weekStart]);
  function getWeekStart(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  function getWeekEnd(weekStart: string): string {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + 6);
    return start.toISOString().split('T')[0];
  }

  function goToPreviousWeek() {
    const start = new Date(weekStart);
    start.setDate(start.getDate() - 7);
    setWeekStart(start.toISOString().split('T')[0]);
  }

  function goToNextWeek() {
    const start = new Date(weekStart);
    start.setDate(start.getDate() + 7);
    setWeekStart(start.toISOString().split('T')[0]);
  }

  function goToThisWeek() {
    setWeekStart(getWeekStart());
  }

  const loadWeeklyPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weekly-plan?weekStart=${weekStart}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPlan1(data.data.plan1 || '');
        setPlan2(data.data.plan2 || '');
        setPlan3(data.data.plan3 || '');
        setStatus1(data.data.status1 || 'TODO');
        setStatus2(data.data.status2 || 'TODO');
        setStatus3(data.data.status3 || 'TODO');
      } else {
        setPlan1('');
        setPlan2('');
        setPlan3('');
        setStatus1('TODO');
        setStatus2('TODO');
        setStatus3('TODO');
      }
    } catch (error) {
      console.error('Failed to load weekly plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart,
          plan1,
          plan2,
          plan3,
          status1,
          status2,
          status3
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('저장되었습니다!');
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to save weekly plan:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const StatusButton = ({ status, onChange }: { status: Status; onChange: (s: Status) => void }) => {
    const getButtonClass = (s: Status) => {
      const base = 'px-3 py-1 rounded text-sm font-semibold';
      if (status === s) {
        if (s === 'TODO') return `${base} bg-gray-500 text-white`;
        if (s === 'DOING') return `${base} bg-blue-500 text-white`;
        if (s === 'DONE') return `${base} bg-green-500 text-white`;
      }
      return `${base} bg-gray-200 text-gray-600 hover:bg-gray-300`;
    };

    return (
      <div className="flex gap-2">
        <button onClick={() => onChange('TODO')} className={getButtonClass('TODO')}>
          TODO
        </button>
        <button onClick={() => onChange('DOING')} className={getButtonClass('DOING')}>
          DOING
        </button>
        <button onClick={() => onChange('DONE')} className={getButtonClass('DONE')}>
          DONE
        </button>
      </div>
    );
  };

if (loading || !mounted) {
  return <div className="container mx-auto p-8">로딩 중...</div>;
}

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Weekly 3 Plan</h1>
        <div className="flex items-center gap-4">
          <button onClick={goToPreviousWeek} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            ← 이전 주
          </button>
          <button onClick={goToThisWeek} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            이번 주
          </button>
          <button onClick={goToNextWeek} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            다음 주 →
          </button>
          <div className="ml-auto text-lg font-semibold">
            {weekStart} ~ {getWeekEnd(weekStart)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Plan 1 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Plan 1</h2>
            <StatusButton status={status1} onChange={setStatus1} />
          </div>
          <textarea
            value={plan1}
            onChange={(e) => setPlan1(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="이번 주 첫 번째 목표를 작성하세요"
          />
        </div>

        {/* Plan 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Plan 2</h2>
            <StatusButton status={status2} onChange={setStatus2} />
          </div>
          <textarea
            value={plan2}
            onChange={(e) => setPlan2(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="이번 주 두 번째 목표를 작성하세요"
          />
        </div>

        {/* Plan 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Plan 3</h2>
            <StatusButton status={status3} onChange={setStatus3} />
          </div>
          <textarea
            value={plan3}
            onChange={(e) => setPlan3(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="이번 주 세 번째 목표를 작성하세요"
          />
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 font-semibold"
          >
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
