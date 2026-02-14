'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MeetingData {
  name: string; phone: string; purpose: string; location: string;
  meetDate: string; meetTime: string; myBusiness: string; theirBusiness: string;
  theirInterest: string; isPlus: boolean; mealCheck: string; meetingNote: string; nextAction: string;
}

const emptyMeeting = (): MeetingData => ({
  name: '', phone: '', purpose: '', location: '',
  meetDate: '', meetTime: '', myBusiness: '', theirBusiness: '',
  theirInterest: '', isPlus: false, mealCheck: '', meetingNote: '', nextAction: ''
});

export default function WeeklyPlanPage() {
  const [weekStart, setWeekStart] = useState('');
  const [plans, setPlans] = useState(['', '', '']);
  const [statuses, setStatuses] = useState(['TODO', 'TODO', 'TODO']);
  const [meetings, setMeetings] = useState<MeetingData[]>([emptyMeeting(), emptyMeeting(), emptyMeeting()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setWeekStart(getWeekStart());
  }, []);

  useEffect(() => {
    if (weekStart) loadPlan();
  }, [weekStart]);

  function getWeekStart(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  function getWeekEnd(): string {
    if (!weekStart) return '';
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  function changeWeek(offset: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + offset * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()}`;
  }

  const loadPlan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weekly-plan?weekStart=${weekStart}`);
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        setPlans([p.plan1 || '', p.plan2 || '', p.plan3 || '']);
        setStatuses([p.status1 || 'TODO', p.status2 || 'TODO', p.status3 || 'TODO']);
        setMeetings([
          { name: p.name1||'', phone: p.phone1||'', purpose: p.purpose1||'', location: p.location1||'', meetDate: p.meetDate1||'', meetTime: p.meetTime1||'', myBusiness: p.myBusiness1||'', theirBusiness: p.theirBusiness1||'', theirInterest: p.theirInterest1||'', isPlus: p.isPlus1||false, mealCheck: p.mealCheck1||'', meetingNote: p.meetingNote1||'', nextAction: p.nextAction1||'' },
          { name: p.name2||'', phone: p.phone2||'', purpose: p.purpose2||'', location: p.location2||'', meetDate: p.meetDate2||'', meetTime: p.meetTime2||'', myBusiness: p.myBusiness2||'', theirBusiness: p.theirBusiness2||'', theirInterest: p.theirInterest2||'', isPlus: p.isPlus2||false, mealCheck: p.mealCheck2||'', meetingNote: p.meetingNote2||'', nextAction: p.nextAction2||'' },
          { name: p.name3||'', phone: p.phone3||'', purpose: p.purpose3||'', location: p.location3||'', meetDate: p.meetDate3||'', meetTime: p.meetTime3||'', myBusiness: p.myBusiness3||'', theirBusiness: p.theirBusiness3||'', theirInterest: p.theirInterest3||'', isPlus: p.isPlus3||false, mealCheck: p.mealCheck3||'', meetingNote: p.meetingNote3||'', nextAction: p.nextAction3||'' },
        ]);
      } else {
        setPlans(['', '', '']);
        setStatuses(['TODO', 'TODO', 'TODO']);
        setMeetings([emptyMeeting(), emptyMeeting(), emptyMeeting()]);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const body: any = {
        weekStart,
        plan1: plans[0], plan2: plans[1], plan3: plans[2],
        status1: statuses[0], status2: statuses[1], status3: statuses[2],
      };
      meetings.forEach((m, i) => {
        const n = i + 1;
        body[`name${n}`] = m.name; body[`phone${n}`] = m.phone;
        body[`purpose${n}`] = m.purpose; body[`location${n}`] = m.location;
        body[`meetDate${n}`] = m.meetDate; body[`meetTime${n}`] = m.meetTime;
        body[`myBusiness${n}`] = m.myBusiness; body[`theirBusiness${n}`] = m.theirBusiness;
        body[`theirInterest${n}`] = m.theirInterest; body[`isPlus${n}`] = m.isPlus;
        body[`mealCheck${n}`] = m.mealCheck;
        body[`meetingNote${n}`] = m.meetingNote;
        body[`nextAction${n}`] = m.nextAction;
      });
      const res = await fetch('/api/weekly-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) alert('저장되었습니다!');
      else alert('저장 실패');
    } catch (e) { alert('오류 발생'); }
    finally { setSaving(false); }
  };

  const updateMeeting = (idx: number, field: keyof MeetingData, value: any) => {
    const updated = [...meetings];
    (updated[idx] as any)[field] = value;
    setMeetings(updated);
  };

  const statusColors: Record<string, string> = {
    'TODO': 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300',
    'DOING': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'DONE': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
  };

  const tabLabels = ['1번째 만남', '2번째 만남', '3번째 만남'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-blue-500 text-sm">← 홈</Link>
        <h1 className="text-lg font-bold dark:text-white">위클리 3 플랜</h1>
        <div className="w-10" />
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm mb-4">
        <button onClick={() => changeWeek(-1)} className="text-xl px-2">◀</button>
        <div className="text-center">
          <div className="font-semibold dark:text-white">{weekStart && `${formatDate(weekStart)} ~ ${formatDate(getWeekEnd())}`}</div>
          <div className="text-xs text-gray-500">이번 주 3명 만남 계획</div>
        </div>
        <button onClick={() => changeWeek(1)} className="text-xl px-2">▶</button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">불러오는 중...</div>
      ) : (
        <div className="space-y-4">
          {/* Meeting Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {tabLabels.map((label, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === i
                    ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {meetings[i].name ? `👤 ${meetings[i].name}` : `${i+1}번째`}
              </button>
            ))}
          </div>

          {/* Plan summary for active tab */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">📋 만남 계획 메모</label>
              <select value={statuses[activeTab]}
                onChange={e => { const s = [...statuses]; s[activeTab] = e.target.value; setStatuses(s); }}
                className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[statuses[activeTab]]}`}>
                <option value="TODO">TODO</option>
                <option value="DOING">진행중</option>
                <option value="DONE">완료</option>
              </select>
            </div>
            <textarea value={plans[activeTab]}
              onChange={e => { const p = [...plans]; p[activeTab] = e.target.value; setPlans(p); }}
              rows={2} placeholder={`${activeTab+1}번째 만남 계획...`}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Meeting Detail Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
              👤 {activeTab+1}번째 만남 상세
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">이름</label>
                <input type="text" value={meetings[activeTab].name}
                  onChange={e => updateMeeting(activeTab, 'name', e.target.value)}
                  placeholder="포스트맨 이름"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">전화번호</label>
                <input type="tel" value={meetings[activeTab].phone}
                  onChange={e => updateMeeting(activeTab, 'phone', e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">만남 목적</label>
              <input type="text" value={meetings[activeTab].purpose}
                onChange={e => updateMeeting(activeTab, 'purpose', e.target.value)}
                placeholder="만남의 목적..."
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">장소</label>
                <input type="text" value={meetings[activeTab].location}
                  onChange={e => updateMeeting(activeTab, 'location', e.target.value)}
                  placeholder="장소"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">날짜</label>
                <input type="date" value={meetings[activeTab].meetDate}
                  onChange={e => updateMeeting(activeTab, 'meetDate', e.target.value)}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">시간</label>
                <input type="time" value={meetings[activeTab].meetTime}
                  onChange={e => updateMeeting(activeTab, 'meetTime', e.target.value)}
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">내 사업 홍보</label>
              <textarea value={meetings[activeTab].myBusiness}
                onChange={e => updateMeeting(activeTab, 'myBusiness', e.target.value)}
                rows={2} placeholder="내 사업 소개/홍보 내용..."
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">포스트맨 사업</label>
              <textarea value={meetings[activeTab].theirBusiness}
                onChange={e => updateMeeting(activeTab, 'theirBusiness', e.target.value)}
                rows={2} placeholder="포스트맨의 사업 내용..."
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">포스트맨 관심사</label>
              <input type="text" value={meetings[activeTab].theirInterest}
                onChange={e => updateMeeting(activeTab, 'theirInterest', e.target.value)}
                placeholder="현재 관심사..."
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={meetings[activeTab].isPlus}
                  onChange={e => updateMeeting(activeTab, 'isPlus', e.target.checked)}
                  className="w-4 h-4 rounded text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">⭐ 포스트맨 PLUS</span>
              </label>
              <select value={meetings[activeTab].mealCheck}
                onChange={e => updateMeeting(activeTab, 'mealCheck', e.target.value)}
                className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm">
                <option value="">식사/커피</option>
                <option value="식사">🍽️ 식사</option>
                <option value="커피">☕ 커피</option>
                <option value="술">🍺 술</option>
                <option value="기타">📌 기타</option>
              </select>
            </div>
          </div>


          {/* 미팅 노트 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 border-b dark:border-gray-700 pb-2">
              📝 미팅 노트
            </h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">만남 후 기록</label>
              <textarea value={meetings[activeTab].meetingNote}
                onChange={e => updateMeeting(activeTab, 'meetingNote', e.target.value)}
                rows={4} placeholder="미팅에서 나눈 이야기, 인상적인 점, 핵심 내용..."
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">다음 액션 아이템</label>
              <input type="text" value={meetings[activeTab].nextAction}
                onChange={e => updateMeeting(activeTab, 'nextAction', e.target.value)}
                placeholder="다음에 해야 할 일 (예: 자료 보내기, 소개 연결 등)"
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>


          

          {/* Save Button */}
          <button onClick={savePlan} disabled={saving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl font-semibold text-sm transition shadow-sm">
            {saving ? '저장 중...' : '💾 저장하기'}
          </button>
        </div>
      )}
    </div>
  );
}
