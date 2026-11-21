"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  GraduationCap,
  Lock,
  Mail,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "tutor">("student");
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignUp = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    toast.info("Redirecting to Google Sign Up...");
    window.location.href = `${apiBase}/api/auth/google?role=${role}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || !password.trim()) {
      toast.error("Please fill in your name, email, and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
          plan: "free",
        }),
      });

      toast.success("Account created successfully! Please sign in.");
      router.push("/sign-in");
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Could not create account right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-[#070d19] sm:py-16">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Join MentorLagbe
            </p>
            <h1 className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              Create Your Account
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Sign up as a student or mentor to get started.
            </p>
          </div>

          {/* Role Selector */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
                role === "student"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("tutor")}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition sm:text-sm ${
                role === "tutor"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Tutor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative mt-1.5">
                <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min. 6 characters)"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <span>
                {submitting ? "Creating Account..." : "Create Account"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs font-medium uppercase text-slate-400">
              or
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Sign up with Google */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
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

          <p className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
