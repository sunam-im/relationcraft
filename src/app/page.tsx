import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">RelationCraft</h1>
          <p className="text-xl text-gray-600">1인 기업을 위한 관계 관리 CRM</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          <Link href="/postman" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📇</div>
            <h2 className="text-2xl font-bold mb-2">포스트맨 100명</h2>
            <p className="text-gray-600">핵심 인맥 관리</p>
          </Link>

          <Link href="/daily-log" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-2xl font-bold mb-2">데일리 로그</h2>
            <p className="text-gray-600">일일 기록 작성</p>
          </Link>

          <Link href="/weekly-plan" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold mb-2">Weekly 3 Plan</h2>
            <p className="text-gray-600">주간 3가지 목표</p>
          </Link>

          <Link href="/calendar" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">🗓️</div>
            <h2 className="text-2xl font-bold mb-2">캘린더</h2>
            <p className="text-gray-600">일정 한눈에 보기</p>
          </Link>

          <Link href="/dashboard" className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">대시보드</h2>
            <p className="text-gray-600">Give & Take 분석</p>
          </Link>
        </div>

        <div className="mt-12 max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">개발 진행 상황</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>포스트맨 100명 관리</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>데일리 로그</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>Weekly 3 Plan</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>상호작용 기록 (Give & Take)</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>캘린더</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>대시보드</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>검색 / 필터 / 정렬</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">완성도: 90%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
