'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPostmanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', company: '', position: '', phone: '', email: '', category: '포스트맨', notes: '',
    relationship: '', age: '', gender: '', region: '', strengths: '', interests: '', goals: '', businessSummary: '', lifePurpose: '', birthday: '', anniversary: '', anniversaryLabel: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setProfileImage(data.data.url);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { alert('이름을 입력하세요'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/postman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, profileImage, age: formData.age ? parseInt(formData.age) : null })
      });
      const data = await res.json();
      if (data.success) router.push('/postman');
      else alert('저장 실패: ' + data.error);
    } catch (err) {
      alert('저장 중 오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-lg">
      <Link href="/postman" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-4 text-sm">← 목록으로</Link>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {/* 프로필 이미지 업로드 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-24 relative">
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {uploading ? (
                  <span className="text-xs text-gray-400">업로드 중...</span>
                ) : profileImage ? (
                  <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-300">👤</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:bg-blue-600" onClick={() => fileInputRef.current?.click()}>📷</div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="pt-14 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">이름 *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="이름 입력" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">회사</label>
              <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="회사명" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">직책</label>
              <input type="text" name="position" value={formData.position} onChange={handleChange} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="직책" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">전화번호</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="010-0000-0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">이메일</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">구분</label>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5">
              <option value="포스트맨">포스트맨</option>
              <option value="포스트맨 플러스">포스트맨 플러스</option>
            </select>
          </div>
          
            {/* 확장 프로필 */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">확장 프로필</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">나와의 관계</label>
                  <input type="text" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} placeholder="친구, 거래처, 멘토..." className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">나이</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="나이" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">성별</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                    <option value="">선택</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">지역</label>
                  <input type="text" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} placeholder="서울, 부산..." className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">강점</label>
                <input type="text" value={formData.strengths} onChange={e => setFormData({...formData, strengths: e.target.value})} placeholder="본인의 강점" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">관심사/취미</label>
                <input type="text" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} placeholder="관심사, 취미" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">목표/가치관</label>
                <textarea value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} placeholder="목표, 가치관, 방향" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">사업요약</label>
                <textarea value={formData.businessSummary} onChange={e => setFormData({...formData, businessSummary: e.target.value})} placeholder="사업 내용 요약" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">삶의 목적</label>
                <textarea value={formData.lifePurpose} onChange={e => setFormData({...formData, lifePurpose: e.target.value})} placeholder="삶의 목적" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
              </div>
            </div>

<div>
            <label className="block text-sm font-semibold mb-1 dark:text-gray-300">메모</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="메모 입력" />
          </div>
          {/* 생일/기념일 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">🎂 생일</label>
              <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">💝 기념일</label>
              <input type="date" value={formData.anniversary} onChange={e => setFormData({...formData, anniversary: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm dark:text-white" />
              <input type="text" value={formData.anniversaryLabel} onChange={e => setFormData({...formData, anniversaryLabel: e.target.value})}
                placeholder="기념일 이름 (예: 첫 미팅, 계약일)"
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm mt-2 dark:text-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 transition">{loading ? '저장 중...' : '저장'}</button>
            <Link href="/postman" className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-center py-3 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition">취소</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
