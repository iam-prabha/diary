import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useCallback } from 'react'
import { Toolbar } from './Toolbar'
import { uploadImage } from '@/lib/upload'
import '@/styles/editor.css'

interface EditorProps {
  content: string
  onChange: (json: string) => void
  editable?: boolean
  maxChars?: number
}

export function Editor({ content, onChange, editable = true, maxChars = 5000 }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: null },
            height: { default: null },
          }
        },
      }).configure({ inline: false, allowBase64: false }),
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

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files)
    if (files.length > 0 && files.some(f => f.type.startsWith('image/'))) {
      e.preventDefault()
      for (const file of files) {
        const url = await uploadImage(file)
        editor?.chain().focus().setImage({ src: url }).run()
      }
    }
  }, [editor])

  if (!editor) return null

  return (
    <div className="relative">
      {editable && <Toolbar editor={editor} />}
      <div onPaste={handlePaste} className="min-h-[50vh] rounded-b-2xl">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
