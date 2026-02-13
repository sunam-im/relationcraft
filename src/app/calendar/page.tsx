'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Link from 'next/link';

moment.locale('ko');
const localizer = momentLocalizer(moment);

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'interaction' | 'dailyLog';
  subType: string | null;
  category: string | null;
  description: string;
  postmanName: string | null;
  postmanCompany: string | null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      const data = await res.json();
      if (data.success) {
        const parsed = data.data.map((item: CalendarEvent) => ({
          ...item,
          start: new Date(item.start),
          end: new Date(item.end),
        }));
        setEvents(parsed);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#6B7280';

    if (event.type === 'dailyLog') {
      backgroundColor = '#F59E0B';
    } else if (event.subType === 'GIVE') {
      backgroundColor = '#3B82F6';
    } else if (event.subType === 'TAKE') {
      backgroundColor = '#10B981';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-20 text-gray-500">캘린더를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">캘린더</h1>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Give
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Take
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span> 데일리 로그
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6" style={{ height: '700px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          defaultView={Views.MONTH}
          messages={{
            today: '오늘',
            previous: '이전',
            next: '다음',
            month: '월',
            week: '주',
            day: '일',
            noEventsInRange: '이 기간에 기록이 없습니다',
          }}
        />
      </div>

      {/* 이벤트 상세 모달 */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">
                {selectedEvent.type === 'dailyLog' ? '데일리 로그' : '상호작용 기록'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">날짜</span>
                <p className="font-semibold">
                  {selectedEvent.start.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>

              {selectedEvent.type === 'interaction' && (
                <>
                  <div>
                    <span className="text-sm text-gray-500">유형</span>
                    <p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          selectedEvent.subType === 'GIVE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {selectedEvent.subType}
                      </span>
                      <span className="ml-2 text-sm">{selectedEvent.category}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">포스트맨</span>
                    <p className="font-semibold">
                      {selectedEvent.postmanName}
                      {selectedEvent.postmanCompany && (
                        <span className="text-gray-400 text-sm ml-1">
                          ({selectedEvent.postmanCompany})
                        </span>
                      )}
                    </p>
                  </div>
                </>
              )}

              <div>
                <span className="text-sm text-gray-500">내용</span>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
