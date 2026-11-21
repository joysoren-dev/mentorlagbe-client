"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Crown, PlusCircle, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
}

function readSession(): { user: StoredUser | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const token =
      typeof parsed.token === "string"
        ? parsed.token
        : typeof parsed.accessToken === "string"
          ? parsed.accessToken
          : null;
    const candidate =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as StoredUser)
        : (parsed as StoredUser);
    return { user: candidate, token };
  } catch {
    return { user: null, token: null };
  }
}

export default function TutorDashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tuitionCount, setTuitionCount] = useState<number>(0);
  const [applicantCount, setApplicantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: currentUser, token } = readSession();
    setUser(currentUser);

    const loadStats = async () => {
      try {
        setLoading(true);
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const [tuitionsRes, appsRes] = await Promise.allSettled([
          apiRequest<unknown>("/api/tuitions/my-tuitions", { headers }),
          apiRequest<unknown>("/api/applications/tutor", { headers }),
        ]);

        if (tuitionsRes.status === "fulfilled") {
          const val = tuitionsRes.value as {
            tuitions?: unknown[];
            data?: unknown[];
          };
          const list = Array.isArray(tuitionsRes.value)
            ? tuitionsRes.value
            : Array.isArray(val?.tuitions)
              ? val.tuitions
              : Array.isArray(val?.data)
                ? val.data
                : [];
          setTuitionCount(list.length);
        }

        if (appsRes.status === "fulfilled") {
          const val = appsRes.value as {
            applications?: unknown[];
            data?: unknown[];
          };
          const list = Array.isArray(appsRes.value)
            ? appsRes.value
            : Array.isArray(val?.applications)
              ? val.applications
              : Array.isArray(val?.data)
                ? val.data
                : [];
          setApplicantCount(list.length);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const plan = (user?.plan || "free").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#06142e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Tutor Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Welcome, {user?.name || "Tutor"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Plan: <strong className="uppercase">{plan}</strong> · Manage your
              tuition batches and review student applicants.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/tutor/post-tuition"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Tuition</span>
            </Link>
            <Link
              href="/dashboard/tutor/my-tuitions"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-500"
            >
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>My Tuitions</span>
            </Link>
            <Link
              href="/dashboard/tutor/applicants"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-500"
            >
              <Users className="h-4 w-4 text-blue-400" />
              <span>Applicants</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                My Batches
              </span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : tuitionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Student Applicants
              </span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : applicantCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Current Tier
              </span>
              <Crown className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {plan}
            </p>
            {plan !== "PRO" && (
              <Link
                href="/pricing"
                className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:underline"
              >
                Upgrade to Tutor Pro →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
