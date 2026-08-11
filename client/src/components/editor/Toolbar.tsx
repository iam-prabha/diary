import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks, Quote, Code2, Highlighter as HighlightIcon,
  AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Undo2, Redo2, ImagePlus,
} from 'lucide-react'
import { uploadImage } from '@/lib/upload'

interface ToolbarProps {
  editor: Editor
}

function ToolButton({ active, onClick, label, children }: {
  active?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
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
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-[rgb(var(--paper-line))]" />
}

export function Toolbar({ editor }: ToolbarProps) {
  const setLink = () => {
    const url = window.prompt('URL', editor.getAttributes('link').href || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const res = await uploadImage(file)
        editor.chain().focus().setImage({ src: res.url }).run()
      }
    }
    input.click()
  }

  return (
    <div className="sticky top-16 z-10 mb-2 flex flex-wrap items-center gap-0.5 rounded-t-2xl border border-b-0 border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-1.5 shadow-sm">
      <ToolButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="size-4" />
      </ToolButton>
      <ToolButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton
        label="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 className="size-4" />
      </ToolButton>
      <ToolButton
        label="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton label="Bold (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
        <Strikethrough className="size-4" />
      </ToolButton>
      <ToolButton label="Highlight" onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
        <HighlightIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
        <Code className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <List className="size-4" />
      </ToolButton>
      <ToolButton label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListOrdered className="size-4" />
      </ToolButton>
      <ToolButton label="Task list" onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')}>
        <ListChecks className="size-4" />
      </ToolButton>
      <ToolButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        <Quote className="size-4" />
      </ToolButton>
      <ToolButton label="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
        <Code2 className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton label="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
        <AlignLeft className="size-4" />
      </ToolButton>
      <ToolButton label="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
        <AlignCenter className="size-4" />
      </ToolButton>
      <ToolButton label="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
        <AlignRight className="size-4" />
      </ToolButton>

      <Divider />

      <ToolButton label="Link (⌘K)" onClick={setLink} active={editor.isActive('link')}>
        <LinkIcon className="size-4" />
      </ToolButton>
      <ToolButton label="Add image" onClick={addImage}>
        <ImagePlus className="size-4" />
      </ToolButton>
    </div>
  )
}
