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
  UserCheck,
} from "lucide-react";

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
      className="scroll-mt-16 border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-[#06142e] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header + Role Switcher */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Simple Process
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              How MentorLagbe Works
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
              A clear, role-focused workflow designed for both students
              searching for mentors and tutors managing learning batches.
            </p>
          </div>

          {/* Student / Tutor Tab Switcher */}
          <div className="inline-flex self-start rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900/90 lg:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("student")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition sm:text-sm ${
                activeTab === "student"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>For Tutors</span>
            </button>
          </div>
        </div>

        {/* 3-Step Cards Grid (Equal Height) */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <article
              key={`${activeTab}-${item.stepNumber}`}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-500/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <StepIcon name={item.icon} />
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight text-slate-300 dark:text-slate-700">
                    {item.stepNumber}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 border-t border-slate-200/80 pt-4 text-xs font-semibold text-blue-600 dark:border-slate-800 dark:text-blue-400">
                {activeTab === "student" ? "Student Step" : "Tutor Step"} ·{" "}
                {item.stepNumber}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Action Bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTab === "student"
                ? "Ready to find a batch that matches your goals?"
                : "Ready to publish your tuition batches and reach students?"}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              {activeTab === "student"
                ? "Explore active listings or create a student account to apply and track status."
                : "Sign up as a tutor or check Pro plans for expanded batch capacity."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={activeTab === "student" ? "/tuitions" : "/pricing"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <span>
                {activeTab === "student" ? "Browse Tuitions" : "View Pro Plans"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
