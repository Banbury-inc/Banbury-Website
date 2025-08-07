import React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Level } from '@tiptap/extension-heading';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { TaskList } from '@tiptap/extension-list';
import { TaskItem } from '@tiptap/extension-list';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Type,
  Highlighter,
  Link,
  Image as ImageIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon
} from 'lucide-react';
import './SimpleTiptapEditor.css';

interface SimpleTiptapEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

export const SimpleTiptapEditor: React.FC<SimpleTiptapEditorProps> = ({
  initialContent = '<p>Start typing...</p>',
  onContentChange,
  placeholder = 'Start typing...'
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      HorizontalRule,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image,
      Typography,
      Superscript,
      Subscript,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'simple-tiptap-editor',
        'aria-label': placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="simple-tiptap-container">
      <div className="simple-tiptap-toolbar">
        {/* Undo/Redo */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="toolbar-button"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="toolbar-button"
            title="Redo"
          >
            <Redo size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Headings */}
        <div className="toolbar-group">
          <select
            value={editor.getAttributes('heading').level || 'paragraph'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(value) as Level }).run();
              }
            }}
            className="toolbar-select"
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
          </select>
        </div>

        <div className="toolbar-separator" />

        {/* Text formatting */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
            title="Code"
          >
            <Code size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            className={`toolbar-button ${editor.isActive('highlight') ? 'active' : ''}`}
            title="Highlight"
          >
            <Highlighter size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Lists and quotes */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`toolbar-button ${editor.isActive('taskList') ? 'active' : ''}`}
            title="Task List"
          >
            <Type size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Quote"
          >
            <Quote size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Alignment */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        <div className="toolbar-separator" />

        {/* Special */}
        <div className="toolbar-group">
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            disabled={!editor.can().chain().focus().toggleSuperscript().run()}
            className={`toolbar-button ${editor.isActive('superscript') ? 'active' : ''}`}
            title="Superscript"
          >
            <SuperscriptIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            disabled={!editor.can().chain().focus().toggleSubscript().run()}
            className={`toolbar-button ${editor.isActive('subscript') ? 'active' : ''}`}
            title="Subscript"
          >
            <SubscriptIcon size={16} />
          </button>
          <button
            onClick={setLink}
            className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
            title="Link"
          >
            <Link size={16} />
          </button>
          <button
            onClick={addImage}
            className="toolbar-button"
            title="Add Image"
          >
            <ImageIcon size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="toolbar-button"
            title="Horizontal Rule"
          >
            <Minus size={16} />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="simple-tiptap-content" />
    </div>
  );
};
