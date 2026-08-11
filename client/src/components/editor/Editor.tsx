import { useEditor, EditorContent, useEditorState, type Editor as TiptapEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useCallback } from 'react'
import { AlignCenter, AlignLeft, AlignRight, Trash2, MoveHorizontal } from 'lucide-react'
import { Toolbar } from './Toolbar'
import { uploadImage, deleteImage } from '@/lib/upload'
import { publicIdFromUrl } from '@/lib/media'
import { ExtendedImage } from '@/lib/imageExtension'
import '@/styles/editor.css'

interface EditorProps {
  content: string
  onChange: (json: string) => void
  editable?: boolean
  maxChars?: number
}

function ImageControls({ editor }: { editor: TiptapEditor }) {
  const state = useEditorState({
    editor,
    selector: ctx => {
      const isImage = ctx.editor.isActive('image')
      return {
        isImage,
        attrs: isImage ? (ctx.editor.getAttributes('image') as { align?: string; width?: string | null; src?: string }) : null,
      }
    },
  })

  if (!state.isImage || !state.attrs) return null

  const { attrs } = state
  const align = attrs.align ?? 'center'
  const width = attrs.width ?? '100'
  const set = (patch: Record<string, unknown>) => editor.chain().focus().updateAttributes('image', patch).run()
  const remove = () => {
    const src = attrs.src
    const publicId = src ? publicIdFromUrl(src) : null
    if (publicId) void deleteImage(publicId)
    editor.chain().focus().deleteSelection().run()
  }

  const button = (label: string, active: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={label}
      aria-label={label}
      className={`grid size-8 touch-target place-items-center rounded-md transition-colors ${
        active
          ? 'bg-[rgb(var(--accent))] text-white'
          : 'text-[rgb(var(--ink-soft))] hover:bg-[rgb(var(--paper-line))]/40 hover:text-[rgb(var(--ink))]'
      }`}
    >
      {children}
    </button>
  )

  const widthButton = (value: string, label: string) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); set({ width: value }) }}
      title={label}
      aria-label={label}
      className={`rounded-md px-2 py-1 text-xs transition-colors ${
        width === value
          ? 'bg-[rgb(var(--accent))] text-white'
          : 'text-[rgb(var(--ink-soft))] hover:bg-[rgb(var(--paper-line))]/40 hover:text-[rgb(var(--ink))]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 rounded-xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] px-2 py-1.5 shadow-sm">
      {button('Align left', align === 'left', () => set({ align: 'left' }), <AlignLeft className="size-4" />)}
      {button('Align center', align === 'center', () => set({ align: 'center' }), <AlignCenter className="size-4" />)}
      {button('Align right', align === 'right', () => set({ align: 'right' }), <AlignRight className="size-4" />)}
      <div className="mx-1 h-5 w-px bg-[rgb(var(--paper-line))]" />
      <MoveHorizontal className="size-4 text-[rgb(var(--ink-faint))]" />
      {widthButton('40', 'Small')}
      {widthButton('70', 'Medium')}
      {widthButton('100', 'Full')}
      <div className="mx-1 h-5 w-px bg-[rgb(var(--paper-line))]" />
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); remove() }}
        title="Remove image"
        aria-label="Remove image"
        className="grid size-8 touch-target place-items-center rounded-md text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

export function Editor({ content, onChange, editable = true, maxChars = 5000 }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      ExtendedImage,
      Link.configure({ openOnClick: false, autolink: true }),
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Start writing your thoughts…',
      }),
      CharacterCount.configure({ limit: maxChars }),
    ],
    content: content ? JSON.parse(content) : '<p></p>',
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  const insertImage = useCallback(
    async (file: File) => {
      const res = await uploadImage(file)
      editor?.chain().focus().setImage({ src: res.url }).run()
    },
    [editor],
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files)
      if (files.length > 0 && files.some(f => f.type.startsWith('image/'))) {
        e.preventDefault()
        for (const file of files) {
          await insertImage(file)
        }
      }
    },
    [insertImage],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0 && files.some(f => f.type.startsWith('image/'))) {
        e.preventDefault()
        for (const file of files) {
          await insertImage(file)
        }
      }
    },
    [insertImage],
  )

  if (!editor) return null

  return (
    <div className="relative">
      {editable && <Toolbar editor={editor} />}
      {editable && <ImageControls editor={editor} />}
      <div onPaste={handlePaste} onDrop={handleDrop} className="min-h-[50vh] rounded-b-2xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
