"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calculator,
  Code2,
  Crown,
  Globe,
  Layers,
  Quote,
  Sparkles,
  Star,
} from "lucide-react";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";
import RoleAwarePricingCards, {
  type PlanRole,
} from "@/components/RoleAwarePricingCards";

const TOP_SUBJECTS = [
  {
    name: "Mathematics & Higher Math",
    tag: "SSC · HSC · Admission",
    batches: "Active Batches",
    icon: Calculator,
    accent:
      "from-amber-500/20 via-orange-400/15 to-transparent text-amber-800 dark:from-blue-500/25 dark:via-sky-400/15 dark:text-blue-300",
    topBar:
      "from-amber-500 via-orange-500 to-amber-400 dark:from-blue-500 dark:via-sky-400 dark:to-indigo-400",
  },
  {
    name: "Physics & Science",
    tag: "Concepts · Problem Solving",
    batches: "Online & Local",
    icon: Sparkles,
    accent:
      "from-orange-500/20 via-amber-400/15 to-transparent text-orange-800 dark:from-sky-500/25 dark:via-blue-400/15 dark:text-sky-300",
    topBar:
      "from-orange-500 via-amber-500 to-yellow-400 dark:from-sky-500 dark:via-blue-400 dark:to-cyan-400",
  },
  {
    name: "Programming & ICT",
    tag: "Logic · Web · Fundamentals",
    batches: "Mentorship Tracks",
    icon: Code2,
    accent:
      "from-amber-600/20 via-yellow-500/15 to-transparent text-amber-900 dark:from-indigo-500/25 dark:via-blue-400/15 dark:text-indigo-300",
    topBar:
      "from-amber-600 via-orange-500 to-amber-400 dark:from-indigo-500 dark:via-blue-500 dark:to-sky-400",
  },
  {
    name: "IELTS & Spoken English",
    tag: "Academic · Exam Prep",
    batches: "Structured Sessions",
    icon: Globe,
    accent:
      "from-yellow-600/20 via-amber-500/15 to-transparent text-amber-800 dark:from-cyan-500/25 dark:via-sky-400/15 dark:text-cyan-300",
    topBar:
      "from-amber-500 via-orange-600 to-amber-500 dark:from-cyan-400 dark:via-blue-500 dark:to-indigo-500",
  },
];

const STATS = [
  {
    label: "Role Portals",
    value: "3 Roles",
    sub: "Student · Tutor · Admin",
    icon: Layers,
    strip: "from-amber-500 to-orange-500 dark:from-blue-500 dark:to-sky-400",
  },
  {
    label: "Study Modes",
    value: "2 Modes",
    sub: "Online & Offline Batches",
    icon: BookOpen,
    strip: "from-orange-500 to-amber-500 dark:from-sky-500 dark:to-indigo-400",
  },
  {
    label: "Pro Plans",
    value: "$10 / $15",
    sub: "Student Pro · Tutor Pro",
    icon: Crown,
    strip: "from-amber-600 to-orange-600 dark:from-indigo-500 dark:to-blue-500",
  },
  {
    label: "Status Updates",
    value: "Real-Time",
    sub: "Live Application Tracking",
    icon: Activity,
    strip: "from-orange-600 to-amber-500 dark:from-blue-600 dark:to-cyan-400",
  },
];

const TESTIMONIALS = [
  {
    name: "Nusrat Jahan",
    role: "HSC Student",
    quote:
      "Finding batch schedules, weekly class days, and monthly fees in one clean view saved me weeks of searching.",
  },
  {
    name: "Tanvir Ahmed",
    role: "ICT & Programming Mentor",
    quote:
      "Posting batches and reviewing student applicants is straightforward—and upgrading to Pro Tutor removes batch limits.",
  },
  {
    name: "Farhana Rahman",
    role: "Guardian & Learner",
    quote:
      "Knowing a listing is admin-approved before applying gives real confidence when picking a tutor.",
  },
];

interface HomeExtrasAndPricingProps {
  forcedRole?: PlanRole;
  showRoleSwitcher?: boolean;
}

export default function HomeExtrasAndPricing({
  forcedRole,
  showRoleSwitcher = true,
}: HomeExtrasAndPricingProps) {
  return (
    <>
      {/* Pricing / Subscription Section */}
      <section
        id="pricing"
        className="relative overflow-hidden border-t border-stone-200/80 py-16 dark:border-slate-800/80 sm:py-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl dark:bg-blue-600/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-orange-400/15 blur-3xl dark:bg-indigo-500/20"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionSection className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                Free vs. Pro Plans · Stripe Checkout
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
                Highlighted Plans for{" "}
                <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                  Students &amp; Tutors
                </span>
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-600 dark:text-slate-400">
                Compare Free starter access against Pro Student ($10) and Pro
                Tutor ($15) upgrades—automatically highlighted by role when
                signed in or previewed on demand.
              </p>
            </div>

            <MotionButton>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-600/30 bg-[#fffdf9]/90 px-4 py-2 text-sm font-semibold text-amber-800 shadow-xs transition hover:border-amber-600 hover:bg-amber-50 dark:border-blue-500/30 dark:bg-slate-900/90 dark:text-blue-400 dark:hover:border-blue-400 dark:hover:bg-slate-800"
              >
                <span>Open Full Pricing</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MotionButton>
          </MotionSection>

          <div className="mt-6">
            <RoleAwarePricingCards
              forcedRole={forcedRole}
              showRoleSwitcher={showRoleSwitcher}
            />
          </div>
        </div>
      </section>

      {/* Top Subjects, Statistics & Learner/Tutor Feedback */}
      <section className="relative overflow-hidden border-t border-stone-200/80 py-16 dark:border-slate-800/80 sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-blue-600/15"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <MotionSection>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Subjects, Metrics &amp; Feedback
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Popular Subjects &amp;{" "}
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                Platform Highlights
              </span>
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-600 dark:text-slate-400">
              Explore high-demand subjects, see how the platform is structured,
              and read feedback from students and tutors.
            </p>
          </MotionSection>

          {/* Stats Strip */}
          <AutoList className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <MotionCard
                  key={stat.label}
                  index={idx}
                  className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] via-[#fffdf9] to-amber-50/50 p-5 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-500/60 hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/30 dark:hover:border-blue-500/60"
                >
                  <div
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.strip} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
                  />
                  <div className="flex items-center justify-between text-stone-500 dark:text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {stat.label}
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/15 dark:text-blue-400">
                      <StatIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-[26px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-stone-600 dark:text-slate-400">
                    {stat.sub}
                  </p>
                </MotionCard>
              );
            })}
          </AutoList>

          {/* Subject Cards */}
          <AutoList className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_SUBJECTS.map((subj, idx) => {
              const Icon = subj.icon;
              return (
                <MotionCard key={subj.name} index={idx} className="h-full">
                  <Link
                    href={`/tuitions?subject=${encodeURIComponent(subj.name.split(" ")[0])}`}
                    className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-[#fffdf9]/95 p-5 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-600/60 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/60 dark:hover:shadow-blue-950/40"
                  >
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${subj.accent} opacity-75 transition-opacity duration-300 group-hover:opacity-100`}
                    />

                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-white/80 text-amber-800 shadow-2xs transition-transform duration-300 group-hover:scale-105 dark:border-blue-400/20 dark:bg-slate-950/70 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-bold tracking-tight text-stone-900 dark:text-white">
                        {subj.name}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-stone-600 dark:text-slate-400">
                        {subj.tag}
                      </p>
                    </div>
                    <div className="relative mt-4 flex items-center justify-between border-t border-stone-200/70 pt-3 text-xs font-semibold text-amber-800 dark:border-slate-800 dark:text-blue-400">
                      <span>{subj.batches}</span>
                      <span className="inline-flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <ArrowRight className="h-3 w-3 opacity-75" />
                      </span>
                    </div>
                  </Link>
                </MotionCard>
              );
            })}
          </AutoList>

          {/* Testimonials */}
          <AutoList className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item, idx) => (
              <MotionCard
                key={item.name}
                index={idx}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-[#fffdf9]/95 p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-500/60 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/60 dark:hover:shadow-blue-950/40"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-500/70 via-orange-500/40 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-500/70 dark:via-sky-400/40"
                />

                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800 dark:bg-blue-500/15 dark:text-blue-400">
                      <Quote className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                  </div>
                  <p className="mt-3.5 text-[15px] leading-relaxed font-normal text-stone-700 dark:text-slate-300">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-5 border-t border-stone-200/70 pt-3.5 dark:border-slate-800">
                  <p className="text-xs font-bold tracking-wide text-stone-900 uppercase dark:text-white">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-stone-500 dark:text-slate-400">
                    {item.role}
                  </p>
                </div>
              </MotionCard>
            ))}
          </AutoList>
        </div>
      </section>
    </>
  );
}
