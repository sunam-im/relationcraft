'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useState, useEffect } from 'react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function CalendarTest() {
  const [mounted, setMounted] = useState(false);
  const [events] = useState([
    {
      title: '김철수님 미팅',
      start: new Date(2024, 1, 15, 10, 0),
      end: new Date(2024, 1, 15, 11, 0),
    },
    {
      title: '이영희님 점심',
      start: new Date(2024, 1, 16, 12, 0),
      end: new Date(2024, 1, 16, 13, 0),
    },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-4">Calendar loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">react-big-calendar 테스트</h1>
      <div className="h-[600px] border border-gray-300 rounded-lg p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}

