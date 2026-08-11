import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function useGlobalShortcuts() {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable
      const isCmd = e.metaKey || e.ctrlKey

      if (e.key === 'n' && !isTyping && !isCmd) {
        e.preventDefault()
        navigate('/new')
      }
      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        const search = document.querySelector<HTMLInputElement>('[data-search-input]')
        search?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate])
}
