import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TagChip } from '@/components/tags/TagChip'
import type { Tag } from '@/types'

const tag: Tag = { id: 't1', name: 'work', color: '#ff0000' }

describe('TagChip', () => {
  it('renders as a plain span when no onClick is given', () => {
    const { container } = render(<TagChip tag={tag} />)
    expect(container.querySelector('span')).toBeInTheDocument()
    expect(screen.getByText('work')).toBeInTheDocument()
  })

  it('renders as a button and calls onClick', async () => {
    const onClick = vi.fn()
    render(<TagChip tag={tag} onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses the tag color as the dot background', () => {
    const { container } = render(<TagChip tag={tag} />)
    const dot = container.querySelector('span > span')
    expect(dot).toHaveStyle({ backgroundColor: '#ff0000' })
  })

  it('falls back to the default accent color', () => {
    const { container } = render(<TagChip tag={{ ...tag, color: null }} />)
    const dot = container.querySelector('span > span')
    expect(dot).toHaveStyle({ backgroundColor: '#c4785e' })
  })
})
