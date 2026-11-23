"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Crown,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Phone,
  PlusCircle,
  Shield,
  Sparkles,
  Tag,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
  phone?: string;
  bio?: string;
  image?: string;
  expertSubjects?: string;
  certifications?: string;
  skills?: string;
  classLevel?: string;
  preferredSubjects?: string;
}

function getStoredUser(): DashboardUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    const candidateObj =
      "user" in record && record.user && typeof record.user === "object"
        ? (record.user as Record<string, unknown>)
        : record;

    const email =
      typeof candidateObj.email === "string" ? candidateObj.email : "";
    const name = typeof candidateObj.name === "string" ? candidateObj.name : "";
    const roleRaw =
      typeof candidateObj.role === "string" ? candidateObj.role : "";

    if (!email && !name && !roleRaw) return null;

    const str = (key: string, fallback = "") =>
      typeof candidateObj[key] === "string"
        ? (candidateObj[key] as string)
        : fallback;

    return {
      id: str("id") || str("_id") || undefined,
      name: name || (email ? email.split("@")[0] : "User"),
      email,
      role: (roleRaw || "student").toLowerCase(),
      plan: str("plan", "free").toLowerCase(),
      phone: str("phone"),
      bio: str("bio"),
      image: str("image"),
      expertSubjects: str("expertSubjects"),
      certifications: str("certifications"),
      skills: str("skills"),
      classLevel: str("classLevel"),
      preferredSubjects: str("preferredSubjects"),
    };
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      const stored = getStoredUser();
      if (!stored) {
        router.replace("/sign-in");
        return;
      }
      setUser(stored);
      setLoading(false);
    };

    sync();
    window.addEventListener("mentorlagbe-auth-change", sync);
    return () => window.removeEventListener("mentorlagbe-auth-change", sync);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-48 animate-pulse rounded-2xl border border-stone-200/90 bg-[#fffdf9]/90 dark:border-slate-800 dark:bg-slate-900/90" />
        </div>
      </div>
    );
  }

  const role = user.role || "student";
  const planLabel = (user.plan || "free").toUpperCase();
  const initials = (user.name || "U").slice(0, 1).toUpperCase();

  const roleGuide =
    role === "tutor"
      ? {
          workspaceTitle: "Tutor Mentorship Workspace",
          whyHere:
            "You are here to create batches, manage student applicants, and grow enrollments.",
          doingNow:
            "Managing your tutor identity, expertise credentials, batch workflow, and plan status.",
          nextStep:
            "Open Tutor Workspace, post a new batch, or review incoming student applicants.",
        }
      : role === "admin"
        ? {
            workspaceTitle: "Admin Moderation & Oversight Center",
            whyHere:
              "You are here to keep tuition listings accurate, review users, and maintain platform quality.",
            doingNow:
              "Overseeing role-based platform workflows, listings, and account integrity.",
            nextStep:
              "Verify tuition moderation queue, user roles, or review platform payments.",
          }
        : {
            workspaceTitle: "Student Learning Workspace",
            whyHere:
              "You are here to find verified mentors/batches, apply for free, and track your application status.",
            doingNow:
              "Viewing your student account, active application status, and learning preferences.",
            nextStep:
              "Open My Applications, browse active tuitions, or open your profile.",
          };

  return (
    <div className="min-h-screen bg-transparent py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Workspace Banner */}
        <MotionSection className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-800 dark:bg-[#06142e] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
          />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-amber-600/20 dark:border-blue-400/50 dark:bg-blue-600/20">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-300 dark:text-blue-300">
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{roleGuide.workspaceTitle}</span>
                  <span className="rounded bg-amber-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white dark:bg-blue-500/25">
                    {role}
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, {user.name}
                </h1>

                <p className="max-w-2xl text-sm text-stone-300 dark:text-slate-300">
                  {roleGuide.whyHere}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-300 dark:text-slate-300 sm:text-sm">
                  {user.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                      <span>{user.email}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                    <span>Account Tier: {planLabel}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {role === "admin" && (
                <MotionButton>
                  <Link
                    href="/dashboard/admin"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Center</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MotionButton>
              )}
              {role === "tutor" && (
                <MotionButton>
                  <Link
                    href="/dashboard/tutor"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Tutor Workspace</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MotionButton>
              )}
              {role === "student" && (
                <MotionButton>
                  <Link
                    href="/dashboard/student/my-applications"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                  >
                    <FileText className="h-4 w-4" />
                    <span>My Applications</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MotionButton>
              )}
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-blue-500"
              >
                <BookOpen className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>Browse Tuitions</span>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-blue-500"
              >
                <HelpCircle className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>How It Works</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900/90 dark:hover:border-blue-500"
              >
                <Sparkles className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>Pricing</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300 hover:bg-amber-500/25 dark:border-blue-400/50 dark:bg-blue-500/15 dark:text-blue-200 dark:hover:border-blue-300 dark:hover:bg-blue-500/25"
              >
                <UserCog className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </MotionSection>

        {/* Orientation Guide */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <MotionCard
            index={0}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-blue-400">
              <Compass className="h-4 w-4" />
              <span>What You Are Doing Here</span>
            </div>
            <p className="mt-2 text-sm text-stone-700 dark:text-slate-300">
              {roleGuide.doingNow}
            </p>
          </MotionCard>

          <MotionCard
            index={1}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-blue-400">
              <ArrowRight className="h-4 w-4" />
              <span>What To Do Next</span>
            </div>
            <p className="mt-2 text-sm text-stone-700 dark:text-slate-300">
              {roleGuide.nextStep}
            </p>
          </MotionCard>
        </div>

        {/* Role Quick Action Cards */}
        {role === "student" && (
          <AutoList className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <MotionCard
              index={0}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Applied Batches
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Track applications you submit to tutors and check whether they
                are pending, accepted, or rejected.
              </p>
              <Link
                href="/dashboard/student/my-applications"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Open My Applications</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionCard>

            <MotionCard
              index={1}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                How Students Apply
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Browse approved tuition listings for free, check weekly days and
                monthly fee, and apply directly.
              </p>
              <Link
                href="/tuitions"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Go to Browse Tuitions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionCard>

            <MotionCard
              index={2}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <Tag className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Student Overview &amp; Pricing
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                View your student dashboard stats or inspect transparent plans
                anytime.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/student"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Student Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>View Pricing</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </MotionCard>
          </AutoList>
        )}

        {role === "tutor" && (
          <AutoList className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <MotionCard
              index={0}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                My Tuition Batches
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Create and manage batches with subject, class level, schedule,
                and monthly fee.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/tutor/my-tuitions"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Manage Batches</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-stone-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-blue-400"
                >
                  <span>+ Post New</span>
                </Link>
              </div>
            </MotionCard>

            <MotionCard
              index={1}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Incoming Applicants
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Review student requests on your batches and approve or reject
                applications.
              </p>
              <Link
                href="/dashboard/tutor/applicants"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Review Applicants</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionCard>

            <MotionCard
              index={2}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <Crown className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Tutor Overview &amp; Plan ({planLabel})
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Open your full tutor summary or compare Mentor Pro and Coaching
                plans.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/tutor"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Tutor Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Pricing Plans</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </MotionCard>
          </AutoList>
        )}

        {role === "admin" && (
          <AutoList className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <MotionCard
              index={0}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Tuition Moderation
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Approve or reject tutor batch listings so students only see
                verified posts.
              </p>
              <Link
                href="/dashboard/admin/tuitions"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Open Moderation Queue</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionCard>

            <MotionCard
              index={1}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Users &amp; Roles
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                Inspect student, tutor, and admin accounts across the platform.
              </p>
              <Link
                href="/dashboard/admin/users"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>Manage Users &amp; Roles</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionCard>

            <MotionCard
              index={2}
              className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-600/15 dark:text-blue-400">
                <Crown className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                Admin Overview &amp; Pricing
              </h2>
              <p className="mt-1.5 text-sm text-stone-600 dark:text-slate-400">
                View moderation stats and review subscription plan tiers.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/admin"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Admin Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span>Pricing Plans</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </MotionCard>
          </AutoList>
        )}

        {/* Compact Profile Link Bar */}
        <MotionSection className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 dark:text-slate-400 sm:text-sm">
            <span className="font-semibold text-stone-900 dark:text-white">
              Role Profile &amp; Preferences:
            </span>
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                <span>{user.phone}</span>
              </span>
            )}
            {role === "tutor" && user.expertSubjects && (
              <span className="inline-flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                <span>{user.expertSubjects}</span>
              </span>
            )}
            {role === "student" && user.classLevel && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                <span>{user.classLevel}</span>
              </span>
            )}
            {!user.phone && !user.expertSubjects && !user.classLevel && (
              <span>
                Keep your photo, contact info, and role credentials up to date.
              </span>
            )}
          </div>

          <MotionButton>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500 sm:text-sm"
            >
              <UserCog className="h-4 w-4" />
              <span>Open Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </MotionButton>
        </MotionSection>
      </div>
    </div>
  );
}
