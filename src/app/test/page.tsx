'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const TipTapEditor = dynamic(() => import('../../components/TipTapEditor'), {
  ssr: false,
  loading: () => <div className="p-4">Editor loading...</div>
});

export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">TipTap Editor 테스트</h1>
      <TipTapEditor />
    </div>
  );
}
