'use client';

import { useState } from 'react';

interface Template {
  id: string;
  category: string;
  icon: string;
  title: string;
  message: string;
  variables: string[];
}

const templates: Template[] = [
  // 생일 축하
  { id: 'bd1', category: '생일', icon: '🎂', title: '생일 축하 (격식)', message: '{name}님, 생일을 진심으로 축하드립니다! 늘 건강하시고 하시는 일 모두 잘 되시길 바랍니다. 뜻깊은 하루 보내세요!', variables: ['name'] },
  { id: 'bd2', category: '생일', icon: '🎂', title: '생일 축하 (친근)', message: '{name}님~ 생일 축하해요! 🎉 올해도 좋은 일만 가득하길 바랍니다. 조만간 한번 뵈어요!', variables: ['name'] },
  { id: 'bd3', category: '생일', icon: '🎂', title: '생일 축하 (비즈니스)', message: '{name} {position}님, 생일을 축하드립니다. {company}에서의 멋진 활약을 항상 응원합니다. 좋은 하루 되세요!', variables: ['name', 'position', 'company'] },

  // 안부 인사
  { id: 'gr1', category: '안부', icon: '👋', title: '오랜만에 안부', message: '{name}님, 안녕하세요! 오랜만에 연락드립니다. 잘 지내고 계시죠? 혹시 시간 되시면 커피 한잔 하면서 이야기 나누면 좋겠습니다!', variables: ['name'] },
  { id: 'gr2', category: '안부', icon: '👋', title: '계절 인사 (봄)', message: '{name}님, 따뜻한 봄날입니다. 잘 지내고 계신지요? 새로운 시작의 계절에 좋은 일들만 가득하시길 바랍니다!', variables: ['name'] },
  { id: 'gr3', category: '안부', icon: '👋', title: '주말 안부', message: '{name}님, 한 주간 수고 많으셨습니다! 편안한 주말 보내시고, 다음 주에도 좋은 일들 가득하시길 바랍니다 😊', variables: ['name'] },

  // 감사
  { id: 'th1', category: '감사', icon: '🙏', title: '미팅 후 감사', message: '{name}님, 오늘 귀한 시간 내주셔서 감사합니다. 말씀해주신 내용 잘 정리해서 다시 연락드리겠습니다. 앞으로도 좋은 관계 이어가면 좋겠습니다!', variables: ['name'] },
  { id: 'th2', category: '감사', icon: '🙏', title: '소개/추천 감사', message: '{name}님, {referral}님을 소개해주셔서 정말 감사합니다. 덕분에 좋은 인연이 될 것 같습니다. 항상 감사드립니다!', variables: ['name', 'referral'] },
  { id: 'th3', category: '감사', icon: '🙏', title: '도움 감사', message: '{name}님, 지난번에 도움 주셔서 정말 감사했습니다. 덕분에 잘 해결되었습니다. 제가 도움 드릴 일이 있으면 언제든 말씀해주세요!', variables: ['name'] },

  // 축하
  { id: 'cg1', category: '축하', icon: '🎊', title: '승진 축하', message: '{name}님, 승진을 진심으로 축하드립니다! 🎉 그동안의 노력이 빛을 발한 거라 생각합니다. 앞으로도 멋진 활약 기대합니다!', variables: ['name'] },
  { id: 'cg2', category: '축하', icon: '🎊', title: '이직/새 출발 축하', message: '{name}님, 새로운 시작을 축하드립니다! 새로운 환경에서도 {name}님의 역량을 마음껏 펼치시길 응원합니다!', variables: ['name'] },
  { id: 'cg3', category: '축하', icon: '🎊', title: '사업 성과 축하', message: '{name}님, 좋은 성과를 거두셨다니 정말 축하드립니다! 👏 앞으로도 승승장구하시길 바랍니다!', variables: ['name'] },

  // 제안/연결
  { id: 'pr1', category: '제안', icon: '🤝', title: '미팅 제안', message: '{name}님, 안녕하세요! 최근 {topic} 관련해서 이야기 나누고 싶은 부분이 있습니다. 혹시 이번 주 중에 30분 정도 시간 가능하실까요?', variables: ['name', 'topic'] },
  { id: 'pr2', category: '제안', icon: '🤝', title: '인맥 소개 제안', message: '{name}님, {referral}님이라는 분이 계신데 {name}님과 시너지가 좋을 것 같습니다. 한번 소개해드려도 될까요?', variables: ['name', 'referral'] },
  { id: 'pr3', category: '제안', icon: '🤝', title: '정보 공유', message: '{name}님, 최근 {topic} 관련 좋은 자료를 발견해서 공유드립니다. {name}님 사업에 도움이 되실 것 같아요!', variables: ['name', 'topic'] },

  // 명절/기념일
  { id: 'hd1', category: '명절', icon: '🎑', title: '설날 인사', message: '{name}님, 새해 복 많이 받으세요! 🧧 올 한 해도 건강하시고 좋은 일만 가득하시길 기원합니다!', variables: ['name'] },
  { id: 'hd2', category: '명절', icon: '🎑', title: '추석 인사', message: '{name}님, 풍성한 한가위 보내세요! 🌕 가족들과 따뜻한 시간 보내시고, 늘 건강하시길 바랍니다!', variables: ['name'] },
  { id: 'hd3', category: '명절', icon: '🎑', title: '새해 인사', message: '{name}님, 2026년 새해가 밝았습니다! ✨ 올해도 좋은 인연으로 함께하면 좋겠습니다. 새해 복 많이 받으세요!', variables: ['name'] },
];

const categories = ['전체', '생일', '안부', '감사', '축하', '제안', '명절'];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const filtered = selectedCategory === '전체' ? templates : templates.filter(t => t.category === selectedCategory);

  const fillTemplate = (template: Template) => {
    let msg = template.message;
    Object.entries(variables).forEach(([key, val]) => {
      msg = msg.replace(new RegExp(`\\{${key}\\}`, 'g'), val || `{${key}}`);
    });
    return msg;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const selectTemplate = (t: Template) => {
    setSelectedTemplate(t);
    const vars: Record<string, string> = {};
    t.variables.forEach(v => { vars[v] = variables[v] || ''; });
    setVariables(vars);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold dark:text-white mb-4">💬 소통 템플릿</h1>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedTemplate(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* 템플릿이 선택되지 않았을 때 - 목록 */}
        {!selectedTemplate ? (
          <div className="space-y-2">
            {filtered.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)}
                className="w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm dark:text-white">{t.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{t.message}</div>
                  </div>
                  <span className="text-gray-300 dark:text-gray-600">›</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* 템플릿 상세 - 변수 입력 + 미리보기 */
          <div className="space-y-4">
            <button onClick={() => setSelectedTemplate(null)} className="text-sm text-blue-500 hover:underline">← 목록으로</button>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <h2 className="font-bold dark:text-white">{selectedTemplate.title}</h2>
              </div>

              {/* 변수 입력 */}
              {selectedTemplate.variables.length > 0 && (
                <div className="space-y-3 mb-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">정보 입력</div>
                  {selectedTemplate.variables.map(v => (
                    <div key={v}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {v === 'name' ? '이름' : v === 'company' ? '회사' : v === 'position' ? '직책' : v === 'referral' ? '소개 대상' : v === 'topic' ? '주제' : v}
                      </label>
                      <input
                        type="text"
                        value={variables[v] || ''}
                        onChange={e => setVariables({ ...variables, [v]: e.target.value })}
                        placeholder={v === 'name' ? '홍길동' : v === 'company' ? '회사명' : v === 'position' ? '대표' : '입력'}
                        className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 미리보기 */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">미리보기</div>
                <p className="text-sm dark:text-white whitespace-pre-wrap leading-relaxed">{fillTemplate(selectedTemplate)}</p>
              </div>

              {/* 복사 버튼 */}
              <button
                onClick={() => copyToClipboard(fillTemplate(selectedTemplate))}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {copied ? '✓ 복사 완료!' : '📋 메시지 복사하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
