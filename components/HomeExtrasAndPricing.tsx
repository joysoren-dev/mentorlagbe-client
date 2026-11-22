"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  Code2,
  Crown,
  Globe,
  Loader2,
  Quote,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

type PlanRole = "student" | "tutor";

interface PlanCard {
  id: string;
  role: PlanRole;
  tier: "free" | "pro";
  badge: string;
  title: string;
  priceLabel: string;
  billingNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
}

const PLAN_CARDS: PlanCard[] = [
  {
    id: "student-free",
    role: "student",
    tier: "free",
    badge: "Student Starter",
    title: "Student Free",
    priceLabel: "$0",
    billingNote: "Free forever",
    description:
      "Browse verified batches, compare schedules & fees, and apply to tuitions.",
    features: [
      "Browse approved Online & Offline tuitions",
      "Filter by subject, class level & fee",
      "Submit applications & track status live",
    ],
    ctaLabel: "Start Free as Student",
  },
  {
    id: "student-pro",
    role: "student",
    tier: "pro",
    badge: "Priority Booking",
    title: "Pro Student",
    priceLabel: "$10",
    billingNote: "One-time / Pro upgrade",
    description:
      "Get priority batch booking, faster mentor responses, and Pro student badge.",
    features: [
      "Priority application & seat booking",
      "Direct mentor batch highlights",
      "Verified Pro Student profile badge",
    ],
    ctaLabel: "Subscribe with Stripe",
    highlighted: true,
  },
  {
    id: "tutor-free",
    role: "tutor",
    tier: "free",
    badge: "Tutor Starter",
    title: "Tutor Free",
    priceLabel: "$0",
    billingNote: "Up to 2 batches",
    description:
      "Create up to 2 tuition batches and manage incoming student applicants.",
    features: [
      "Post up to 2 tuition batches",
      "Admin moderation & live listing",
      "Approve or reject student applicants",
    ],
    ctaLabel: "Join as Tutor",
  },
  {
    id: "tutor-pro",
    role: "tutor",
    tier: "pro",
    badge: "Unlimited Batches",
    title: "Pro Tutor",
    priceLabel: "$15",
    billingNote: "One-time / Pro upgrade",
    description:
      "Unlock unlimited tuition batches, higher visibility, and verified Pro Tutor badge.",
    features: [
      "Unlimited tuition batch postings",
      "Featured Pro Tutor credibility badge",
      "Scale 1-on-1 & group batches freely",
    ],
    ctaLabel: "Subscribe with Stripe",
    highlighted: true,
  },
];

const TOP_SUBJECTS = [
  {
    name: "Mathematics & Higher Math",
    tag: "SSC · HSC · Admission",
    batches: "Active Batches",
    icon: Calculator,
  },
  {
    name: "Physics & Science",
    tag: "Concepts · Problem Solving",
    batches: "Online & Local",
    icon: Sparkles,
  },
  {
    name: "Programming & ICT",
    tag: "Logic · Web · Fundamentals",
    batches: "Mentorship Tracks",
    icon: Code2,
  },
  {
    name: "IELTS & Spoken English",
    tag: "Academic · Exam Prep",
    batches: "Structured Sessions",
    icon: Globe,
  },
];

const STATS = [
  {
    label: "Verified Role Workflows",
    value: "3 Roles",
    sub: "Student · Tutor · Admin",
  },
  { label: "Learning Modes", value: "2 Modes", sub: "Online & Local Batches" },
  {
    label: "Transparent Plans",
    value: "Free & Pro",
    sub: "$10 Student · $15 Tutor",
  },
  {
    label: "Real-Time Tracking",
    value: "100% Live",
    sub: "Application & Batch Status",
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

function readSession(): {
  token: string | null;
  email: string;
  name: string;
  role: string;
} {
  if (typeof window === "undefined") {
    return { token: null, email: "", name: "", role: "student" };
  }
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { token: null, email: "", name: "", role: "student" };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const token =
      typeof parsed.token === "string"
        ? parsed.token
        : typeof parsed.accessToken === "string"
          ? parsed.accessToken
          : null;
    const candidate =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as Record<string, unknown>)
        : parsed;

    return {
      token,
      email: typeof candidate.email === "string" ? candidate.email : "",
      name: typeof candidate.name === "string" ? candidate.name : "",
      role: typeof candidate.role === "string" ? candidate.role : "student",
    };
  } catch {
    return { token: null, email: "", name: "", role: "student" };
  }
}

export default function HomeExtrasAndPricing() {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handlePlanAction = async (plan: PlanCard) => {
    if (plan.tier === "free") {
      router.push(
        plan.role === "tutor" ? "/sign-up?role=tutor" : "/sign-up?role=student",
      );
      return;
    }

    const session = readSession();
    if (!session.token && !session.email) {
      toast.info("Sign in first to subscribe with Stripe.");
      router.push(`/sign-in?redirect=/pricing&plan=${plan.role}`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const res = await apiRequest<{ url?: string; checkoutUrl?: string }>(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: session.token
            ? { Authorization: `Bearer ${session.token}` }
            : {},
          body: JSON.stringify({
            plan: plan.role === "tutor" ? "tutor_pro" : "student_pro",
            role: plan.role,
            email: session.email,
            name: session.name,
          }),
        },
      );

      const checkoutUrl = res?.url || res?.checkoutUrl;
      if (checkoutUrl && typeof window !== "undefined") {
        window.location.href = checkoutUrl;
        return;
      }

      router.push(`/pricing?plan=${plan.role}`);
    } catch {
      router.push(`/pricing?plan=${plan.role}`);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <>
      {/* Pricing / Subscription Section */}
      <section
        id="pricing"
        className="border-t border-stone-200/80 py-16 dark:border-slate-800/80 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="animate-[fadeInUp_0.5s_ease-out_both]">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                Transparent Plans &amp; Stripe Upgrade
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
                Free vs. Pro Plans for Students &amp; Tutors
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-stone-600 dark:text-slate-400">
                Start free on MentorLagbe or upgrade anytime with Stripe for
                priority student booking ($10) or unlimited tutor batches ($15).
              </p>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>Compare Full Plans</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PLAN_CARDS.map((plan, index) => {
              const isLoading = loadingPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className={`flex h-full flex-col justify-between rounded-2xl border p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-[fadeInUp_0.55s_ease-out_both] ${
                    plan.highlighted
                      ? "border-amber-600/60 bg-[#fffdf9] ring-1 ring-amber-600/20 dark:border-blue-500/60 dark:bg-slate-900/95 dark:ring-blue-500/20"
                      : "border-stone-200/90 bg-[#fffdf9]/92 dark:border-slate-800 dark:bg-slate-900/90"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-amber-100/90 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:bg-blue-950 dark:text-blue-300">
                        {plan.badge}
                      </span>
                      {plan.tier === "pro" && (
                        <Crown className="h-4 w-4 text-amber-600 dark:text-blue-400" />
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">
                      {plan.title}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                        {plan.priceLabel}
                      </span>
                      <span className="text-xs font-medium text-stone-500 dark:text-slate-400">
                        {plan.billingNote}
                      </span>
                    </div>

                    <p className="mt-2.5 text-xs leading-relaxed text-stone-600 dark:text-slate-400">
                      {plan.description}
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-stone-200/70 pt-4 text-xs text-stone-700 dark:border-slate-800 dark:text-slate-300">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handlePlanAction(plan)}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:opacity-60 sm:text-sm ${
                      plan.tier === "pro"
                        ? "bg-amber-700 text-white hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                        : "border border-stone-300 bg-[#faf7f2] text-stone-900 hover:border-amber-600 hover:bg-amber-50/60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-blue-500"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connecting Stripe...</span>
                      </>
                    ) : (
                      <>
                        <span>{plan.ctaLabel}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Subjects, Statistics & Learner/Tutor Feedback */}
      <section className="border-t border-stone-200/80 py-16 dark:border-slate-800/80 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-[fadeInUp_0.5s_ease-out_both]">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Subjects, Metrics &amp; Feedback
            </p>
            <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Popular Subjects &amp; Platform Highlights
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-stone-600 dark:text-slate-400">
              Explore high-demand subjects, see how the platform is structured,
              and read feedback from students and tutors.
            </p>
          </div>

          {/* Stats Strip */}
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/90"
              >
                <div className="flex items-center justify-between text-stone-500 dark:text-slate-400">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Users className="h-4 w-4 text-amber-700 dark:text-blue-400" />
                </div>
                <p className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-stone-600 dark:text-slate-400">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Subject Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOP_SUBJECTS.map((subj) => {
              const Icon = subj.icon;
              return (
                <Link
                  key={subj.name}
                  href={`/tuitions?subject=${encodeURIComponent(subj.name.split(" ")[0])}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-amber-600/60 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/60"
                >
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 transition-transform duration-300 group-hover:scale-105 dark:bg-blue-600/15 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-stone-900 dark:text-white">
                      {subj.name}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 dark:text-slate-400">
                      {subj.tag}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200/70 pt-3 text-xs font-semibold text-amber-800 dark:border-slate-800 dark:text-blue-400">
                    <span>{subj.batches}</span>
                    <BookOpen className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Testimonials */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <div
                key={item.name}
                className="flex h-full flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/90"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Quote className="h-4 w-4 text-amber-700 dark:text-blue-400" />
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-slate-300">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-4 border-t border-stone-200/70 pt-3 dark:border-slate-800">
                  <p className="text-xs font-bold text-stone-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">
                    {item.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
