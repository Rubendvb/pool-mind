export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className ?? ""}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="pb-24 max-w-lg mx-auto w-full px-4 pt-16 flex flex-col gap-4">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-36 w-full" />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="pb-24 max-w-lg mx-auto w-full px-4 pt-16 flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}
