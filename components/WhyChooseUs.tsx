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

interface FeatureHighlight {
  title: string;
  description: string;
  badge: string;
  icon: "verified" | "roles" | "schedule" | "plans";
}

const HIGHLIGHTS: FeatureHighlight[] = [
  {
    badge: "Quality & Trust",
    title: "Moderated & Clear Batch Listings",
    description:
      "Every tuition listing highlights subject focus, class level, study mode, and monthly fee so students can compare options with confidence.",
    icon: "verified",
  },
  {
    badge: "Dedicated Portals",
    title: "Student & Tutor Role Workflows",
    description:
      "Students can apply and track real-time application statuses, while tutors manage batches, schedules, and applicants cleanly.",
    icon: "roles",
  },
  {
    badge: "Flexible Learning",
    title: "Online & Local Study Modes",
    description:
      "Choose between convenient online mentorship sessions or local in-person batches depending on your schedule and location.",
    icon: "schedule",
  },
  {
    badge: "Scalable Growth",
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
    <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-[#070d19] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: Heading + Summary */}
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-7">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Why MentorLagbe</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Built for Focused Learning &amp; Organized Mentorship
            </h2>
          </div>

          <div className="lg:col-span-5 lg:text-right">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
              Designed to keep tuition discovery, batch management, and status
              tracking simple, fast, and transparent.
            </p>
          </div>
        </div>

        {/* 4 Equal-Height Feature Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                    <HighlightIcon name={item.icon} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>MentorLagbe Core</span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 rounded-2xl bg-[#06142e] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Start Today
              </p>
              <h3 className="text-xl font-bold sm:text-2xl">
                Explore Active Tuitions or Upgrade Your Tutor Plan
              </h3>
              <p className="max-w-xl text-sm text-slate-300">
                Browse open mentorship batches right away or compare Pro tutor
                features on the pricing page.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <span>Browse Tuitions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-500 hover:text-white"
              >
                Explore Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
