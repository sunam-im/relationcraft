'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Postman = {
  id: string; name: string; company: string | null; position: string | null;
  phone: string | null; email: string | null; category: string;
  giveScore: number; takeScore: number; lastContact: string | null;
  notes: string | null; profileImage: string | null;
  relationship: string | null;
  age: number | null;
  gender: string | null;
  region: string | null;
  strengths: string | null;
  interests: string | null;
  goals: string | null;
  businessSummary: string | null;
  lifePurpose: string | null;
  meetingCount: number | null;
  communicationMeetings: number | null;
  communicationLetters: number | null;
  communicationSNS: number | null;
  communicationGifts: number | null;
};

type Interaction = {
  id: string; type: string; category: string; description: string; date: string;
};

const INTERACTION_CATEGORIES = ['식사','커피/차','소개','정보제공','도움요청','선물','축하','조언','협업','추천','통화','문자/메시지','방문','기타'];

export default function PostmanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [postman, setPostman] = useState<Postman | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all'|'give'|'take'>('all');
  const [newInteraction, setNewInteraction] = useState({ type: 'GIVE', category: '식사', description: '', date: new Date().toISOString().split('T')[0], customCategory: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        fetch(`/api/postman/${id}`),
        fetch(`/api/interaction?postmanId=${id}`)
      ]);
      const pData = await pRes.json();
      const iData = await iRes.json();
      if (pData.success) setPostman(pData.data);
      if (iData.success) setInteractions(iData.data);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        await fetch(`/api/postman/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileImage: uploadData.data.url })
        });
        loadData();
      } else {
        alert(uploadData.error);
      }
    } catch (err) {
      alert('이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleAddInteraction = async () => {
    const category = newInteraction.category === '기타' ? newInteraction.customCategory : newInteraction.category;
    if (!category || !newInteraction.description) { alert('카테고리와 내용을 입력하세요'); return; }
    try {
      const res = await fetch('/api/interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postmanId: id, type: newInteraction.type, category, description: newInteraction.description, date: newInteraction.date })
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setNewInteraction({ type: 'GIVE', category: '식사', description: '', date: new Date().toISOString().split('T')[0], customCategory: '' });
        loadData();
      }
    } catch (e) { alert('기록 추가 실패'); }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/interaction/${interactionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) loadData();
    } catch (e) { alert('삭제 실패'); }
  };

  const handleDelete = async () => {
    if (!confirm('이 포스트맨을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/postman/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) router.push('/postman');
    } catch (e) { alert('삭제 실패'); }
  };

  const filteredInteractions = interactions.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'give') return i.type === 'GIVE';
    return i.type === 'TAKE';
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
  };

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = { '식사':'🍽️', '커피/차':'☕', '소개':'🤝', '정보제공':'💡', '도움요청':'🙏', '선물':'🎁', '축하':'🎉', '조언':'💬', '협업':'🤜', '추천':'⭐', '통화':'📞', '문자/메시지':'💌', '방문':'🏠' };
    return icons[cat] || '📌';
  };

  if (loading) return <div className="container mx-auto p-8 text-center">로딩 중...</div>;
  if (!postman) return <div className="container mx-auto p-8 text-center">포스트맨을 찾을 수 없습니다</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* 뒤로가기 */}
      <Link href="/postman" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4 text-sm">← 목록으로</Link>

      {/* 프로필 카드 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
        {/* 상단 배경 + 프로필 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {uploading ? (
                  <span className="text-sm text-gray-400">업로드 중...</span>
                ) : postman.profileImage ? (
                  <img src={postman.profileImage} alt={postman.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{postman.name.charAt(0)}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs cursor-pointer hover:bg-blue-600" onClick={() => fileInputRef.current?.click()}>📷</div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* 이름/직함 */}
        <div className="pt-14 pb-4 px-6 text-center">
          <h1 className="text-2xl font-bold dark:text-white">{postman.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {postman.company || ''}{postman.company && postman.position ? ' · ' : ''}{postman.position || ''}
          </p>
          <span className="inline-block mt-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full">{postman.category}</span>
        </div>

        {/* Give & Take 점수 */}
        <div className="flex border-t dark:border-gray-700">
          <div className="flex-1 text-center py-4 border-r dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-500">{postman.giveScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">GIVE</div>
          </div>
          <div className="flex-1 text-center py-4 border-r dark:border-gray-700">
            <div className="text-2xl font-bold text-green-500">{postman.takeScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">TAKE</div>
          </div>
          <div className="flex-1 text-center py-4">
            <div className="text-2xl font-bold text-purple-500">{postman.giveScore + postman.takeScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">총 교류</div>
          </div>
        </div>
      </div>


      {/* 확장 프로필 */}
      {(postman.relationship || postman.age || postman.gender || postman.region || postman.strengths || postman.interests || postman.goals || postman.businessSummary || postman.lifePurpose) && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-4">
          <h2 className="font-bold text-lg mb-4 dark:text-white">프로필 정보</h2>
          <div className="space-y-3">
            {/* 기본 정보 라인 */}
            <div className="flex flex-wrap gap-2">
              {postman.relationship && (
                <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm">💑 {postman.relationship}</span>
              )}
              {postman.age && (
                <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full text-sm">🎂 {postman.age}세</span>
              )}
              {postman.gender && (
                <span className="inline-flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-full text-sm">{postman.gender === '남' ? '👨' : '👩'} {postman.gender}</span>
              )}
              {postman.region && (
                <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm">📍 {postman.region}</span>
              )}
            </div>
            {/* 상세 정보 */}
            {postman.strengths && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">💪 강점</div>
                <p className="text-sm dark:text-gray-300">{postman.strengths}</p>
              </div>
            )}
            {postman.interests && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">❤️ 관심사</div>
                <p className="text-sm dark:text-gray-300">{postman.interests}</p>
              </div>
            )}
            {postman.goals && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">🎯 목표/가치관</div>
                <p className="text-sm dark:text-gray-300">{postman.goals}</p>
              </div>
            )}
            {postman.businessSummary && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">💼 사업 요약</div>
                <p className="text-sm dark:text-gray-300">{postman.businessSummary}</p>
              </div>
            )}
            {postman.lifePurpose && (
              <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">🌟 인생 목적</div>
                <p className="text-sm dark:text-gray-300">{postman.lifePurpose}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 연락처 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="font-bold text-lg mb-4 dark:text-white">연락처</h2>
        <div className="space-y-3">
          {postman.phone && (
            <div className="flex items-center gap-3">
              <span className="text-lg">📞</span>
              <a href={`tel:${postman.phone}`} className="text-blue-500 hover:underline">{postman.phone}</a>
            </div>
          )}
          {postman.email && (
            <div className="flex items-center gap-3">
              <span className="text-lg">✉️</span>
              <a href={`mailto:${postman.email}`} className="text-blue-500 hover:underline">{postman.email}</a>
            </div>
          )}
          {postman.lastContact && (
            <div className="flex items-center gap-3">
              <span className="text-lg">🕐</span>
              <span className="text-gray-600 dark:text-gray-400">최근 연락: {formatDate(postman.lastContact)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 메모 */}
      {postman.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-bold text-lg mb-3 dark:text-white">메모</h2>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{postman.notes}</p>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3 mb-6">
        <Link href={`/postman/${id}/edit`} className="flex-1 bg-blue-500 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-600 transition">수정</Link>
        <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition">삭제</button>
      </div>

      {/* 소통 요약 카드 */}
      {interactions.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center">
            <div className="text-xl">💙</div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{interactions.filter(i => i.type === 'GIVE').length}</div>
            <div className="text-xs text-gray-500">GIVE</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
            <div className="text-xl">💚</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{interactions.filter(i => i.type === 'TAKE').length}</div>
            <div className="text-xs text-gray-500">TAKE</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 text-center">
            <div className="text-xl">📊</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{interactions.length}</div>
            <div className="text-xs text-gray-500">총 소통</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
            <div className="text-xl">📅</div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {interactions.length > 0 ? Math.floor((Date.now() - new Date(interactions[interactions.length-1].date).getTime()) / (1000*60*60*24)) : '-'}
            </div>
            <div className="text-xs text-gray-500">일째</div>
          </div>
        </div>
      )}

      {/* 카테고리별 소통 분포 */}
      {interactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">카테고리별 소통</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(interactions.reduce((acc: Record<string,number>, i) => { acc[i.category] = (acc[i.category]||0)+1; return acc; }, {}))
              .sort((a,b) => b[1]-a[1])
              .map(([cat, count]) => (
                <span key={cat} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                  {getCategoryIcon(cat)} {cat} <span className="font-bold text-blue-500">{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* 소통 내역 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg dark:text-white">소통 타임라인</h2>
            <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
              {showForm ? '취소' : '+ 기록 추가'}
            </button>
          </div>

          {/* 탭 필터 */}
          <div className="flex gap-2 mb-4">
            {(['all','give','take'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {tab === 'all' ? `전체 (${interactions.length})` : tab === 'give' ? `GIVE (${interactions.filter(i=>i.type==='GIVE').length})` : `TAKE (${interactions.filter(i=>i.type==='TAKE').length})`}
              </button>
            ))}
          </div>
        </div>

        {/* 기록 추가 폼 */}
        {showForm && (
          <div className="px-6 pb-4 border-t dark:border-gray-700 pt-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <select value={newInteraction.type} onChange={e => setNewInteraction({...newInteraction, type: e.target.value})} className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm">
                  <option value="GIVE">GIVE</option>
                  <option value="TAKE">TAKE</option>
                </select>
                <select value={newInteraction.category} onChange={e => setNewInteraction({...newInteraction, category: e.target.value})} className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm">
                  {INTERACTION_CATEGORIES.map(cat => <option key={cat} value={cat}>{getCategoryIcon(cat)} {cat}</option>)}
                </select>
              </div>
              {newInteraction.category === '기타' && (
                <input type="text" placeholder="카테고리 직접 입력" value={newInteraction.customCategory} onChange={e => setNewInteraction({...newInteraction, customCategory: e.target.value})} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm" />
              )}
              <input type="date" value={newInteraction.date} onChange={e => setNewInteraction({...newInteraction, date: e.target.value})} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="내용을 입력하세요..." value={newInteraction.description} onChange={e => setNewInteraction({...newInteraction, description: e.target.value})} rows={3} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm resize-none" />
              <button onClick={handleAddInteraction} className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition text-sm">저장</button>
            </div>
          </div>
        )}

        {/* 날짜별 그룹 타임라인 */}
        <div className="px-6 pb-4">
          {filteredInteractions.length === 0 ? (
            <div className="py-8 text-center text-gray-400">소통 내역이 없습니다</div>
          ) : (
            (() => {
              const grouped: Record<string, typeof filteredInteractions> = {};
              filteredInteractions.forEach(i => {
                const dateKey = new Date(i.date).toISOString().split('T')[0];
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(i);
              });
              return Object.entries(grouped).map(([dateKey, items]) => (
                <div key={dateKey} className="mb-4">
                  <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white dark:bg-gray-800 py-1 z-10">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{formatDate(dateKey)}</span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <span className="text-xs text-gray-400">{items.length}건</span>
                  </div>
                  <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-3">
                    {items.map(interaction => (
                      <div key={interaction.id} className="flex items-start gap-3 group">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gray-50 dark:bg-gray-700 shrink-0 -ml-[21px]">
                          {getCategoryIcon(interaction.category)}
                        </div>
                        <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-750 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${interaction.type === 'GIVE' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'}`}>{interaction.type}</span>
                            <span className="text-sm font-semibold dark:text-white">{interaction.category}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{interaction.description}</p>
                        </div>
                        <button onClick={() => handleDeleteInteraction(interaction.id)} className="text-gray-300 hover:text-red-500 transition text-sm opacity-0 group-hover:opacity-100">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </div>
  );
}
