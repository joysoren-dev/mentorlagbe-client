"use client";

import { useEffect, useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-[#070d19] dark:text-slate-100 px-4">
      <div className="text-center space-y-2">
        <p className="text-base font-medium">{statusMessage}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}
