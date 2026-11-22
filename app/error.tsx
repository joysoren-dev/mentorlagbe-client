"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="w-full rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-8 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
          Something Went Wrong
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          Unexpected Error Occurred
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
          {error.message ||
            "We ran into an unexpected issue while loading this page. Please try again."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-[#faf7f2] px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
