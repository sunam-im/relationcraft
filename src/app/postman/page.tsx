'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Postman = {
  id: string; name: string; company: string | null; position: string | null;
  phone: string | null; email: string | null; category: string;
  lastContact: string | null; giveScore: number; takeScore: number; relationScore?: number;
  profileImage: string | null;
};

export default function PostmanPage() {
  const [postmen, setPostmen] = useState<Postman[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('name');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPostmen(); }, []);

  const loadPostmen = async () => {
    try {
      const res = await fetch('/api/postman');
      const data = await res.json();
      if (data.success) setPostmen(data.data);
    } catch (e) {
      console.error('Failed to load postmen:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => { window.location.href = '/api/postman/export'; };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/postman/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        alert(`가져오기 완료!\n성공: ${data.data.successCount}명\n실패: ${data.data.failCount}명`);
        loadPostmen();
      } else {
        alert('가져오기 실패: ' + data.error);
      }
    } catch (err) {
      alert('가져오기 중 오류 발생');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const categories = ['전체', ...Array.from(new Set(postmen.map(p => p.category)))];

  const filteredPostmen = postmen
    .filter(p => {
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.company && p.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.position && p.position.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = categoryFilter === '전체' || p.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      if (sortBy === 'give') return b.giveScore - a.giveScore;
      if (sortBy === 'take') return b.takeScore - a.takeScore;
      if (sortBy === 'score') return (b.relationScore || 0) - (a.relationScore || 0);
      return 0;
    });

  // 즐겨찾기 (포스트맨 플러스)
  const favorites = filteredPostmen.filter(p => p.category === '포스트맨 플러스');
  const normals = filteredPostmen.filter(p => p.category !== '포스트맨 플러스');

  if (loading) return <div className="container mx-auto p-8 text-center">로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 min-h-screen">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold dark:text-white">포스트맨 <span className="text-gray-400 font-normal text-base">{filteredPostmen.length}</span></h1>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2" title="CSV 내보내기">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2" title="CSV 가져오기">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" />
            <Link href="/postman/new" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2" title="추가">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            </Link>
          </div>
        </div>

        {/* 검색 */}
        <div className="px-4 pb-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="이름, 회사, 직책 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 정렬 탭 */}
        <div className="flex px-4 pb-2 gap-4 text-sm">
          <button onClick={() => setCategoryFilter('전체')} className={`pb-1 ${categoryFilter === '전체' ? 'text-black dark:text-white font-bold border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>전체</button>
          {categories.filter(c => c !== '전체').map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={`pb-1 ${categoryFilter === cat ? 'text-black dark:text-white font-bold border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>{cat}</button>
          ))}
          <div className="ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none focus:outline-none">
              <option value="name">가나다순</option>
              <option value="give">Give순</option>
              <option value="take">Take순</option>
                    <option value="score">관계점수순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 포스트맨 플러스 (즐겨찾기) */}
      {categoryFilter === '전체' && favorites.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-850">포스트맨 플러스 {favorites.length}</div>
          {favorites.map(postman => (
            <PostmanRow key={postman.id} postman={postman} />
          ))}
        </div>
      )}

      {/* 일반 포스트맨 */}
      <div>
        {categoryFilter === '전체' && favorites.length > 0 && (
          <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-850">포스트맨 {normals.length}</div>
        )}
        {(categoryFilter === '전체' ? normals : filteredPostmen).length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-400 mb-4">등록된 포스트맨이 없습니다</p>
            <Link href="/postman/new" className="text-blue-500 text-sm">+ 첫 포스트맨 추가하기</Link>
          </div>
        ) : (
          (categoryFilter === '전체' ? normals : filteredPostmen).map(postman => (
            <PostmanRow key={postman.id} postman={postman} />
          ))
        )}
      </div>
    </div>
  );
}

function PostmanRow({ postman }: { postman: Postman }) {
  const subText = [postman.company, postman.position].filter(Boolean).join(' · ');

  return (
    <Link href={`/postman/${postman.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition border-b border-gray-100 dark:border-gray-800">
      {/* 프로필 이미지 */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 flex-shrink-0 flex items-center justify-center">
        {postman.profileImage ? (
          <img src={postman.profileImage} alt={postman.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-gray-500 dark:text-gray-300">{postman.name.charAt(0)}</span>
        )}
      </div>
      {/* 이름 + 회사/직책 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[15px] dark:text-white truncate">{postman.name}</span>
          {postman.category === '포스트맨 플러스' && <span className="text-yellow-500 text-xs">★</span>}
        </div>
        {subText && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subText}</p>}
      </div>
      {/* Give/Take 뱃지 */}
      {(postman.giveScore > 0 || postman.takeScore > 0) && (
        <div className="flex gap-1 flex-shrink-0">
          {postman.giveScore > 0 && <span className="text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-500 px-1.5 py-0.5 rounded">G{postman.giveScore}</span>}
          {postman.takeScore > 0 && <span className="text-[11px] bg-green-50 dark:bg-green-900/30 text-green-500 px-1.5 py-0.5 rounded">T{postman.takeScore}</span>}
        </div>
      )}
      {/* 관계 점수 */}
      <div className={`text-[11px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${(postman.relationScore || 0) >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : (postman.relationScore || 0) >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
        ♥{postman.relationScore || 0}
      </div>
    </Link>
  );
}

