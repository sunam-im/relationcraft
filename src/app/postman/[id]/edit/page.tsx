'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditPostmanPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    position: '',
    phone: '',
    email: '',
    category: '포스트맨',
    notes: '',
  });

  useEffect(() => {
    fetchPostman();
  }, []);

  const fetchPostman = async () => {
    try {
      const res = await fetch(`/api/postman/${id}`);
      const data = await res.json();
      if (data.success) {
        const postman = data.data;
        setFormData({
          name: postman.name,
          company: postman.company || '',
          position: postman.position || '',
          phone: postman.phone || '',
          email: postman.email || '',
          category: postman.category,
          notes: postman.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch postman:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/postman/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/postman/${id}`);
      } else {
        alert('저장 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to update postman:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <div className="p-8">로딩 중...</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/postman/${id}`} className="text-blue-500 hover:underline">
          ← 상세로 돌아가기
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">포스트맨 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">회사</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">직책</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">전화번호</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">구분</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="포스트맨">포스트맨</option>
            <option value="포스트맨 플러스">포스트맨 플러스</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">메모</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <Link
            href={`/postman/${id}`}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-center"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
