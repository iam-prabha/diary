export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[rgb(var(--paper-line))]/60 ${className}`} />
}

export function EntryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[rgb(var(--paper-line))] bg-[rgb(var(--paper-card))] p-5">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <Skeleton className="mb-3 h-6 w-2/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="mb-2 h-4 w-5/6" />
      <Skeleton className="mb-4 h-4 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  )
}
