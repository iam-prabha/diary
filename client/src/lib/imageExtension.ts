import Image from '@tiptap/extension-image'

export const ExtendedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => element.getAttribute('data-width'),
        renderHTML: attrs =>
          attrs.width ? { 'data-width': attrs.width, style: `width:${attrs.width}%;` } : {},
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') ?? 'center',
        renderHTML: attrs =>
          attrs.align && attrs.align !== 'center' ? { 'data-align': attrs.align } : {},
      },
    }
  },
}).configure({ inline: false, allowBase64: false })
