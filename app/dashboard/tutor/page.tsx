"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  Crown,
  PlusCircle,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  expertSubjects?: string;
  certifications?: string;
  skills?: string;
}

interface TutorTuitionItem {
  isActive?: boolean;
  approvalStatus?: string;
}

interface StudentSeekPreview {
  id: string;
  subject: string;
  classLevel: string;
  mode: string;
  preferredSchedule: string;
  monthlyBudget: number;
  preferredTutorName?: string;
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

function readStudentSeeks(): StudentSeekPreview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mentorlagbe-student-requests");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StudentSeekPreview[]) : [];
  } catch {
    return [];
  }
}

export default function TutorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [tuitionCount, setTuitionCount] = useState<number>(0);
  const [activeApprovedCount, setActiveApprovedCount] = useState<number>(0);
  const [applicantCount, setApplicantCount] = useState<number>(0);
  const [studentSeeks, setStudentSeeks] = useState<StudentSeekPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { user: currentUser, token } = readSession();
    if (currentUser?.email) {
      const normalizedRole = (currentUser.role || "tutor").toLowerCase();
      if (normalizedRole !== "tutor") {
        router.replace("/dashboard");
        return;
      }
    }
    setUser(currentUser);
    setStudentSeeks(readStudentSeeks());

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
          const list = (
            Array.isArray(tuitionsRes.value)
              ? tuitionsRes.value
              : Array.isArray(val?.tuitions)
                ? val.tuitions
                : Array.isArray(val?.data)
                  ? val.data
                  : []
          ) as TutorTuitionItem[];
          setTuitionCount(list.length);
          const activeApproved = list.filter(
            (t) =>
              t.isActive !== false &&
              (t.approvalStatus || "").toLowerCase() === "approved",
          ).length;
          setActiveApprovedCount(activeApproved);
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
  }, [router]);

  const plan = (user?.plan || "free").toUpperCase();

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-300 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Hub</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
          >
            <UserCog className="h-4 w-4" />
            <span>Mentor Profile &amp; Skills</span>
          </Link>
        </MotionSection>

        {/* Hero Banner */}
        <MotionSection className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-700/80 dark:bg-[#06142e] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 right-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
          />
          <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
                Tutor Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-200 dark:to-indigo-300">
                  {user?.name || "Tutor"}
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-stone-200 dark:text-slate-200">
                Plan:{" "}
                <strong className="uppercase text-amber-300 dark:text-blue-300">
                  {plan}
                </strong>{" "}
                · Create online/offline batches or 1-on-1 sessions and review
                student applicants.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <MotionButton>
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Post Tuition</span>
                </Link>
              </MotionButton>
              <Link
                href="/dashboard/tutor/my-tuitions"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
              >
                <BookOpen className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>My Tuitions</span>
              </Link>
              <Link
                href="/dashboard/tutor/applicants"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
              >
                <Users className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>Applicants</span>
              </Link>
            </div>
          </div>
        </MotionSection>

        {/* Stats Cards */}
        <AutoList className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MotionCard
            index={0}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-blue-950/40 dark:hover:border-blue-500/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Posted
              </span>
              <BookOpen className="h-4 w-4 text-amber-700 dark:text-blue-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-800 bg-clip-text text-3xl font-extrabold text-transparent dark:from-white dark:via-blue-200 dark:to-sky-300">
              {loading ? "..." : tuitionCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              {plan === "FREE"
                ? `${Math.max(0, 2 - tuitionCount)} of 2 free posts left`
                : "Unlimited Pro posts"}
            </p>
          </MotionCard>

          <MotionCard
            index={1}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-emerald-50/35 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-emerald-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-emerald-950/30 dark:hover:border-emerald-400/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Active &amp; Approved
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-emerald-300 dark:to-teal-300">
              {loading ? "..." : activeApprovedCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Live in tuition directory
            </p>
          </MotionCard>

          <MotionCard
            index={2}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-blue-950/40 dark:hover:border-blue-500/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Student Applicants
              </span>
              <Users className="h-4 w-4 text-amber-700 dark:text-blue-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-blue-300 dark:to-sky-300">
              {loading ? "..." : applicantCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Incoming student requests
            </p>
          </MotionCard>

          <MotionCard
            index={3}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-indigo-950/35 dark:hover:border-blue-400/60"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Current Tier
              </span>
              <Crown className="h-4 w-4 text-amber-600 dark:text-blue-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-3xl font-extrabold text-transparent dark:from-blue-300 dark:via-indigo-200 dark:to-sky-300">
              {plan}
            </p>
            {plan !== "PRO" ? (
              <Link
                href="/pricing"
                className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:underline dark:text-blue-400"
              >
                <span>Upgrade to Tutor Pro</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Pro benefits active
              </p>
            )}
          </MotionCard>
        </AutoList>

        {/* Tutor Credentials & Open Student Mentor Seeks */}
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <MotionCard
            index={0}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 lg:col-span-5"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              <Award className="h-4 w-4" />
              <span>Mentor Credentials</span>
            </div>
            <h2 className="mt-1.5 text-lg font-extrabold text-stone-900 dark:text-white">
              Your{" "}
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                Teaching Identity
              </span>
            </h2>

            <div className="mt-4 space-y-2.5 text-xs text-stone-700 dark:text-slate-200">
              <p>
                <strong className="text-stone-900 dark:text-white">
                  Expert Subjects:
                </strong>{" "}
                {user?.expertSubjects || "Not added yet"}
              </p>
              <p>
                <strong className="text-stone-900 dark:text-white">
                  Certifications:
                </strong>{" "}
                {user?.certifications || "Not added yet"}
              </p>
              <p>
                <strong className="text-stone-900 dark:text-white">
                  Core Skills:
                </strong>{" "}
                {user?.skills || "Not added yet"}
              </p>
            </div>

            <Link
              href="/dashboard/profile"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline dark:text-blue-400 sm:text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Update Expertise &amp; Certifications</span>
            </Link>
          </MotionCard>

          <MotionCard
            index={1}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 lg:col-span-7"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                  <Compass className="h-4 w-4" />
                  <span>Student Mentor Requests</span>
                </div>
                <h2 className="mt-1.5 text-lg font-extrabold text-stone-900 dark:text-white">
                  Students Seeking{" "}
                  <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                    Custom Sessions
                  </span>
                </h2>
              </div>
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-blue-500/20 dark:text-blue-200">
                {studentSeeks.length} posted
              </span>
            </div>

            {studentSeeks.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] p-4 text-xs text-stone-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                No custom student mentor requests posted yet. When students post
                custom subject/schedule seeks, they appear here for reference.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {studentSeeks.slice(0, 3).map((seek) => (
                  <div
                    key={seek.id}
                    className="rounded-xl border border-stone-200 bg-[#faf7f2] p-3.5 text-xs dark:border-slate-700/80 dark:bg-slate-950"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-stone-900 dark:text-white">
                        {seek.subject} · {seek.classLevel} ({seek.mode})
                      </span>
                      <span className="font-bold text-amber-800 dark:text-blue-300">
                        ৳{Number(seek.monthlyBudget || 0).toLocaleString()}/mo
                      </span>
                    </div>
                    <p className="mt-1 text-stone-600 dark:text-slate-300">
                      Schedule: <strong>{seek.preferredSchedule}</strong>
                      {seek.preferredTutorName
                        ? ` · Requested: ${seek.preferredTutorName}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </MotionCard>
        </div>
      </div>
    </div>
  );
}
