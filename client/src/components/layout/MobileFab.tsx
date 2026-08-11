import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'

export function MobileFab() {
  const location = useLocation()
  if (location.pathname.startsWith('/new') || location.pathname.startsWith('/edit')) return null

  return (
    <Link
      to="/new"
      className="fixed bottom-6 right-6 z-30 grid size-14 touch-target place-items-center rounded-full bg-[rgb(var(--accent))] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:hidden"
      aria-label="New entry"
    >
      <Plus className="size-6" />
    </Link>
  )
}
