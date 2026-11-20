export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-64 flex-col justify-between rounded-xl border border-slate-200 p-5 dark:border-slate-800"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="h-5 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
