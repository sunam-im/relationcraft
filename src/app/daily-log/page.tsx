'use client';

import { useState, useEffect } from 'react';

export default function DailyLogPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [content, setContent] = useState('');
  const [goals, setGoals] = useState('');
  const [achievements, setAchievements] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDailyLog();
  }, [selectedDate]);

  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  const loadDailyLog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-log?date=${selectedDate}`);
      const data = await res.json();
      if (data.success && data.data) {
        setContent(data.data.content || '');
        setGoals(data.data.goals || '');
        setAchievements(data.data.achievements || '');
      } else {
        setContent('');
        setGoals('');
        setAchievements('');
      }
    } catch (error) {
      console.error('Failed to load daily log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          content,
          goals,
          achievements
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('저장되었습니다!');
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to save daily log:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">데일리 로그</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">오늘의 목표</h2>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="오늘 달성하고 싶은 목표를 작성하세요"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">오늘의 기록</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="오늘 있었던 일을 자유롭게 작성하세요"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">오늘의 성과</h2>
          <textarea
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="오늘 달성한 것들을 기록하세요"
          />
        </div>

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
