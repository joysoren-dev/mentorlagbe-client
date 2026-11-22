import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-transparent px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-8 text-center shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col items-center gap-3">
          <XCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
            No charges were made. You can try upgrading again anytime.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Back to Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-stone-300 bg-[#faf7f2] px-5 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-amber-50/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
