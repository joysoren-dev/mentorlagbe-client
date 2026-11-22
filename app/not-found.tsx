import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="w-full rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-8 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-blue-400">
          404 Error
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
          The page or tuition listing you are looking for does not exist or may
          have been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
