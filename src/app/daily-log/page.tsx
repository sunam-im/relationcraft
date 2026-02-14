'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded px-3 py-2 min-h-[200px] bg-gray-50 text-gray-400">
      에디터 로딩 중...
    </div>
  ),
});

function DailyLogContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState('');
  const [content, setContent] = useState('');
  const [goals, setGoals] = useState('');
  const [achievements, setAchievements] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [letterCount, setLetterCount] = useState('0');
  const [callCount, setCallCount] = useState('0');
  const [snsCount, setSnsCount] = useState('0');
  const [giftCount, setGiftCount] = useState('0');
  const [insight, setInsight] = useState('');
  const [productiveWork, setProductiveWork] = useState('');
  const [infoToConvey, setInfoToConvey] = useState('');
  const [infoRecipient, setInfoRecipient] = useState('');
  const [successReason, setSuccessReason] = useState('');
  const [myStrengths, setMyStrengths] = useState('');
  const [habitsToDiscard, setHabitsToDiscard] = useState('');
  const [todayAchievement, setTodayAchievement] = useState('');
  const [achievementSource, setAchievementSource] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('diary');

  useEffect(() => {
    setMounted(true);
    const dateParam = searchParams.get('date');
    setSelectedDate(dateParam || getTodayDate());
  }, [searchParams]);

  useEffect(() => {
    if (selectedDate) loadDailyLog();
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
        setBookTitle(data.data.bookTitle || '');
        setLetterCount(String(data.data.letterCount || 0));
        setCallCount(String(data.data.callCount || 0));
        setSnsCount(String(data.data.snsCount || 0));
        setGiftCount(String(data.data.giftCount || 0));
        setInsight(data.data.insight || '');
        setProductiveWork(data.data.productiveWork || '');
        setInfoToConvey(data.data.infoToConvey || '');
        setInfoRecipient(data.data.infoRecipient || '');
        setSuccessReason(data.data.successReason || '');
        setMyStrengths(data.data.myStrengths || '');
        setHabitsToDiscard(data.data.habitsToDiscard || '');
        setTodayAchievement(data.data.todayAchievement || '');
        setAchievementSource(data.data.achievementSource || '');
        setGratitude(data.data.gratitude || '');
      } else {
        setContent(''); setGoals(''); setAchievements('');
        setBookTitle(''); setLetterCount('0'); setCallCount('0');
        setSnsCount('0'); setGiftCount('0'); setInsight('');
        setProductiveWork(''); setInfoToConvey(''); setInfoRecipient('');
        setSuccessReason(''); setMyStrengths(''); setHabitsToDiscard('');
        setTodayAchievement(''); setAchievementSource(''); setGratitude('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveDailyLog = async () => {
    if (!content.trim()) { alert('오늘의 일기를 작성해주세요'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/daily-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate, content, goals, achievements,
          bookTitle, letterCount, callCount, snsCount, giftCount,
          insight, productiveWork, infoToConvey, infoRecipient,
          successReason, myStrengths, habitsToDiscard,
          todayAchievement, achievementSource, gratitude
        })
      });
      const data = await res.json();
      if (data.success) alert('저장되었습니다!');
      else alert('저장 실패: ' + data.error);
    } catch (e) {
      alert('저장 중 오류 발생');
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  };

  if (!mounted) return null;

  const sections = [
    { key: 'diary', label: '일기', icon: '📝' },
    { key: 'comm', label: '소통', icon: '💬' },
    { key: 'growth', label: '성장', icon: '🌱' },
    { key: 'reflect', label: '성찰', icon: '🪞' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/daily-log/list" className="text-blue-500 text-sm">← 목록</Link>
        <h1 className="text-lg font-bold dark:text-white">데일리 로그</h1>
        <Link href="/" className="text-blue-500 text-sm">홈</Link>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm mb-4">
        <button onClick={() => changeDate(-1)} className="text-xl px-2">◀</button>
        <div className="text-center">
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent text-center font-semibold dark:text-white focus:outline-none" />
          <div className="text-xs text-gray-500">{formatDate(selectedDate)}</div>
        </div>
        <button onClick={() => changeDate(1)} className="text-xl px-2">▶</button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              activeSection === s.key
                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">불러오는 중...</div>
      ) : (
        <div className="space-y-4">
          {/* 일기 섹션 */}
          {activeSection === 'diary' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">📖 오늘의 일기</label>
                <RichEditor content={content} onChange={setContent} />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🎯 오늘의 목표</label>
                <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={3}
                  placeholder="오늘 달성하고 싶은 목표..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">✅ 오늘의 성과</label>
                <textarea value={achievements} onChange={e => setAchievements(e.target.value)} rows={3}
                  placeholder="오늘 이룬 성과..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">📚 읽은 책</label>
                <input type="text" value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                  placeholder="오늘 읽은 책 제목"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {/* 소통 섹션 */}
          {activeSection === 'comm' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">📊 오늘의 소통 기록</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">✉️</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">편지/카톡</div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setLetterCount(String(Math.max(0, parseInt(letterCount)-1)))} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-sm">-</button>
                      <span className="text-lg font-bold dark:text-white w-8 text-center">{letterCount}</span>
                      <button onClick={() => setLetterCount(String(parseInt(letterCount)+1))} className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm">+</button>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">📞</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">통화</div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setCallCount(String(Math.max(0, parseInt(callCount)-1)))} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-sm">-</button>
                      <span className="text-lg font-bold dark:text-white w-8 text-center">{callCount}</span>
                      <button onClick={() => setCallCount(String(parseInt(callCount)+1))} className="w-7 h-7 rounded-full bg-green-500 text-white text-sm">+</button>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">📱</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">SNS/댓글</div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSnsCount(String(Math.max(0, parseInt(snsCount)-1)))} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-sm">-</button>
                      <span className="text-lg font-bold dark:text-white w-8 text-center">{snsCount}</span>
                      <button onClick={() => setSnsCount(String(parseInt(snsCount)+1))} className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm">+</button>
                    </div>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">🎁</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">선물</div>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setGiftCount(String(Math.max(0, parseInt(giftCount)-1)))} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-sm">-</button>
                      <span className="text-lg font-bold dark:text-white w-8 text-center">{giftCount}</span>
                      <button onClick={() => setGiftCount(String(parseInt(giftCount)+1))} className="w-7 h-7 rounded-full bg-pink-500 text-white text-sm">+</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">📨 전달할 정보</label>
                <textarea value={infoToConvey} onChange={e => setInfoToConvey(e.target.value)} rows={2}
                  placeholder="전달할 정보 내용..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <input type="text" value={infoRecipient} onChange={e => setInfoRecipient(e.target.value)}
                  placeholder="전달 대상 (이름)"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {/* 성장 섹션 */}
          {activeSection === 'growth' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">💡 오늘의 깨달음</label>
                <textarea value={insight} onChange={e => setInsight(e.target.value)} rows={3}
                  placeholder="오늘 깨달은 것..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">⚡ 생산적 업무</label>
                <textarea value={productiveWork} onChange={e => setProductiveWork(e.target.value)} rows={3}
                  placeholder="오늘 한 생산적인 일..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🏆 오늘의 성과</label>
                <textarea value={todayAchievement} onChange={e => setTodayAchievement(e.target.value)} rows={2}
                  placeholder="오늘의 성과..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
                <input type="text" value={achievementSource} onChange={e => setAchievementSource(e.target.value)}
                  placeholder="성과의 출처/원인"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {/* 성찰 섹션 */}
          {activeSection === 'reflect' && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🌟 성공이유</label>
                <textarea value={successReason} onChange={e => setSuccessReason(e.target.value)} rows={3}
                  placeholder="오늘 성공한 이유..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">💪 나의 강점</label>
                <textarea value={myStrengths} onChange={e => setMyStrengths(e.target.value)} rows={2}
                  placeholder="오늘 발견한 나의 강점..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🗑️ 버릴 습관</label>
                <textarea value={habitsToDiscard} onChange={e => setHabitsToDiscard(e.target.value)} rows={2}
                  placeholder="버려야 할 습관..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">🙏 감사 표현</label>
                <textarea value={gratitude} onChange={e => setGratitude(e.target.value)} rows={3}
                  placeholder="오늘 감사한 것..."
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {/* Save Button */}
          <button onClick={saveDailyLog} disabled={saving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition shadow-sm">
            {saving ? '저장 중...' : '💾 저장하기'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function DailyLogPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">로딩 중...</div>}>
      <DailyLogContent />
    </Suspense>
  );
}
