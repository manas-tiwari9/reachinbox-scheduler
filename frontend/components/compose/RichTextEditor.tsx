'use client';
// RichTextEditor — matches Figma compose toolbar exactly
// Toolbar: undo, redo, font size, bold, italic, underline, align, lists, indent, blockquote, columns, strikethrough
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// Small toolbar button helper
function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`p-1 rounded text-sm transition-colors ${
        active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ value, onChange, placeholder = 'Type Your Reply...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'tiptap' },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col flex-1 bg-[#f9fafb] rounded-lg overflow-hidden border border-gray-200">
      {/* Placeholder line + editor area */}
      <div className="px-4 pt-3 pb-1 text-sm text-gray-400 pointer-events-none select-none min-h-[32px]">
        {/* placeholder handled by tiptap */}
      </div>
      <div className="flex-1 px-4 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Toolbar — matches Figma bottom toolbar exactly */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-t border-gray-200 bg-white flex-wrap">
        {/* Undo */}
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 7v6h6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 13A9 9 0 1 0 5.7 5.7L3 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolBtn>
        {/* Redo */}
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 7v6h-6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 13A9 9 0 1 1 18.3 5.7L21 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Font size (heading toggle) */}
        <ToolBtn title="Font size" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <span className="text-xs font-medium">Tt</span>
          <svg className="w-2 h-2 inline ml-0.5" viewBox="0 0 8 8" fill="currentColor"><path d="M4 6L1 2h6L4 6z"/></svg>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Bold */}
        <ToolBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong className="text-xs">B</strong>
        </ToolBtn>
        {/* Italic */}
        <ToolBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em className="text-xs">I</em>
        </ToolBtn>
        {/* Underline */}
        <ToolBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="text-xs underline">U</span>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Align left */}
        <ToolBtn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </ToolBtn>
        {/* Align center */}
        <ToolBtn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Ordered list */}
        <ToolBtn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
            <text x="2" y="9" fontSize="8" fill="currentColor" stroke="none">1</text>
            <text x="2" y="15" fontSize="8" fill="currentColor" stroke="none">2</text>
            <text x="2" y="21" fontSize="8" fill="currentColor" stroke="none">3</text>
          </svg>
        </ToolBtn>
        {/* Bullet list */}
        <ToolBtn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </ToolBtn>
        {/* Indent increase */}
        <ToolBtn title="Increase indent" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/>
            <path d="M3 15l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolBtn>
        {/* Indent decrease */}
        <ToolBtn title="Decrease indent" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="11" y1="12" x2="21" y2="12"/><line x1="11" y1="18" x2="21" y2="18"/>
            <path d="M7 15l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Blockquote */}
        <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </ToolBtn>

        {/* Columns placeholder */}
        <ToolBtn title="Columns" onClick={() => {}}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
          </svg>
        </ToolBtn>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        {/* Strikethrough */}
        <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="text-xs line-through">S</span>
        </ToolBtn>
      </div>
    </div>
  );
}
