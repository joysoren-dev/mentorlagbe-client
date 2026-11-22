"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallbackPage() {
  const [statusMessage, setStatusMessage] = useState(
    "Completing Google sign-in...",
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rawData = params.get("data");
    const errorParam = params.get("error");

    if (errorParam || !rawData) {
      toast.error("Google sign-in was cancelled or failed.");
      setStatusMessage("Google login failed. Redirecting...");
      const timer = setTimeout(() => {
        window.location.replace("/sign-in");
      }, 1000);
      return () => clearTimeout(timer);
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(rawData)) as Record<
        string,
        unknown
      >;

      localStorage.setItem("mentorlagbe-user", JSON.stringify(parsed));
      window.dispatchEvent(new Event("mentorlagbe-auth-change"));

      toast.success("Signed in with Google!");
      setStatusMessage("Sign-in successful! Redirecting...");
      window.location.replace("/tuitions");
    } catch {
      toast.error("Could not process Google login response.");
      setStatusMessage("Could not process login response. Redirecting...");
      setTimeout(() => {
        window.location.replace("/sign-in");
      }, 1000);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent px-4 text-stone-900 dark:text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-7 text-center shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-amber-700 dark:text-blue-400" />
        <p className="mt-3 text-base font-semibold">{statusMessage}</p>
        <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}
