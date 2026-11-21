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

  const renderStepCard = (item: StepItem, variant: "student" | "tutor") => {
    const Icon = item.icon;
    const isExpanded = expandedId === item.id;
    const action = item.getAction(role);

    return (
      <div
        key={item.id}
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
        className={`group flex cursor-pointer flex-col justify-between rounded-2xl border p-6 text-left transition-all ${
          isExpanded
            ? "border-blue-500 bg-white shadow-md ring-2 ring-blue-500/15 dark:border-blue-500 dark:bg-slate-900"
            : variant === "student"
              ? "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                variant === "student"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>

            <div className="flex items-center gap-2">
              <span
                className={`text-2xl font-extrabold ${
                  variant === "student"
                    ? "text-slate-200 dark:text-slate-800"
                    : "text-slate-300 dark:text-slate-700"
                }`}
              >
                {item.step}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isExpanded
                    ? "rotate-180 text-blue-600 dark:text-blue-400"
                    : ""
                }`}
              />
            </div>
          </div>

          <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {item.description}
          </p>

          {isExpanded && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs leading-relaxed text-slate-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>{item.tip}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Link
            href={action.href}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19]">
      {/* Header Banner */}
      <section className="bg-[#06142e] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Simple &amp; Transparent Workflow
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            How MentorLagbe Works
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Click any step below to see how students, tutors, and admin
            moderation work together—and jump straight into action.
          </p>
        </div>
      </section>

      {/* For Students */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              For Students &amp; Learners
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Find &amp; Join a Tuition Batch in 3 Steps
            </h2>
          </div>
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>Browse Active Tuitions</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STUDENT_STEPS.map((item) => renderStepCard(item, "student"))}
        </div>
      </section>

      {/* For Tutors / Mentors */}
      <section className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900/40 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                For Tutors &amp; Mentors
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Launch Your Batch &amp; Reach Students
              </h2>
            </div>
            <Link
              href={
                role === "tutor" ? "/dashboard/tutor" : "/sign-up?role=tutor"
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>
                {role === "tutor" ? "Open Tutor Dashboard" : "Join as a Tutor"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TUTOR_STEPS.map((item) => renderStepCard(item, "tutor"))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl bg-[#06142e] p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Explore live tuition batches right now or jump into your role
              dashboard to manage batches and applications.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <span>Browse Tuitions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={role ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {role ? "Go to Dashboard" : "Create Free Account"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
