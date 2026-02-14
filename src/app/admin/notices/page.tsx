'use client';

import { useState, useEffect } from 'react';

type Notice = {
  id: string; title: string; content: string; isActive: boolean;
  createdAt: string; updatedAt: string;
};

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = () => {
    fetch('/api/admin/notices')
      .then(r => r.json())
      .then(d => { if (d.success) setNotices(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { alert('제목과 내용을 입력하세요'); return; }

    if (editId) {
      const res = await fetch(`/api/admin/notices/${editId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const d = await res.json();
      if (d.success) { load(); resetForm(); }
    } else {
      const res = await fetch('/api/admin/notices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const d = await res.json();
      if (d.success) { load(); resetForm(); }
    }
  };

  const handleEdit = (n: Notice) => {
    setEditId(n.id); setTitle(n.title); setContent(n.content); setShowForm(true);
  };

  const handleToggle = async (n: Notice) => {
    const res = await fetch(`/api/admin/notices/${n.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !n.isActive })
    });
    const d = await res.json();
    if (d.success) load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' });
    const d = await res.json();
    if (d.success) load();
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null); setTitle(''); setContent('');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white">공지 관리</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          {showForm ? '취소' : '+ 새 공지'}
        </button>
      </div>

      {/* 작성/수정 폼 */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold dark:text-white">{editId ? '공지 수정' : '새 공지 작성'}</h2>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="공지 제목"
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="공지 내용..."
            rows={5}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
              {editId ? '수정' : '등록'}
            </button>
            <button onClick={resetForm} className="bg-gray-200 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {notices.length === 0 ? (
        <div className="text-center py-20 text-gray-400">등록된 공지가 없습니다</div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-l-4 ${n.isActive ? 'border-blue-500' : 'border-gray-300'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold dark:text-white">{n.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${n.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {n.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{n.content}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleToggle(n)}
                    className={`text-xs px-2 py-1 rounded ${n.isActive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                    {n.isActive ? '숨김' : '표시'}
                  </button>
                  <button onClick={() => handleEdit(n)} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200">수정</button>
                  <button onClick={() => handleDelete(n.id)} className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200">삭제</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
