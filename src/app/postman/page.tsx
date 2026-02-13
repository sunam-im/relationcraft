'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Postman = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  category: string;
  lastContact: string | null;
  giveScore: number;
  takeScore: number;
};

export default function PostmanPage() {
  const [postmen, setPostmen] = useState<Postman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostmen();
  }, []);

  const fetchPostmen = async () => {
    try {
      const res = await fetch('/api/postman');
      const data = await res.json();
      if (data.success) {
        setPostmen(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch postmen:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePostman = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/postman/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPostmen();
      }
    } catch (error) {
      console.error('Failed to delete postman:', error);
    }
  };

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">포스트맨 100명</h1>
        <Link 
          href="/postman/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + 포스트맨 추가
        </Link>
      </div>

      {postmen.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">아직 포스트맨이 없습니다</p>
          <Link 
            href="/postman/new"
            className="text-blue-500 hover:underline"
          >
            첫 포스트맨 추가하기
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">이름</th>
                <th className="px-4 py-3 text-left font-semibold">회사</th>
                <th className="px-4 py-3 text-left font-semibold">직책</th>
                <th className="px-4 py-3 text-left font-semibold">구분</th>
                <th className="px-4 py-3 text-center font-semibold">Give</th>
                <th className="px-4 py-3 text-center font-semibold">Take</th>
                <th className="px-4 py-3 text-center font-semibold">액션</th>
              </tr>
            </thead>
            <tbody>
              {postmen.map((person) => (
                <tr key={person.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
  <Link href={`/postman/${person.id}`} className="text-blue-600 hover:underline">
    {person.name}
  </Link>
</td><td className="px-4 py-3">{person.company || '-'}</td>
                  <td className="px-4 py-3">{person.position || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      person.category === '포스트맨 플러스' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {person.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{person.giveScore}</td>
                  <td className="px-4 py-3 text-center">{person.takeScore}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/postman/${person.id}`}
                      className="text-blue-500 hover:underline mr-3"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => deletePostman(person.id)}
                      className="text-red-500 hover:underline"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        총 {postmen.length}명 / 100명
      </div>
    </div>
  );
}
