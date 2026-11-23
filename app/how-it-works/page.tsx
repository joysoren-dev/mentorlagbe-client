"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

type UserRole = "student" | "tutor" | "admin" | null;

interface StepItem {
  id: string;
  step: string;
  title: string;
  description: string;
  tip: string;
  icon: typeof SearchCheck;
  getAction: (role: UserRole) => { label: string; href: string };
}

const STUDENT_STEPS: StepItem[] = [
  {
    id: "student-01",
    step: "01",
    title: "Search & Filter Batches",
    description:
      "Browse active tuitions by subject, class level, online or local mode, and monthly fee to find the right fit.",
    tip: "Only admin-approved batches appear in the public directory, so every listing you see is reviewed for quality.",
    icon: SearchCheck,
    getAction: () => ({
      label: "Browse Active Tuitions",
      href: "/tuitions",
    }),
  },
  {
    id: "student-02",
    step: "02",
    title: "Review Batch & Pick Your Time",
    description:
      "Check weekly schedule, mentor details, location or online mode, and customize your 7-day & 24-hour preferred time slot.",
    tip: "Open any tuition card to view full batch details and select the exact days and hours that fit your routine.",
    icon: BookOpenCheck,
    getAction: () => ({
      label: "Explore Batch Details",
      href: "/tuitions",
    }),
  },
  {
    id: "student-03",
    step: "03",
    title: "Apply & Track Status Live",
    description:
      "Submit your application with a learning note and track Pending, Accepted, or Rejected updates in real time.",
    tip: "To apply as a learner, sign in with a Student account. Once approved by the tutor, status updates in My Applications.",
    icon: CheckCircle2,
    getAction: (role) => {
      if (role === "student") {
        return {
          label: "Open My Applications",
          href: "/dashboard/student/my-applications",
        };
      }
      if (role === "tutor") {
        return {
          label: "Browse Tuitions (Use Student Account to Apply)",
          href: "/tuitions",
        };
      }
      if (role === "admin") {
        return {
          label: "Open Admin Dashboard",
          href: "/dashboard/admin",
        };
      }
      return {
        label: "Create Student Account",
        href: "/sign-up?role=student",
      };
    },
  },
];

const TUTOR_STEPS: StepItem[] = [
  {
    id: "tutor-01",
    step: "01",
    title: "Create Mentor Account",
    description:
      "Sign up with your profile and teaching background to set up your presence on MentorLagbe.",
    tip: "Each role uses its own account—create or sign in with a Tutor account to access mentor tools.",
    icon: UserPlus,
    getAction: (role) => {
      if (role === "tutor") {
        return {
          label: "Open Tutor Dashboard",
          href: "/dashboard/tutor",
        };
      }
      return {
        label: "Create Tutor Account",
        href: "/sign-up?role=tutor",
      };
    },
  },
  {
    id: "tutor-02",
    step: "02",
    title: "Publish Tuition Listing",
    description:
      "Add batch title, subject, class level, schedule, mode, and monthly fee for admin review and approval.",
    tip: "New batches start in Pending moderation and go live on Browse Tuitions right after admin approval.",
    icon: ClipboardCheck,
    getAction: (role) => {
      if (role === "tutor") {
        return {
          label: "Post a Tuition Batch",
          href: "/dashboard/tutor/post-tuition",
        };
      }
      if (role === "admin") {
        return {
          label: "Review Pending Batches",
          href: "/dashboard/admin/tuitions",
        };
      }
      return {
        label: "Sign In as Tutor",
        href: "/sign-in",
      };
    },
  },
  {
    id: "tutor-03",
    step: "03",
    title: "Review & Approve Students",
    description:
      "Inspect student requests, preferred schedules, and learning notes, then approve or reject applications in one click.",
    tip: "Every student application shows their chosen days, time slot, and contact details inside your Applicants tab.",
    icon: ShieldCheck,
    getAction: (role) => {
      if (role === "tutor") {
        return {
          label: "Manage Student Applicants",
          href: "/dashboard/tutor/applicants",
        };
      }
      if (role === "admin") {
        return {
          label: "Open Admin Center",
          href: "/dashboard/admin",
        };
      }
      return {
        label: "Browse Active Tuitions",
        href: "/tuitions",
      };
    },
  },
];

function readUserRole(): UserRole {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const userObj =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as { role?: string })
        : (parsed as { role?: string });
    const normalized = userObj.role?.toLowerCase();
    if (
      normalized === "student" ||
      normalized === "tutor" ||
      normalized === "admin"
    ) {
      return normalized;
    }
    return null;
  } catch {
    return null;
  }
}

export default function HowItWorksPage() {
  const [role, setRole] = useState<UserRole>(null);
  const [expandedId, setExpandedId] = useState<string>("student-01");

  useEffect(() => {
    setRole(readUserRole());
    const syncRole = () => setRole(readUserRole());
    window.addEventListener("mentorlagbe-auth-change", syncRole);
    return () =>
      window.removeEventListener("mentorlagbe-auth-change", syncRole);
  }, []);

  const toggleCard = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  const renderStepCard = (
    item: StepItem,
    variant: "student" | "tutor",
    idx: number,
  ) => {
    const Icon = item.icon;
    const isExpanded = expandedId === item.id;
    const action = item.getAction(role);

    return (
      <MotionCard
        key={item.id}
        index={idx}
        className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-6 text-left backdrop-blur-xs transition-all duration-300 ${
          isExpanded
            ? "border-amber-600 bg-gradient-to-b from-[#fffdf9] to-amber-50/60 shadow-lg ring-2 ring-amber-600/20 dark:border-blue-500 dark:from-slate-900 dark:to-blue-950/45 dark:ring-blue-500/20"
            : variant === "student"
              ? "border-stone-200/90 bg-gradient-to-b from-[#fffdf9] via-[#fffdf9] to-amber-50/35 shadow-xs hover:border-amber-600/70 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/30 dark:hover:border-blue-500/70 dark:hover:shadow-blue-950/40"
              : "border-stone-200/90 bg-gradient-to-b from-[#faf7f2] via-[#fffdf9] to-amber-50/40 shadow-xs hover:border-amber-600/70 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/30 dark:hover:border-blue-500/70 dark:hover:shadow-blue-950/40"
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/75 via-white/15 to-transparent dark:from-white/5 dark:to-transparent"
        />

        <div
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          onClick={() => toggleCard(item.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleCard(item.id);
            }
          }}
          className="relative flex-1 focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${
                variant === "student"
                  ? "bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-amber-800 dark:from-blue-500/20 dark:to-sky-500/15 dark:text-blue-400"
                  : "bg-gradient-to-br from-amber-700/20 to-orange-600/15 text-amber-900 dark:from-indigo-500/20 dark:to-blue-500/15 dark:text-blue-300"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>

            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-b from-stone-300 to-stone-200 bg-clip-text text-3xl font-black tracking-tight text-transparent transition-colors duration-300 group-hover:from-amber-500/70 group-hover:to-orange-400/50 dark:from-slate-700 dark:to-slate-800 dark:group-hover:from-blue-400/60 dark:group-hover:to-indigo-500/40">
                {item.step}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-stone-400 transition-transform duration-200 dark:text-slate-400 ${
                  isExpanded
                    ? "rotate-180 text-amber-700 dark:text-blue-400"
                    : ""
                }`}
              />
            </div>
          </div>

          <h3 className="mt-5 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
            {item.description}
          </p>

          {isExpanded && (
            <div className="mt-4 rounded-xl border border-amber-300/80 bg-amber-50/90 p-3.5 text-xs leading-relaxed text-stone-700 dark:border-blue-800/60 dark:bg-blue-950/45 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-blue-400" />
                <span>{item.tip}</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative mt-5 border-t border-stone-200/80 pt-4 dark:border-slate-800">
          <Link
            href={action.href}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </MotionCard>
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-[#16120e] py-14 text-white dark:bg-[#06142e] sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-600/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 -bottom-24 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl dark:bg-indigo-500/20"
        />

        <MotionSection className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
            Simple &amp; Transparent Workflow
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            How{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
              MentorLagbe
            </span>{" "}
            Works
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-300 dark:text-slate-300 sm:text-base">
            Click any step below to see how students, tutors, and admin
            moderation work together—and jump straight into action.
          </p>
        </MotionSection>
      </section>

      {/* For Students */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MotionSection className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              For Students &amp; Learners
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Find &amp; Join a Tuition Batch in 3 Steps
            </h2>
          </div>
          <MotionButton>
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>Browse Active Tuitions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MotionButton>
        </MotionSection>

        <AutoList className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STUDENT_STEPS.map((item, idx) =>
            renderStepCard(item, "student", idx),
          )}
        </AutoList>
      </section>

      {/* For Tutors / Mentors */}
      <section className="border-t border-stone-200/80 bg-transparent py-12 dark:border-slate-800/80 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionSection className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                For Tutors &amp; Mentors
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
                Launch Your Batch &amp; Reach Students
              </h2>
            </div>
            <MotionButton>
              <Link
                href={
                  role === "tutor" ? "/dashboard/tutor" : "/sign-up?role=tutor"
                }
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <span>
                  {role === "tutor"
                    ? "Open Tutor Dashboard"
                    : "Join as a Tutor"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionButton>
          </MotionSection>

          <AutoList className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TUTOR_STEPS.map((item, idx) => renderStepCard(item, "tutor", idx))}
          </AutoList>

          {/* Bottom CTA */}
          <MotionSection className="relative mt-12 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#1c1610] p-8 text-center text-white shadow-xl dark:border-blue-500/30 dark:bg-[#06142e] sm:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/3 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
            />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-stone-300 dark:text-slate-300 sm:text-base">
                Explore live tuition batches right now or jump into your role
                dashboard to manage batches and applications.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <MotionButton>
                  <Link
                    href="/tuitions"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                  >
                    <span>Browse Tuitions</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </MotionButton>
                <MotionButton>
                  <Link
                    href={role ? "/dashboard" : "/sign-up"}
                    className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {role ? "Go to Dashboard" : "Create Free Account"}
                  </Link>
                </MotionButton>
              </div>
            </div>
          </MotionSection>
        </div>
      </section>
    </div>
  );
}
