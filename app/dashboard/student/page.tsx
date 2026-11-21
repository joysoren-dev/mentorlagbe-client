"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  XCircle,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface ApplicationItem {
  id?: string;
  _id?: string;
  tuitionTitle?: string;
  tuitionSubject?: string;
  monthlyFee?: number;
  status?: string;
}

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
    const token = typeof parsed.token === "string" ? parsed.token : null;
    const candidate =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as StoredUser)
        : (parsed as StoredUser);
    return { user: candidate, token };
  } catch {
    return { user: null, token: null };
  }
}

export default function StudentDashboardOverview() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: currentUser, token } = readSession();
    setUser(currentUser);

    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await apiRequest<unknown>(
          "/api/applications/my-applications",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const obj =
          res && typeof res === "object"
            ? (res as { applications?: unknown; data?: unknown })
            : null;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(obj?.applications)
            ? obj.applications
            : Array.isArray(obj?.data)
              ? obj.data
              : [];
        setApplications(list as ApplicationItem[]);
      } catch {
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  const totalApplied = applications.length;
  const acceptedCount = applications.filter(
    (a) =>
      (a.status || "").toLowerCase() === "accepted" ||
      (a.status || "").toLowerCase() === "approved",
  ).length;
  const pendingCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending",
  ).length;
  const rejectedCount = applications.filter(
    (a) => (a.status || "").toLowerCase() === "rejected",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#06142e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Student Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Welcome, {user?.name || "Student"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Plan:{" "}
              <strong className="uppercase">{user?.plan || "free"}</strong> ·
              Track your tuition applications and discover mentors.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/student/my-applications"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <FileText className="h-4 w-4" />
              <span>My Applications</span>
            </Link>
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-500"
            >
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span>Browse Tuitions</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Total Applied
              </span>
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : totalApplied}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Accepted</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : acceptedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">Rejected</span>
              <XCircle className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : rejectedCount}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Current Plan: {(user?.plan || "free").toUpperCase()}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upgrade to Pro Student ($10) anytime from Pricing for priority
                booking.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View Pricing</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
