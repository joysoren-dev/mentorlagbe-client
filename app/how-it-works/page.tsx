"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  SearchCheck,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

const STUDENT_STEPS = [
  {
    step: "01",
    title: "Search & Filter Batches",
    description:
      "Browse active tuitions by subject, class level, online or local mode, and monthly fee to find the right fit.",
    icon: SearchCheck,
  },
  {
    step: "02",
    title: "Review Batch Details",
    description:
      "Check weekly schedule, mentor details, location or online mode, and monthly fee before making a choice.",
    icon: BookOpenCheck,
  },
  {
    step: "03",
    title: "Apply & Start Learning",
    description:
      "Create an account, submit your batch application, and begin structured sessions with your mentor.",
    icon: CheckCircle2,
  },
];

const TUTOR_STEPS = [
  {
    step: "01",
    title: "Create Mentor Account",
    description:
      "Sign up with your profile and teaching background to set up your presence on MentorLagbe.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Publish Tuition Listing",
    description:
      "Add batch title, subject, class level, schedule, mode, and monthly fee for review and approval.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Connect with Students",
    description:
      "Once approved, your batch goes live in the directory so interested students can discover and apply.",
    icon: ShieldCheck,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19]">
      {/* Header Banner */}
      <section className="bg-[#06142e] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Simple Process
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            How MentorLagbe Works
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            A clear, straightforward workflow for students finding reliable
            mentors and tutors sharing structured learning batches.
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
          {STUDENT_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-2xl font-extrabold text-slate-200 dark:text-slate-800">
                    {item.step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
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
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>View Mentor Plans</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TUTOR_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-2xl font-extrabold text-slate-300 dark:text-slate-700">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl bg-[#06142e] p-8 text-center text-white sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Explore live tuition batches right now or create an account to
              join as a student or mentor.
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
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
