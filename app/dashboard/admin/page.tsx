"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Shield,
  UserCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface AdminTuitionSummary {
  _id?: string;
  id?: string;
  approvalStatus?: string;
}

interface AdminUserSummary {
  role?: string;
  plan?: string;
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
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tuitions, setTuitions] = useState<AdminTuitionSummary[]>([]);
  const [usersList, setUsersList] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: currentUser, token } = readSession();
    if (currentUser?.email) {
      const normalizedRole = (currentUser.role || "admin").toLowerCase();
      if (normalizedRole !== "admin") {
        router.replace("/dashboard");
        return;
      }
    }
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
          setUsersList(list as AdminUserSummary[]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [router]);

  const pendingCount = tuitions.filter(
    (t) => (t.approvalStatus || "pending").toLowerCase() === "pending",
  ).length;
  const approvedCount = tuitions.filter(
    (t) => (t.approvalStatus || "").toLowerCase() === "approved",
  ).length;

  const studentCount = usersList.filter(
    (u) => (u.role || "student").toLowerCase() === "student",
  ).length;
  const tutorCount = usersList.filter(
    (u) => (u.role || "").toLowerCase() === "tutor",
  ).length;

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="relative overflow-hidden flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-700/80 dark:bg-[#06142e] sm:flex-row sm:items-center sm:p-8">
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-24 right-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
          />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Moderation Center</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-200 dark:to-indigo-300">
                {user?.name || "Admin"}
              </span>
            </h1>
            <p className="mt-1 text-sm text-stone-200 dark:text-slate-200">
              Review pending tuition batches, track students &amp; tutors, and
              manage roles &amp; subscriptions.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <MotionButton>
              <Link
                href="/dashboard/admin/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
              >
                <BookOpen className="h-4 w-4" />
                <span>Moderate Tuitions</span>
              </Link>
            </MotionButton>
            <Link
              href="/dashboard/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
            >
              <UserCheck className="h-4 w-4 text-amber-300 dark:text-blue-400" />
              <span>Manage Users</span>
            </Link>
            <Link
              href="/dashboard/admin/payments"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
            >
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>Subscriptions</span>
            </Link>
          </div>
        </MotionSection>

        <AutoList className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MotionCard
            index={0}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-amber-950/30 dark:hover:border-amber-400/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pending Approvals
              </span>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-amber-300 dark:to-orange-300">
              {loading ? "..." : pendingCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Awaiting review
            </p>
          </MotionCard>

          <MotionCard
            index={1}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-emerald-50/35 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-emerald-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-emerald-950/30 dark:hover:border-emerald-400/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Approved Batches
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-emerald-300 dark:to-teal-300">
              {loading ? "..." : approvedCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Live listings
            </p>
          </MotionCard>

          <MotionCard
            index={2}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-blue-950/40 dark:hover:border-blue-500/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Batches
              </span>
              <BookOpen className="h-4 w-4 text-amber-700 dark:text-blue-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-800 bg-clip-text text-3xl font-extrabold text-transparent dark:from-white dark:via-blue-200 dark:to-sky-300">
              {loading ? "..." : tuitions.length}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              All submitted batches
            </p>
          </MotionCard>

          <MotionCard
            index={3}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-indigo-950/35 dark:hover:border-blue-400/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Platform Users
              </span>
              <UserCheck className="h-4 w-4 text-amber-700 dark:text-indigo-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-blue-300 dark:to-sky-300">
              {loading ? "..." : usersList.length}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              {studentCount} Students · {tutorCount} Tutors
            </p>
          </MotionCard>
        </AutoList>

        {/* Separate Student & Tutor Tracking Cards */}
        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
          <MotionCard
            index={0}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              <GraduationCap className="h-4 w-4" />
              <span>Student Tracking</span>
            </div>
            <h2 className="mt-1.5 text-lg font-extrabold text-stone-900 dark:text-white">
              Registered{" "}
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                Students ({loading ? "..." : studentCount})
              </span>
            </h2>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300 sm:text-sm">
              Track student accounts, subscription tiers, and role status
              separately from mentors.
            </p>
            <Link
              href="/dashboard/admin/users?role=student"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline dark:text-blue-400 sm:text-sm"
            >
              <span>Inspect Student Accounts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MotionCard>

          <MotionCard
            index={1}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              <UserCheck className="h-4 w-4" />
              <span>Tutor Tracking</span>
            </div>
            <h2 className="mt-1.5 text-lg font-extrabold text-stone-900 dark:text-white">
              Registered{" "}
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                Tutors ({loading ? "..." : tutorCount})
              </span>
            </h2>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300 sm:text-sm">
              Track mentor accounts, Pro/Free plans, role switches, and batch
              submissions.
            </p>
            <Link
              href="/dashboard/admin/users?role=tutor"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline dark:text-blue-400 sm:text-sm"
            >
              <span>Inspect Tutor Accounts</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}
