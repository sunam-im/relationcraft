'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // CSV 내보내기
  const handleExport = () => {
    window.location.href = '/api/postman/export';
  };

  // CSV 가져오기
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/postman/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const { successCount, failCount, errors } = data.data;
        let message = `가져오기 완료!\n성공: ${successCount}명`;
        if (failCount > 0) {
          message += `\n실패: ${failCount}건`;
          if (errors.length > 0) {
            message += '\n\n오류 내용:\n' + errors.join('\n');
          }
        }
        alert(message);
        fetchPostmen();
      } else {
        alert('가져오기 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to import:', error);
      alert('가져오기 중 오류가 발생했습니다.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 검색 + 필터 + 정렬 적용
  const filteredPostmen = postmen
    .filter((person) => {
      const matchSearch =
        searchQuery === '' ||
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.company && person.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (person.position && person.position.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        categoryFilter === '전체' || person.category === categoryFilter;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'giveScore') return b.giveScore - a.giveScore;
      if (sortBy === 'takeScore') return b.takeScore - a.takeScore;
      if (sortBy === 'totalScore')
        return (b.giveScore + b.takeScore) - (a.giveScore + a.takeScore);
      return 0;
    });

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">포스트맨 100명</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
          >
            CSV 내보내기
          </button>
          <label className={`bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 text-sm cursor-pointer ${importing ? 'opacity-50' : ''}`}>
            {importing ? '가져오는 중...' : 'CSV 가져오기'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
          <Link
            href="/postman/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            + 포스트맨 추가
          </Link>
        </div>
      </div>

      {/* 검색 / 필터 / 정렬 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 회사, 직책으로 검색..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="전체">전체 카테고리</option>
              <option value="포스트맨">포스트맨</option>
              <option value="포스트맨 플러스">포스트맨 플러스</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt">최근 수정순</option>
              <option value="name">이름순</option>
              <option value="giveScore">Give 높은순</option>
              <option value="takeScore">Take 높은순</option>
              <option value="totalScore">활동 많은순</option>
            </select>
          </div>
          {(searchQuery || categoryFilter !== '전체') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('전체');
                setSortBy('updatedAt');
              }}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              초기화
            </button>
          )}
        </div>
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
      ) : filteredPostmen.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">검색 결과가 없습니다</p>
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
              {filteredPostmen.map((person) => (
                <tr key={person.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/postman/${person.id}`} className="text-blue-600 hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{person.company || '-'}</td>
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
        {searchQuery || categoryFilter !== '전체'
          ? `검색 결과: ${filteredPostmen.length}명 / 전체 ${postmen.length}명`
          : `총 ${postmen.length}명 / 100명`}
      </div>
    </div>
  );
}
