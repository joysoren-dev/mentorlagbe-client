import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <XCircle className="h-12 w-12 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Payment Cancelled
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No charges were made. You can try upgrading again anytime.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href="/pricing"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Pricing
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
