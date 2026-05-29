// src/components/ui/Skeleton.jsx

export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={['skeleton rounded-lg', className].join(' ')}
      style={style}
    />
  );
}

export function PromptSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <div className="rounded-xl border border-border-subtle bg-bg-elevated p-5 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function DiagnosticSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="card p-4 flex items-start gap-3"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Skeleton className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3.5" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  );
}
