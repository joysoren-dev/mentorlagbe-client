"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface StepItem {
  stepNumber: string;
  title: string;
  description: string;
  icon: "search" | "apply" | "track" | "post" | "manage" | "grow";
}

const STUDENT_STEPS: StepItem[] = [
  {
    stepNumber: "01",
    title: "Search & Filter Batches",
    description:
      "Browse tuitions by subject, class level, study mode (online or local), and monthly budget to find the right fit.",
    icon: "search",
  },
  {
    stepNumber: "02",
    title: "Review & Apply Directly",
    description:
      "Check schedule details and monthly fees on any tuition listing, then submit your application in a few clicks.",
    icon: "apply",
  },
  {
    stepNumber: "03",
    title: "Track Real-Time Status",
    description:
      "Monitor pending, accepted, or rejected application updates from your student dashboard without confusion.",
    icon: "track",
  },
];

const TUTOR_STEPS: StepItem[] = [
  {
    stepNumber: "01",
    title: "Create Structured Listings",
    description:
      "Publish tuition batches with clear subject, class level, mode, weekly schedule, and monthly fee details.",
    icon: "post",
  },
  {
    stepNumber: "02",
    title: "Manage Applicants & Batches",
    description:
      "Review student applications, update batch status or details, and keep your teaching schedule organized.",
    icon: "manage",
  },
  {
    stepNumber: "03",
    title: "Upgrade to Pro When Ready",
    description:
      "Unlock expanded batch posting capacity and Pro mentorship perks through a smooth checkout flow.",
    icon: "grow",
  },
];

function StepIcon({ name }: { name: StepItem["icon"] }) {
  switch (name) {
    case "search":
      return <Search className="h-5 w-5" />;
    case "apply":
      return <ClipboardCheck className="h-5 w-5" />;
    case "track":
      return <CheckCircle2 className="h-5 w-5" />;
    case "post":
      return <BookOpen className="h-5 w-5" />;
    case "manage":
      return <Layers className="h-5 w-5" />;
    case "grow":
      return <UserCheck className="h-5 w-5" />;
  }
}

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"student" | "tutor">("student");
  const steps = activeTab === "student" ? STUDENT_STEPS : TUTOR_STEPS;

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-16 overflow-hidden border-t border-stone-200/80 bg-transparent py-16 dark:border-slate-800/80 sm:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-blue-600/15"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Simple Process
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              How{" "}
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                MentorLagbe
              </span>{" "}
              Works
            </h2>
            <p className="max-w-2xl text-sm text-stone-600 dark:text-slate-300 sm:text-base">
              A clear, role-focused workflow designed for both students
              searching for mentors and tutors managing learning batches.
            </p>
          </div>

          <div className="inline-flex self-start rounded-xl border border-stone-300/90 bg-[#fffdf9]/95 p-1 shadow-xs backdrop-blur-xs dark:border-slate-700 dark:bg-slate-900/95 lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                activeTab === "student"
                  ? "bg-gradient-to-r from-amber-700 to-orange-600 text-white shadow-xs dark:from-blue-600 dark:to-indigo-500"
                  : "text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>For Students</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tutor")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                activeTab === "tutor"
                  ? "bg-gradient-to-r from-amber-700 to-orange-600 text-white shadow-xs dark:from-blue-600 dark:to-indigo-500"
                  : "text-stone-700 hover:text-stone-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>For Tutors</span>
            </button>
          </div>
        </MotionSection>

        <AutoList className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item, idx) => (
            <MotionCard
              key={`${activeTab}-${item.stepNumber}`}
              index={idx}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] via-[#fffdf9] to-amber-50/40 p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-600/70 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/35 dark:hover:border-blue-500/70 dark:hover:shadow-blue-950/40"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/70 via-white/15 to-transparent dark:from-white/5 dark:to-transparent"
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-700 to-orange-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105 dark:from-blue-600 dark:to-indigo-500">
                    <StepIcon name={item.icon} />
                  </span>
                  <span className="bg-gradient-to-b from-stone-300 to-stone-200 bg-clip-text text-3xl font-black tracking-tight text-transparent transition-colors duration-300 group-hover:from-amber-500/70 group-hover:to-orange-400/50 dark:from-slate-700 dark:to-slate-800 dark:group-hover:from-blue-400/60 dark:group-hover:to-indigo-500/40">
                    {item.stepNumber}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>

              <div className="relative mt-6 flex items-center justify-between border-t border-stone-200/80 pt-4 text-xs font-semibold text-amber-800 dark:border-slate-800 dark:text-blue-400">
                <span>
                  {activeTab === "student" ? "Student Step" : "Tutor Step"} ·{" "}
                  {item.stepNumber}
                </span>
                <Sparkles className="h-3.5 w-3.5 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </MotionCard>
          ))}
        </AutoList>

        <MotionSection className="relative mt-10 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#fffdf9] via-[#fffaf2] to-amber-100/50 p-6 shadow-xs backdrop-blur-xs dark:border-blue-500/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/50 sm:flex-row sm:items-center">
          <div className="relative">
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              {activeTab === "student"
                ? "Ready to find a batch that matches your goals?"
                : "Ready to publish your tuition batches and reach students?"}
            </h3>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-400 sm:text-sm">
              {activeTab === "student"
                ? "Explore active listings or create a student account to apply and track status."
                : "Sign up as a tutor or check Pro plans for expanded batch capacity."}
            </p>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <MotionButton>
              <Link
                href={activeTab === "student" ? "/tuitions" : "/pricing"}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
              >
                <span>
                  {activeTab === "student"
                    ? "Browse Tuitions"
                    : "View Pro Plans"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionButton>
            <MotionButton>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-[#fffdf9] px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
              >
                Get Started
              </Link>
            </MotionButton>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
