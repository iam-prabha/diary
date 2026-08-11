import { useEffect, useRef } from 'react'

export function useInfiniteScroll(callback: () => void, hasMore: boolean, loading: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) callbackRef.current()
      },
      { rootMargin: '200px' },
    )

    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading])

  return sentinelRef
}
