"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Crown,
  GraduationCap,
  Loader2,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
} from "@/components/MotionPrimitives";

export type PlanRole = "student" | "tutor";
export type HighlightFilter = "all" | "student" | "tutor";

interface PlanItem {
  id: string;
  role: PlanRole;
  tier: "free" | "pro";
  audienceLabel: string;
  badge: string;
  title: string;
  priceLabel: string;
  billingNote: string;
  description: string;
  features: string[];
  ctaLabel: string;
}

const PLANS: PlanItem[] = [
  {
    id: "student-free",
    role: "student",
    tier: "free",
    audienceLabel: "FOR STUDENTS",
    badge: "Starter Tier",
    title: "Student Free",
    priceLabel: "$0",
    billingNote: "Free forever",
    description:
      "Search verified batches, compare fees & schedules, and apply to tuitions.",
    features: [
      "Browse approved Online & Offline tuitions",
      "Filter by subject, class level & fee",
      "Apply to batches & track status live",
    ],
    ctaLabel: "Start Free as Student",
  },
  {
    id: "student-pro",
    role: "student",
    tier: "pro",
    audienceLabel: "FOR STUDENTS",
    badge: "Priority Booking · Pro",
    title: "Pro Student",
    priceLabel: "$10",
    billingNote: "Pro subscription upgrade",
    description:
      "Get priority batch booking, faster application visibility, and Pro Student badge.",
    features: [
      "Priority application & seat booking",
      "Stand out to tutors during review",
      "Verified Pro Student profile badge",
    ],
    ctaLabel: "Subscribe with Stripe",
  },
  {
    id: "tutor-free",
    role: "tutor",
    tier: "free",
    audienceLabel: "FOR TUTORS",
    badge: "Up to 2 Batches",
    title: "Tutor Free",
    priceLabel: "$0",
    billingNote: "Free starter tier",
    description:
      "Post up to 2 tuition batches and manage incoming student applications easily.",
    features: [
      "Post up to 2 tuition batches",
      "Admin approval & live batch listing",
      "Accept or reject student applicants",
    ],
    ctaLabel: "Join as Tutor",
  },
  {
    id: "tutor-pro",
    role: "tutor",
    tier: "pro",
    audienceLabel: "FOR TUTORS",
    badge: "Unlimited Batches · Pro",
    title: "Pro Tutor",
    priceLabel: "$15",
    billingNote: "Pro subscription upgrade",
    description:
      "Unlock unlimited tuition batch postings, stronger reach, and verified Pro Tutor badge.",
    features: [
      "Unlimited tuition batch postings",
      "Verified Pro Tutor credibility badge",
      "Manage 1-on-1 & group batches freely",
    ],
    ctaLabel: "Subscribe with Stripe",
  },
];

function readDetectedUser(): {
  token: string | null;
  email: string;
  name: string;
  role: string;
} {
  if (typeof window === "undefined") {
    return { token: null, email: "", name: "", role: "" };
  }
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { token: null, email: "", name: "", role: "" };
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
      role:
        typeof candidate.role === "string" ? candidate.role.toLowerCase() : "",
    };
  } catch {
    return { token: null, email: "", name: "", role: "" };
  }
}

interface RoleAwarePricingCardsProps {
  forcedRole?: PlanRole;
  showRoleSwitcher?: boolean;
}

export default function RoleAwarePricingCards({
  forcedRole,
  showRoleSwitcher = true,
}: RoleAwarePricingCardsProps) {
  const router = useRouter();
  const [detectedRole, setDetectedRole] = useState<string>("");
  const [focusRole, setFocusRole] = useState<HighlightFilter>("all");
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    const user = readDetectedUser();
    setDetectedRole(user.role);
    if (forcedRole) {
      setFocusRole(forcedRole);
    } else if (user.role === "student" || user.role === "tutor") {
      setFocusRole(user.role);
    }
  }, [forcedRole]);

  const activeRoleContext: HighlightFilter = forcedRole || focusRole;

  const isPlanHighlighted = (plan: PlanItem) => {
    if (plan.tier !== "pro") return false;
    if (activeRoleContext === "student") return plan.role === "student";
    if (activeRoleContext === "tutor") return plan.role === "tutor";
    return true;
  };

  const handlePlanClick = async (plan: PlanItem) => {
    if (plan.tier === "free") {
      router.push(
        plan.role === "tutor" ? "/sign-up?role=tutor" : "/sign-up?role=student",
      );
      return;
    }

    const session = readDetectedUser();
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
    <div>
      {/* Role Detection Banner + Interactive Switcher */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-50/80 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-200">
          <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
          {forcedRole === "student" || detectedRole === "student" ? (
            <span>Highlighted for Student: Pro Student ($10)</span>
          ) : forcedRole === "tutor" || detectedRole === "tutor" ? (
            <span>Highlighted for Tutor: Pro Tutor ($15)</span>
          ) : activeRoleContext === "student" ? (
            <span>Previewing Student Highlight: Pro Student ($10)</span>
          ) : activeRoleContext === "tutor" ? (
            <span>Previewing Tutor Highlight: Pro Tutor ($15)</span>
          ) : (
            <span>Showing Both Student ($10) &amp; Tutor ($15) Pro Plans</span>
          )}
        </div>

        {showRoleSwitcher && !forcedRole && (
          <div className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-[#fffdf9]/90 p-1 text-xs font-semibold shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <button
              type="button"
              onClick={() => setFocusRole("all")}
              className={`rounded-lg px-3 py-1.5 transition ${
                focusRole === "all"
                  ? "bg-amber-700 text-white dark:bg-blue-600"
                  : "text-stone-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Both Pro
            </button>
            <button
              type="button"
              onClick={() => setFocusRole("student")}
              className={`rounded-lg px-3 py-1.5 transition ${
                focusRole === "student"
                  ? "bg-amber-700 text-white dark:bg-blue-600"
                  : "text-stone-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Student ($10)
            </button>
            <button
              type="button"
              onClick={() => setFocusRole("tutor")}
              className={`rounded-lg px-3 py-1.5 transition ${
                focusRole === "tutor"
                  ? "bg-amber-700 text-white dark:bg-blue-600"
                  : "text-stone-700 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Tutor ($15)
            </button>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <AutoList className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan, index) => {
          const highlighted = isPlanHighlighted(plan);
          const isStudent = plan.role === "student";
          const isLoading = loadingPlanId === plan.id;

          return (
            <MotionCard
              key={plan.id}
              index={index}
              className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 ${
                highlighted
                  ? isStudent
                    ? "border-amber-500/90 bg-gradient-to-b from-[#fffdf9] via-[#fffaf0] to-amber-100/75 shadow-xl shadow-amber-900/15 ring-2 ring-amber-500/35 hover:shadow-2xl hover:shadow-amber-700/25 dark:border-blue-400/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/75 dark:shadow-blue-950/50 dark:ring-blue-400/35 dark:hover:shadow-blue-500/30"
                    : "border-orange-500/90 bg-gradient-to-b from-[#fffdf9] via-[#fff8f0] to-orange-100/75 shadow-xl shadow-orange-900/15 ring-2 ring-orange-500/35 hover:shadow-2xl hover:shadow-orange-700/25 dark:border-sky-400/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/75 dark:shadow-indigo-950/50 dark:ring-sky-400/35 dark:hover:shadow-sky-500/30"
                  : "border-stone-200/90 bg-[#fffdf9]/85 opacity-90 shadow-xs hover:border-amber-500/50 hover:opacity-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-blue-500/50"
              }`}
            >
              {/* Glossy Top Highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent"
              />

              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${
                      isStudent
                        ? "bg-amber-100 text-amber-900 dark:bg-blue-950/90 dark:text-blue-300"
                        : "bg-orange-100 text-orange-900 dark:bg-indigo-950/90 dark:text-sky-300"
                    }`}
                  >
                    {isStudent ? (
                      <GraduationCap className="h-3.5 w-3.5" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5" />
                    )}
                    <span>{plan.audienceLabel}</span>
                  </span>

                  {highlighted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs dark:from-blue-600 dark:to-indigo-500">
                      <Crown className="h-3 w-3" />
                      <span>SELECTED PRO</span>
                    </span>
                  ) : plan.tier === "pro" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:border-blue-500/30 dark:text-blue-300">
                      <Crown className="h-3 w-3" />
                      <span>PRO</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">
                  {plan.title}
                </h3>
                {plan.tier === "pro" && (
                  <p className="mt-0.5 text-[11px] font-semibold text-amber-800 dark:text-blue-400">
                    {plan.badge}
                  </p>
                )}

                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      highlighted
                        ? "bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300"
                        : "text-stone-900 dark:text-white"
                    }`}
                  >
                    {plan.priceLabel}
                  </span>
                  <span className="text-xs font-medium text-stone-500 dark:text-slate-400">
                    {plan.billingNote}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-stone-600 dark:text-slate-300">
                  {plan.description}
                </p>

                <ul className="mt-4 space-y-2 border-t border-stone-200/80 pt-4 text-xs text-stone-700 dark:border-slate-800 dark:text-slate-200">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <MotionButton className="relative mt-6 w-full">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handlePlanClick(plan)}
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition disabled:opacity-60 sm:text-sm ${
                    plan.tier === "pro"
                      ? highlighted
                        ? "bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-700/25 hover:brightness-110 dark:from-blue-600 dark:via-blue-500 dark:to-indigo-500 dark:shadow-blue-600/30"
                        : "bg-amber-700/90 text-white hover:bg-amber-700 dark:bg-blue-600/90 dark:hover:bg-blue-600"
                      : "border border-stone-300 bg-[#faf7f2] text-stone-900 hover:border-amber-600 hover:bg-amber-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-blue-500"
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
              </MotionButton>
            </MotionCard>
          );
        })}
      </AutoList>
    </div>
  );
}
