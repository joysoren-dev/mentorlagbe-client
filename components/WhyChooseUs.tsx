"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Clock,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface FeatureHighlight {
  title: string;
  description: string;
  badge: string;
  pillar: string;
  icon: "verified" | "roles" | "schedule" | "plans";
}

const HIGHLIGHTS: FeatureHighlight[] = [
  {
    badge: "Quality & Trust",
    pillar: "01 · Verified Listings",
    title: "Moderated & Clear Batch Listings",
    description:
      "Every tuition listing highlights subject focus, class level, study mode, and monthly fee so students can compare options with confidence.",
    icon: "verified",
  },
  {
    badge: "Dedicated Portals",
    pillar: "02 · Role Dashboards",
    title: "Student & Tutor Role Workflows",
    description:
      "Students can apply and track real-time application statuses, while tutors manage batches, schedules, and applicants cleanly.",
    icon: "roles",
  },
  {
    badge: "Flexible Learning",
    pillar: "03 · Hybrid Modes",
    title: "Online & Local Study Modes",
    description:
      "Choose between convenient online mentorship sessions or local in-person batches depending on your schedule and location.",
    icon: "schedule",
  },
  {
    badge: "Scalable Growth",
    pillar: "04 · Flexible Tiers",
    title: "Free Start & Pro Tutor Upgrades",
    description:
      "Begin posting batches right away and upgrade to Pro when you need expanded batch capacity and enhanced visibility.",
    icon: "plans",
  },
];

function HighlightIcon({ name }: { name: FeatureHighlight["icon"] }) {
  switch (name) {
    case "verified":
      return <ShieldCheck className="h-5 w-5" />;
    case "roles":
      return <Users className="h-5 w-5" />;
    case "schedule":
      return <Clock className="h-5 w-5" />;
    case "plans":
      return <Award className="h-5 w-5" />;
  }
}

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden border-t border-stone-200/80 bg-transparent py-16 dark:border-slate-800/80 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/3 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-blue-600/15"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-100/90 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-blue-400/25 dark:bg-blue-950/80 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Why MentorLagbe</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Built for{" "}
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                Focused Learning
              </span>{" "}
              &amp; Organized Mentorship
            </h2>
          </div>

          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400 sm:text-base">
              Designed to keep tuition discovery, batch management, and status
              tracking simple, fast, and transparent.
            </p>
          </div>
        </MotionSection>

        <AutoList className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item, idx) => (
            <MotionCard
              key={item.title}
              index={idx}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] via-[#fffdf9] to-amber-50/40 p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-600/70 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/35 dark:hover:border-blue-500/70 dark:hover:shadow-blue-950/40"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/75 via-white/15 to-transparent dark:from-white/5 dark:to-transparent"
              />

              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-amber-800 transition-transform duration-300 group-hover:scale-105 dark:from-blue-500/20 dark:to-indigo-500/15 dark:text-blue-400">
                    <HighlightIcon name={item.icon} />
                  </span>
                  <span className="rounded-full border border-stone-200/80 bg-stone-100/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold tracking-tight text-stone-900 dark:text-white sm:text-lg">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>

              <div className="relative mt-6 flex items-center justify-between border-t border-stone-200/80 pt-4 text-xs font-semibold text-stone-500 dark:border-slate-800 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                  <span>{item.pillar}</span>
                </span>
              </div>
            </MotionCard>
          ))}
        </AutoList>

        <MotionSection className="relative mt-12 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#1c1610] p-6 text-stone-50 shadow-xl dark:border-blue-500/30 dark:bg-[#06142e] dark:text-white sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 right-10 h-56 w-56 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl dark:bg-indigo-500/20"
          />

          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
                Start Today
              </p>
              <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                Explore Active Tuitions or Upgrade Your Tutor Plan
              </h3>
              <p className="max-w-xl text-sm text-stone-300 dark:text-slate-300">
                Browse open mentorship batches right away or compare Pro tutor
                features on the pricing page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <MotionButton>
                <Link
                  href="/tuitions"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                >
                  <span>Browse Tuitions</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MotionButton>
              <MotionButton>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-700 bg-[#261e16] px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-amber-400 hover:text-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-white"
                >
                  Explore Pricing
                </Link>
              </MotionButton>
            </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
