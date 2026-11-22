export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 h-8 w-56 animate-pulse rounded-lg bg-stone-200/90 dark:bg-slate-800" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex h-64 flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/90 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded-full bg-stone-200/90 dark:bg-slate-800" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-stone-200/90 dark:bg-slate-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200/90 dark:bg-slate-800" />
            </div>
            <div className="flex items-center justify-between border-t border-stone-200/70 pt-4 dark:border-slate-800">
              <div className="h-5 w-20 animate-pulse rounded bg-stone-200/90 dark:bg-slate-800" />
              <div className="h-9 w-24 animate-pulse rounded-xl bg-stone-200/90 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
