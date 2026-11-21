"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const raw = localStorage.getItem("mentorlagbe-user");
        const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        const token = typeof parsed.token === "string" ? parsed.token : null;

        await apiRequest("/api/payments/verify-session", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: JSON.stringify({ sessionId }),
        });

        if (raw) {
          const updated = { ...parsed };
          if (updated.user && typeof updated.user === "object") {
            updated.user = {
              ...(updated.user as Record<string, unknown>),
              plan: "pro",
            };
          } else {
            updated.plan = "pro";
          }
          localStorage.setItem("mentorlagbe-user", JSON.stringify(updated));
          window.dispatchEvent(new Event("mentorlagbe-auth-change"));
        }

        setVerified(true);
        toast.success("Pro plan activated!");
      } catch {
        toast.error("Could not verify payment session automatically.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [sessionId]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {verifying ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Verifying your payment...
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {verified ? "Payment Successful!" : "Payment Received"}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your MentorLagbe account has been upgraded to the Pro plan.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/dashboard"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/tuitions"
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                Browse Tuitions
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
