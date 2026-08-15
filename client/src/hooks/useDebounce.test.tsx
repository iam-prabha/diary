import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useDebounce('start', 300))
    expect(result.current).toBe('start')
  })

  it('updates the value after the delay', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('b')
  })

  it('resets the timer when the value changes rapidly', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })

    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(150))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBe('c')
  })
})
