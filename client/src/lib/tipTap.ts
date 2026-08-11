import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import { ExtendedImage } from './imageExtension'
import { getOptimizedUrl } from './media'

export function renderTipTapHTML(json: string): string {
  try {
    const doc = JSON.parse(json)
    const html = generateHTML(doc, [
      StarterKit.configure({ link: false }),
      ExtendedImage,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ])
    return html.replace(/<img([^>]*)src="([^"]+)"([^>]*)>/g, (_match, pre, src, post) =>
      `<img${pre}src="${getOptimizedUrl(src, 1600)}"${post}>`)
  } catch {
    return '<p></p>'
  }
}
