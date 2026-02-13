'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ChartTest() {
  const data = [
    { month: '1월', Give: 20, Take: 15 },
    { month: '2월', Give: 25, Take: 20 },
    { month: '3월', Give: 30, Take: 28 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Recharts 테스트</h1>
      <div className="w-full h-[400px] border border-gray-300 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Give" fill="#8884d8" />
            <Bar dataKey="Take" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
