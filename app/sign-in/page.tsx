"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { MotionButton, MotionSection } from "@/components/MotionPrimitives";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    toast.info("Redirecting to Google Sign In...");
    window.location.href = `${apiBase}/api/auth/google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password.trim()) {
      toast.error("Please enter both your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest<unknown>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      if (res && typeof res === "object") {
        localStorage.setItem("mentorlagbe-user", JSON.stringify(res));
        window.dispatchEvent(new Event("mentorlagbe-auth-change"));
      }

      toast.success("Signed in successfully!");
      router.push("/tuitions");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Could not sign in right now. Please check your credentials.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 sm:py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <MotionSection className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-blue-400">
              Welcome Back
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-stone-900 dark:text-white">
              Sign In to MentorLagbe
            </h1>
            <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-4 pl-10 text-sm text-stone-900 caret-amber-700 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:caret-blue-400 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-11 pl-10 text-sm text-stone-900 caret-amber-700 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:caret-blue-400 dark:placeholder-slate-500 dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-stone-400 transition hover:text-stone-700 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <MotionButton className="mt-2 w-full">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <span>{submitting ? "Signing In..." : "Sign In"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </MotionButton>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone-200 dark:bg-slate-800" />
            <span className="text-xs font-medium uppercase text-stone-400 dark:text-slate-500">
              or
            </span>
            <div className="h-px flex-1 bg-stone-200 dark:bg-slate-800" />
          </div>

          {/* Sign in with Google */}
          <MotionButton className="w-full">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-300 bg-[#faf7f2] px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-amber-50/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.54-1.14 2.85-2.4 3.72v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.97z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-5.01z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </MotionButton>

          <p className="mt-6 text-center text-xs text-stone-600 dark:text-slate-400 sm:text-sm">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Create Account
            </Link>
          </p>
        </MotionSection>
      </div>
    </div>
  );
}
