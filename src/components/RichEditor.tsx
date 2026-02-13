'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

type RichEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function RichEditor({ content, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none min-h-[200px] p-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded px-3 py-2 min-h-[200px] bg-gray-50 text-gray-400">
        에디터 로딩 중...
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      {/* 툴바 */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded text-sm font-bold ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded text-sm italic ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded text-sm line-through ${
            editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          S
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded text-sm font-bold ${
            editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded text-sm font-bold ${
            editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          H3
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          • 목록
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          1. 목록
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded text-sm ${
            editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'
          }`}
        >
          " 인용
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
        >
          — 구분선
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
        >
          ↩ 되돌리기
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded text-sm bg-white hover:bg-gray-200"
        >
          ↪ 다시실행
        </button>
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} />
    </div>
  );
}
