import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { ResizableImage } from '../../extensions/ResizableImage';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-list';
import { TaskItem } from '@tiptap/extension-list';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
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
  Link as LinkIcon,
  Image as ImageIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Wand2,
  MoreHorizontal,
  Save,
  Download,
  ChevronDown,
  Table as TableIcon,
  Search,
  FileImage
} from 'lucide-react';
import React, { useEffect, useState } from 'react';


import styles from '../../../styles/SimpleTiptapEditor.module.css';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '../../../components/ui/dropdown-menu';
import { useTiptapAIContext } from '../../../contexts/TiptapAIContext';
import { cn } from '../../../utils';
import { changeSelectionFontFamily } from '../../handlers/editorFont';
import { insertImageFromBackendFile } from '../../handlers/editorImage';
import { FileSystemItem } from '../../../utils/fileTreeUtils';
import { ApiService } from '../../../services/apiService';
import { registerTiptapEditor, unregisterTiptapEditor } from '../../RightPanel/handlers/handle-docx-ai-response';
 

interface AITiptapEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  onSave?: () => void;
  onDownload?: () => void;
  saving?: boolean;
  canSave?: boolean;
}

export const AITiptapEditor: React.FC<AITiptapEditorProps> = ({
  initialContent = '<p>Start typing...</p>',
  onContentChange,
  placeholder = 'Start typing...',
  className,
  onSave,
  onDownload,
  saving = false,
  canSave = false
}) => {
  const { setEditor, aiBridge, registerAICommands, aiCommands } = useTiptapAIContext();
  const [selection, setSelection] = useState<{ from: number; to: number; text: string } | null>(null);
  const [selectedFont, setSelectedFont] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    isTable: boolean;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    isTable: false,
  });

  // Image dropdown local search state
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false)
  const [imageQuery, setImageQuery] = useState('')
  const [imageResults, setImageResults] = useState<Array<{
    file_id: string
    file_name: string
    file_path: string
    file_size: number
    date_modified: string
    device_name: string
    s3_url: string
  }>>([])
  const [isImageSearching, setIsImageSearching] = useState(false)

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.isOpen) {
        setContextMenu(prev => ({ ...prev, isOpen: false }))
      }
    }

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.isOpen])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
      }),
      HorizontalRule,
      TextStyle,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        handleWidth: 8,
        cellMinWidth: 50,
        lastColumnResizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Highlight.configure({
        multicolor: true,
      }),
      ResizableImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'image-resizable',
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      setSelection({ from, to, text });
    },
    editorProps: {
      attributes: {
        class: styles['simple-tiptap-editor'],
        'aria-label': placeholder,
      },
    },
  });

  // Register the editor with the AI context and DOCX handler
  useEffect(() => {
    if (editor) {
      setEditor(editor);
      registerAICommands();
      // Register for DOCX AI operations
      registerTiptapEditor(editor);
    }
    
    return () => {
      if (editor) {
        unregisterTiptapEditor(editor);
      }
      setEditor(null);
    };
  }, [editor, setEditor, registerAICommands]);

  // Listen for AI responses and apply them
  useEffect(() => {
    const handleAIResponse = (event: CustomEvent) => {
      const { response, actionType, selection: responseSelection } = event.detail;
      
      if (!editor || !response) return;
      
      switch (actionType) {
        case 'rewrite':
        case 'correct':
        case 'expand':
        case 'translate':
          if (responseSelection) {
            const { from, to, text: originalText } = responseSelection;
            const currentSlice = editor.state.doc.textBetween(from, to);

            if (currentSlice.trim() === (originalText || '').trim()) {
              editor.chain().focus()
                .deleteRange({ from, to })
                .insertContent(response)
                .run();
            } else {
              const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const html = editor.getHTML();
              let updated = html;
              if (originalText && originalText.trim().length > 0) {
                const words = originalText.trim().split(/\s+/).map(escapeRegExp);
                const flexible = new RegExp(words.join('(?:\\s*(?:<[^>]+>\\s*)*)'), 'i');
                updated = html.replace(flexible, response);
              } else {
                updated = html;
              }
              if (updated !== html) {
                editor.commands.setContent(updated, { emitUpdate: true });
              } else {
                editor.chain().focus().insertContent(response).run();
              }
            }
          } else {
            editor.chain().focus().insertContent(response).run();
          }
          break;
        case 'summarize':
        case 'outline':
          editor.chain().focus().insertContent(`\n\n${response}`).run();
          break;
        default:
          editor.chain().focus().insertContent(response).run();
      }
    };

    window.addEventListener('tiptap-ai-response', handleAIResponse as EventListener);
    
    return () => {
      window.removeEventListener('tiptap-ai-response', handleAIResponse as EventListener);
    };
  }, [editor]);

  // Image search effect
  useEffect(() => {
    if (!isImageMenuOpen) {
      setImageQuery('')
      setImageResults([])
      setIsImageSearching(false)
      return
    }

    const t = setTimeout(async () => {
      const q = imageQuery.trim()
      if (!q) {
        setImageResults([])
        return
      }
      setIsImageSearching(true)
      try {
        const res = await ApiService.searchS3Files(q)
        if (res.result === 'success') setImageResults(res.files || [])
        else setImageResults([])
      } catch {
        setImageResults([])
      } finally {
        setIsImageSearching(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [imageQuery, isImageMenuOpen])

  // no-op

  if (!editor) {
    return null;
  }

  const handleS3FileSelect = (file: FileSystemItem) => {
    const fileId = (file.file_id || (file as any).file_id) as string | undefined
    const fileName = file.name
    if (fileId && fileName) insertImageFromBackendFile({ editor, fileId, fileName })
  }

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault()
    const target = event.target as HTMLElement
    const isTable = target.closest('table') !== null
    
    setContextMenu({
      isOpen: true,
      x: event.clientX,
      y: event.clientY,
      isTable,
    })
  }

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }))
  }

  const handleTableAction = (action: () => void) => {
    action()
    closeContextMenu()
  }

  // Adjust context menu position if it goes off-screen
  const getAdjustedPosition = (x: number, y: number) => {
    const menuWidth = 200
    const menuHeight = 300
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let adjustedX = x
    let adjustedY = y

    if (x + menuWidth > windowWidth) {
      adjustedX = x - menuWidth
    }

    if (y + menuHeight > windowHeight) {
      adjustedY = y - menuHeight
    }

    return { x: adjustedX, y: adjustedY }
  }

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

  const hasSelection = selection?.text && selection.text.trim().length > 0;

  return (
    <div className={cn(styles['simple-tiptap-container'], className)}>
      {/* Toolbar */}
      <div className={styles['simple-tiptap-toolbar']}>
        {/* Left side toolbar items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
          {/* Undo/Redo */}
          <div className={styles['toolbar-group']}>
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className={styles['toolbar-button']}
              title="Undo"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className={styles['toolbar-button']}
              title="Redo"
            >
              <Redo size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Text formatting */}
          <div className={styles['toolbar-group']}>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('bold') ? styles['active'] : ''}`}
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('italic') ? styles['active'] : ''}`}
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('underline') ? styles['active'] : ''}`}
              title="Underline"
            >
              <UnderlineIcon size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('strike') ? styles['active'] : ''}`}
              title="Strikethrough"
            >
              <Strikethrough size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('code') ? styles['active'] : ''}`}
              title="Code"
            >
              <Code size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              disabled={!editor.can().chain().focus().toggleHighlight().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('highlight') ? styles['active'] : ''}`}
              title="Highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              disabled={!editor.can().chain().focus().toggleSubscript().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('subscript') ? styles['active'] : ''}`}
              title="Subscript"
            >
              <SubscriptIcon size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              disabled={!editor.can().chain().focus().toggleSuperscript().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('superscript') ? styles['active'] : ''}`}
              title="Superscript"
            >
              <SuperscriptIcon size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Alignment */}
          <div className={styles['toolbar-group']}>
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`${styles['toolbar-button']} ${editor.isActive({ textAlign: 'left' }) ? styles['active'] : ''}`}
              title="Align Left"
            >
              <AlignLeft size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`${styles['toolbar-button']} ${editor.isActive({ textAlign: 'center' }) ? styles['active'] : ''}`}
              title="Align Center"
            >
              <AlignCenter size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`${styles['toolbar-button']} ${editor.isActive({ textAlign: 'right' }) ? styles['active'] : ''}`}
              title="Align Right"
            >
              <AlignRight size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`${styles['toolbar-button']} ${editor.isActive({ textAlign: 'justify' }) ? styles['active'] : ''}`}
              title="Justify"
            >
              <AlignJustify size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Headings */}
          <div className={styles['toolbar-group']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={styles['toolbar-button']}
                  title="Headings"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {editor.isActive('heading', { level: 1 }) && 'H1'}
                    {editor.isActive('heading', { level: 2 }) && 'H2'}
                    {editor.isActive('heading', { level: 3 }) && 'H3'}
                    {!editor.isActive('heading') && 'H'}
                    <ChevronDown size={12} />
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
                >
                  H1
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
                >
                  H2
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
                >
                  H3
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().setParagraph().run()}
                >
                  Paragraph
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Font family */}
          <div className={styles['toolbar-group']}>
            <select
              className={styles['toolbar-select']}
              aria-label="Font family"
              value={selectedFont ?? ''}
              onChange={(e) => {
                const value = e.target.value || null;
                setSelectedFont(value);
                changeSelectionFontFamily({ editor, fontFamily: value });
              }}
            >
              <option value="">Default</option>
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Georgia">Georgia</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Merriweather">Merriweather</option>
              <option value="sans-serif">Sans-serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Lists and quotes */}
          <div className={styles['toolbar-group']}>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('bulletList') ? styles['active'] : ''}`}
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('orderedList') ? styles['active'] : ''}`}
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`${styles['toolbar-button']} ${editor.isActive('blockquote') ? styles['active'] : ''}`}
              title="Quote"
            >
              <Quote size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Insert Table */}
          <div className={styles['toolbar-group']}>
            <button
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              className={styles['toolbar-button']}
              title="Insert Table"
            >
              <TableIcon size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* Image and Link */}
          <div className={styles['toolbar-group']}>
            <DropdownMenu open={isImageMenuOpen} onOpenChange={setIsImageMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={styles['toolbar-button']}
                  title="Add Image"
                >
                  <ImageIcon size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-96 p-0 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/50 shadow-2xl rounded-xl overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-700/50 bg-gradient-to-r from-zinc-800/50 to-zinc-700/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <ImageIcon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Insert Image</h3>
                      <p className="text-xs text-zinc-400">Search your files or enter a URL</p>
                    </div>
                  </div>
                </div>

                {/* Search Input */}
                <div className="px-4 py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      value={imageQuery}
                      onChange={(e) => setImageQuery(e.target.value)}
                      placeholder="Search files..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-800/80 text-white placeholder-zinc-400 border border-zinc-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-72 overflow-y-auto">
                  {isImageSearching && (
                    <div className="px-4 py-6 text-center">
                      <div className="inline-flex items-center gap-2 text-zinc-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm">Searching files...</span>
                      </div>
                    </div>
                  )}
                  
                  {!isImageSearching && imageQuery.trim() && imageResults.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <div className="text-zinc-400">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No files found</p>
                        <p className="text-xs text-zinc-500 mt-1">Try a different search term</p>
                      </div>
                    </div>
                  )}
                  
                  {!isImageSearching && imageResults.length > 0 && (
                    <div className="px-2 pb-2">
                      <div className="px-2 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                        Found {imageResults.length} result{imageResults.length !== 1 ? 's' : ''}
                      </div>
                      {imageResults.map((r) => (
                        <button
                          key={r.file_id}
                          className="w-full text-left px-3 py-3 rounded-lg hover:bg-zinc-800/60 hover:border-zinc-600/50 border border-transparent transition-all duration-200 group"
                          onClick={() => {
                            handleS3FileSelect({
                              id: r.file_id,
                              file_id: r.file_id,
                              name: r.file_name,
                              type: 'file',
                              path: r.file_path,
                              size: r.file_size,
                              modified: new Date(r.date_modified),
                              s3_url: r.s3_url,
                            })
                            setIsImageMenuOpen(false)
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-zinc-700/50 group-hover:bg-zinc-600/50 transition-colors duration-200">
                              <FileImage className="h-4 w-4 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white group-hover:text-blue-100 transition-colors duration-200 truncate">
                                {r.file_name}
                              </div>
                              <div className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors duration-200 truncate mt-0.5">
                                {r.file_path}
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-md">
                                  {Math.round(r.file_size / 1024)} KB
                                </span>
                                <span className="text-xs text-zinc-500">
                                  {new Date(r.date_modified).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-zinc-700/50 bg-gradient-to-r from-zinc-800/30 to-zinc-700/30">
                  <button
                    onClick={() => {
                      const url = window.prompt('Enter image URL:')
                      if (url) editor.chain().focus().setImage({ src: url }).run()
                      setIsImageMenuOpen(false)
                    }}
                    className="w-full px-3 py-2 text-sm text-zinc-300 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-600/50 hover:border-zinc-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Insert from URL
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={setLink}
              className={styles['toolbar-button']}
              title="Add Link"
            >
              <LinkIcon size={16} />
            </button>
          </div>

          <div className={styles['toolbar-separator']} />

          {/* AI Features */}
          <div className={styles['toolbar-group']}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={styles['toolbar-button']} title="More Tools">
                  <MoreHorizontal size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().setHorizontalRule().run()}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Horizontal Rule
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => editor.chain().focus().insertContent('™').run()}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Typography
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right side - Document Actions */}
        {(onSave || onDownload) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div className={styles['toolbar-separator']} />
            <div className={styles['toolbar-group']}>
              {onSave && (
                <button
                  onClick={onSave}
                  disabled={saving || !canSave}
                  className={styles['toolbar-button']}
                  title="Save document"
                >
                  <Save size={16} />
                </button>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className={styles['toolbar-button']}
                  title="Download document"
                >
                  <Download size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <EditorContent 
        editor={editor} 
        className={styles['simple-tiptap-content']}
        onContextMenu={handleContextMenu}
      />
      
      {/* Status Bar */}
      {hasSelection && (
        <div className="border-t px-3 py-2 text-xs text-muted-foreground bg-muted/50">
          Selected: {selection?.text.length} characters
        </div>
      )}

      {/* Table Context Menu */}
      {contextMenu.isOpen && contextMenu.isTable && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[200px]"
          style={{
            left: getAdjustedPosition(contextMenu.x, contextMenu.y).x,
            top: getAdjustedPosition(contextMenu.x, contextMenu.y).y,
          }}
        >
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            💡 Drag column borders to resize
          </div>
          <div className="py-1">
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().addColumnBefore().run())}
              disabled={!editor.can().addColumnBefore()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Column Before
            </button>
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().addColumnAfter().run())}
              disabled={!editor.can().addColumnAfter()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Column After
            </button>
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().deleteColumn().run())}
              disabled={!editor.can().deleteColumn()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Column
            </button>
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().addRowBefore().run())}
              disabled={!editor.can().addRowBefore()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Row Before
            </button>
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().addRowAfter().run())}
              disabled={!editor.can().addRowAfter()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Row After
            </button>
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().deleteRow().run())}
              disabled={!editor.can().deleteRow()}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Row
            </button>
          </div>
          
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={() => handleTableAction(() => editor.chain().focus().deleteTable().run())}
              disabled={!editor.can().deleteTable()}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete Table
            </button>
          </div>
        </div>
      )}


    </div>
  );
};
