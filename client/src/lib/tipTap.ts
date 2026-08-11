import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'

export function renderTipTapHTML(json: string): string {
  try {
    const doc = JSON.parse(json)
    return generateHTML(doc, [
      StarterKit.configure({ link: false }),
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ])
  } catch {
    return '<p></p>'
  }
}
