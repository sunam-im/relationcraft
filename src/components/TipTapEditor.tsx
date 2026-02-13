'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

export default function TipTapEditor() {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<h1>안녕하세요</h1><p>TipTap Editor 테스트입니다.</p>',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[400px] border border-gray-300 p-4 rounded-lg',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-4 border rounded-lg">Editor loading...</div>;
  }

  return <EditorContent editor={editor} />;
}
