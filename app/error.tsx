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
      <p className="text-sm font-semibold uppercase tracking-wider text-rose-600">
        Something Went Wrong
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Unexpected Error Occurred
      </h1>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {error.message ||
          "We ran into an unexpected issue while loading this page. Please try again."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
