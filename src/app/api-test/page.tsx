'use client';

import { useState } from 'react';

export default function ApiTestPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test');
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult('Error: ' + error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 테스트</h1>
      <button 
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {result || 'Click button to test'}
      </pre>
    </div>
  );
}
