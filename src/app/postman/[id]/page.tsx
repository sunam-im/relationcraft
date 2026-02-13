'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Postman = {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  phone: string | null;
  email: string | null;
  category: string;
  giveScore: number;
  takeScore: number;
  lastContact: string | null;
};

type Interaction = {
  id: string;
  type: string;
  category: string;
  description: string;
  date: string;
};

export default function PostmanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [postman, setPostman] = useState<Postman | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newInteraction, setNewInteraction] = useState({
    type: 'GIVE',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [postmanRes, interactionsRes] = await Promise.all([
        fetch(`/api/postman/${id}`),
        fetch(`/api/interaction?postmanId=${id}`)
      ]);

      const postmanData = await postmanRes.json();
      const interactionsData = await interactionsRes.json();

      if (postmanData.success) setPostman(postmanData.data);
      if (interactionsData.success) setInteractions(interactionsData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInteraction = async () => {
    if (!newInteraction.category || !newInteraction.description) {
      alert('카테고리와 내용을 입력하세요');
      return;
    }

    try {
      const res = await fetch('/api/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postmanId: id,
          ...newInteraction
        })
      });

      const data = await res.json();
      if (data.success) {
        setNewInteraction({
          type: 'GIVE',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        setShowAddForm(false);
        loadData();
      }
    } catch (error) {
      console.error('Failed to add interaction:', error);
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/interaction/${interactionId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete interaction:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">로딩 중...</div>;
  }

  if (!postman) {
    return <div className="container mx-auto p-8">포스트맨을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/postman" className="text-blue-500 hover:underline">
          ← 목록으로
        </Link>
      </div>

      {/* 포스트맨 정보 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{postman.name}</h1>
            <p className="text-gray-600">{postman.company} {postman.position && `· ${postman.position}`}</p>
            {postman.phone && <p className="text-gray-600 mt-1">📞 {postman.phone}</p>}
            {postman.email && <p className="text-gray-600">✉️ {postman.email}</p>}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/postman/${id}/edit`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              수정
            </Link>
          </div>
        </div>

        {/* Give & Take 점수 */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Give</div>
            <div className="text-3xl font-bold text-blue-600">{postman.giveScore}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Take</div>
            <div className="text-3xl font-bold text-green-600">{postman.takeScore}</div>
          </div>
        </div>
      </div>

      {/* 상호작용 기록 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">상호작용 기록</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + 기록 추가
          </button>
        </div>

        {/* 기록 추가 폼 */}
        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-semibold mb-1">유형</label>
                <select
                  value={newInteraction.type}
                  onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="GIVE">GIVE (내가 준 것)</option>
                  <option value="TAKE">TAKE (받은 것)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">카테고리</label>
                <input
                  type="text"
                  value={newInteraction.category}
                  onChange={(e) => setNewInteraction({...newInteraction, category: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="예: 식사, 소개, 정보제공"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">내용</label>
              <textarea
                value={newInteraction.description}
                onChange={(e) => setNewInteraction({...newInteraction, description: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="상호작용 내용을 자세히 입력하세요"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-1">날짜</label>
              <input
                type="date"
                value={newInteraction.date}
                onChange={(e) => setNewInteraction({...newInteraction, date: e.target.value})}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddInteraction}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                저장
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 기록 목록 */}
        {interactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">아직 기록이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {interactions.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.type === 'GIVE' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-sm font-semibold">{item.category}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteInteraction(item.id)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
