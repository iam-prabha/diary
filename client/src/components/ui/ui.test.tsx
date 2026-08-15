import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Loading } from '@/components/ui/Loading'
import { Skeleton, EntryCardSkeleton } from '@/components/ui/Skeleton'

describe('Loading', () => {
  it('renders the Diary brand mark', () => {
    render(<Loading />)
    expect(screen.getByText('Diary')).toBeInTheDocument()
  })
})

describe('Skeleton', () => {
  it('renders a div with the base classes', () => {
    const { container } = render(<Skeleton />)
    expect(container.querySelector('div')).toHaveClass('animate-pulse')
  })

  it('merges a custom className', () => {
    const { container } = render(<Skeleton className="h-10 w-20" />)
    expect(container.querySelector('div')).toHaveClass('h-10 w-20')
  })
})

describe('EntryCardSkeleton', () => {
  it('renders multiple skeleton blocks', () => {
    const { container } = render(<EntryCardSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(3)
  })
})
