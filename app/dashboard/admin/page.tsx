"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock, Shield, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface AdminTuitionSummary {
  _id?: string;
  id?: string;
  approvalStatus?: string;
}

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
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

export default function AdminDashboardOverview() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tuitions, setTuitions] = useState<AdminTuitionSummary[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
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

        const [tuitionsRes, usersRes] = await Promise.allSettled([
          apiRequest<unknown>("/api/tuitions/admin/all", { headers }),
          apiRequest<unknown>("/api/users", { headers }),
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
          setTuitions(list as AdminTuitionSummary[]);
        }

        if (usersRes.status === "fulfilled") {
          const val = usersRes.value as {
            users?: unknown[];
            data?: unknown[];
          };
          const list = Array.isArray(usersRes.value)
            ? usersRes.value
            : Array.isArray(val?.users)
              ? val.users
              : Array.isArray(val?.data)
                ? val.data
                : [];
          setUserCount(list.length);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const pendingCount = tuitions.filter(
    (t) => (t.approvalStatus || "pending").toLowerCase() === "pending",
  ).length;
  const approvedCount = tuitions.filter(
    (t) => (t.approvalStatus || "").toLowerCase() === "approved",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#06142e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Moderation Center</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Welcome, {user?.name || "Admin"}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Review pending tuition batches, manage live listings, and control
              user roles.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin/tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <BookOpen className="h-4 w-4" />
              <span>Moderate Tuitions</span>
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-500"
            >
              <UserCheck className="h-4 w-4 text-blue-400" />
              <span>Manage Users</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Pending Approvals
              </span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Approved Batches
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Total Batches
              </span>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : tuitions.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Platform Users
              </span>
              <UserCheck className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : userCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
