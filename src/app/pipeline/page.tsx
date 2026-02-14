'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Postman {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  profileImage: string | null;
  stage: string;
  giveScore: number;
  takeScore: number;
  category: string;
  phone: string | null;
  lastContact: string | null;
}

const STAGES = ['첫만남', '관계형성', '신뢰구축', '포스트맨PLUS', 'VIP'];
const STAGE_COLORS: Record<string, string> = {
  '첫만남': 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600',
  '관계형성': 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
  '신뢰구축': 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700',
  '포스트맨PLUS': 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  'VIP': 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
};
const STAGE_HEADER_COLORS: Record<string, string> = {
  '첫만남': 'bg-gray-500',
  '관계형성': 'bg-blue-500',
  '신뢰구축': 'bg-green-500',
  '포스트맨PLUS': 'bg-yellow-500',
  'VIP': 'bg-purple-500',
};
const STAGE_ICONS: Record<string, string> = {
  '첫만남': '🤝',
  '관계형성': '💬',
  '신뢰구축': '🤗',
  '포스트맨PLUS': '⭐',
  'VIP': '👑',
};

export default function PipelinePage() {
  const [postmen, setPostmen] = useState<Postman[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  useEffect(() => { loadPostmen(); }, []);

  const loadPostmen = async () => {
    try {
      const res = await fetch('/api/postman');
      const data = await res.json();
      if (data.success) setPostmen(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStage = async (postmanId: string, newStage: string) => {
    try {
      await fetch(`/api/postman/${postmanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      setPostmen(prev => prev.map(p => p.id === postmanId ? { ...p, stage: newStage } : p));
    } catch (e) { console.error(e); }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => { setDragOverStage(null); };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (draggedId) {
      updateStage(draggedId, stage);
      setDraggedId(null);
    }
  };

  const getPostmenByStage = (stage: string) => postmen.filter(p => (p.stage || '첫만남') === stage);

  const getDaysSinceContact = (lastContact: string | null) => {
    if (!lastContact) return null;
    return Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="text-center py-20 text-gray-400">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-500 text-sm">← 홈</Link>
            <h1 className="text-lg font-bold dark:text-white">관계 파이프라인</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>총 {postmen.length}명</span>
            <Link href="/postman" className="text-blue-500 hover:underline">목록 보기</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="hidden md:flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stagePostmen = getPostmenByStage(stage);
            return (
              <div key={stage}
                className={`flex-shrink-0 w-60 rounded-xl border-2 transition-all ${dragOverStage === stage ? 'border-blue-400 scale-[1.02] shadow-lg' : 'border-transparent'} ${STAGE_COLORS[stage]}`}
                onDragOver={e => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, stage)}>
                <div className={`${STAGE_HEADER_COLORS[stage]} text-white rounded-t-lg px-3 py-2 flex items-center justify-between`}>
                  <span className="text-sm font-semibold">{STAGE_ICONS[stage]} {stage}</span>
                  <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">{stagePostmen.length}</span>
                </div>
                <div className="p-2 space-y-2 min-h-[200px]">
                  {stagePostmen.map(p => {
                    const days = getDaysSinceContact(p.lastContact);
                    return (
                      <div key={p.id} draggable onDragStart={e => handleDragStart(e, p.id)}
                        className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedId === p.id ? 'opacity-50 scale-95' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {p.profileImage ? (
                            <img src={p.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{p.name.charAt(0)}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <Link href={`/postman/${p.id}`} className="text-sm font-semibold dark:text-white hover:text-blue-500 truncate block">{p.name}</Link>
                            {(p.company || p.position) && <div className="text-xs text-gray-500 truncate">{[p.company, p.position].filter(Boolean).join(' · ')}</div>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex gap-1">
                            {p.giveScore > 0 && <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">G{p.giveScore}</span>}
                            {p.takeScore > 0 && <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300 px-1.5 py-0.5 rounded">T{p.takeScore}</span>}
                          </div>
                          {days !== null && (
                            <span className={`text-xs ${days > 30 ? 'text-red-500 font-semibold' : days > 14 ? 'text-yellow-500' : 'text-gray-400'}`}>
                              {days === 0 ? '오늘' : `${days}일 전`}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {stagePostmen.length === 0 && <div className="text-center text-xs text-gray-400 py-8">드래그하여 이동</div>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="md:hidden space-y-3">
          {STAGES.map(stage => {
            const stagePostmen = getPostmenByStage(stage);
            return (
              <div key={stage} className={`rounded-xl border ${STAGE_COLORS[stage]}`}>
                <div className={`${STAGE_HEADER_COLORS[stage]} text-white rounded-t-lg px-4 py-3 flex items-center justify-between`}>
                  <span className="font-semibold">{STAGE_ICONS[stage]} {stage}</span>
                  <span className="text-sm bg-white/20 rounded-full px-2 py-0.5">{stagePostmen.length}명</span>
                </div>
                <div className="p-2 space-y-2">
                  {stagePostmen.map(p => (
                    <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {p.profileImage ? (
                          <img src={p.profileImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">{p.name.charAt(0)}</div>
                        )}
                        <div className="flex-1">
                          <Link href={`/postman/${p.id}`} className="font-semibold dark:text-white">{p.name}</Link>
                          {(p.company || p.position) && <div className="text-xs text-gray-500">{[p.company, p.position].filter(Boolean).join(' · ')}</div>}
                        </div>
                        <div className="flex gap-1">
                          {STAGES.indexOf(stage) > 0 && (
                            <button onClick={() => updateStage(p.id, STAGES[STAGES.indexOf(stage) - 1])}
                              className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-xs flex items-center justify-center">◀</button>
                          )}
                          {STAGES.indexOf(stage) < STAGES.length - 1 && (
                            <button onClick={() => updateStage(p.id, STAGES[STAGES.indexOf(stage) + 1])}
                              className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">▶</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stagePostmen.length === 0 && <div className="text-center text-xs text-gray-400 py-4">이 단계에 포스트맨이 없습니다</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
