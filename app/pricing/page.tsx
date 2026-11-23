"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
  token?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

function getAuthSession(): { user: StoredUser | null; token: string | null } {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const token = typeof parsed.token === "string" ? parsed.token : null;
    const candidate =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as StoredUser)
        : (parsed as StoredUser);
    return { user: candidate, token };
  } catch {
    return { user: null, token: null };
  }
}

const PLANS = [
  {
    id: "free",
    name: "Starter",
    badge: "Free Forever",
    priceLabel: "Free",
    suffix: "",
    description:
      "Ideal for students and new tutors getting started with browse, applications, and basic listings.",
    features: [
      "Browse all verified tuition listings",
      "Filter by subject, class level, and mode",
      "Apply to tuitions & track application status",
      "Up to 2 tuition posts for free-tier tutors",
    ],
    ctaLabel: "Get Started Free",
    ctaHref: "/sign-up",
    paidForRole: null as "student" | "tutor" | null,
  },
  {
    id: "pro-student",
    name: "Pro Student",
    badge: "For Students",
    priceLabel: "$10",
    suffix: "/ one-time",
    description:
      "Designed for students wanting priority booking and enhanced profile visibility.",
    features: [
      "Priority tuition booking & inquiries",
      "Pro Student badge on account",
      "Real-time application status tracking",
      "Instant Pro plan activation after Stripe payment",
    ],
    ctaLabel: "Upgrade Student Pro ($10)",
    ctaHref: "/sign-up?role=student",
    paidForRole: "student" as const,
  },
  {
    id: "pro-tutor",
    name: "Pro Tutor",
    badge: "Most Popular",
    priceLabel: "$15",
    suffix: "/ one-time",
    description:
      "Built for dedicated tutors who want unlimited tuition batches and a verified Pro badge.",
    features: [
      "Unlimited active tuition batch postings",
      "Verified Pro Tutor badge & priority visibility",
      "Manage student applicants (Accept / Reject)",
      "Instant Pro plan activation after Stripe payment",
    ],
    ctaLabel: "Upgrade Tutor Pro ($15)",
    ctaHref: "/sign-up?role=tutor",
    paidForRole: "tutor" as const,
  },
];

const STUDENT_FAQS: FaqItem[] = [
  {
    question: "Do students need to pay to browse or apply for tuitions?",
    answer:
      "No. Students can browse approved tuition listings, filter by subject, class level, and mode, and submit applications for free.",
  },
  {
    question: "What extra benefits come with Pro Student ($10)?",
    answer:
      "Pro Student unlocks priority tuition booking & inquiries, a Pro Student badge on your account, and faster visibility during review.",
  },
  {
    question: "How can I track my tuition applications?",
    answer:
      "You can open your Student Dashboard anytime to monitor real-time application status updates across batches.",
  },
  {
    question: "How does Stripe activate Pro Student after payment?",
    answer:
      "Once you complete Stripe Checkout and payment is confirmed, your account plan automatically updates to Pro.",
  },
  {
    question: "Can I update my student profile details later?",
    answer:
      "Yes. You can update your profile photo, display name, contact number, and learning note from your profile section.",
  },
];

const TUTOR_FAQS: FaqItem[] = [
  {
    question: "How many tuition posts are allowed on the Free tier?",
    answer:
      "Free-tier tutors can post up to 2 tuition batches, while upgrading to Pro Tutor ($15) removes this cap for unlimited batch postings.",
  },
  {
    question: "What does the Pro Tutor ($15) upgrade include?",
    answer:
      "Pro Tutor includes unlimited active tuition batch postings, a verified Pro Tutor badge & priority visibility, and full applicant management.",
  },
  {
    question: "How do I manage student applicants as a tutor?",
    answer:
      "From your Tutor Dashboard applicant view, you can review incoming student applications and accept or reject applicants.",
  },
  {
    question: "How are tuition listings reviewed before going live?",
    answer:
      "Tuition batches go through moderation so students see verified, clear schedules, study modes, and fee details.",
  },
  {
    question: "What happens after I complete Stripe checkout for Pro Tutor?",
    answer:
      "Your Stripe payment is recorded and your account plan upgrades to Pro so you can post unlimited tuition batches.",
  },
];

const GENERAL_FAQS: FaqItem[] = [
  {
    question: "Is MentorLagbe free to start for both students and tutors?",
    answer:
      "Yes. Both students and tutors can start free—students can browse and apply to tuitions, while free tutors can post up to 2 tuitions.",
  },
  {
    question:
      "What is the difference between Pro Student ($10) and Pro Tutor ($15)?",
    answer:
      "Pro Student ($10) focuses on priority booking & inquiries and a Pro Student badge, while Pro Tutor ($15) provides unlimited tuition posts and a verified Pro Tutor badge.",
  },
  {
    question: "How does Stripe upgrade an account to Pro?",
    answer:
      "Once you complete Stripe Checkout, your payment is recorded and your account plan automatically updates to Pro.",
  },
  {
    question: "Can I filter tuitions by subject, class level, and mode?",
    answer:
      "Yes. You can filter verified tuition listings by subject, class level, and study mode (Online or Offline) to find matching batches.",
  },
  {
    question: "Do students need a paid plan just to apply for tuitions?",
    answer:
      "No. Students can browse approved listings and apply to tuitions for free, with Pro Student ($10) available as an optional upgrade.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const sync = () => {
      const { user } = getAuthSession();
      setCurrentUser(user);
    };
    sync();
    window.addEventListener("mentorlagbe-auth-change", sync);
    return () => window.removeEventListener("mentorlagbe-auth-change", sync);
  }, []);

  const normalizedRole =
    typeof currentUser?.role === "string" ? currentUser.role.toLowerCase() : "";

  const effectiveRoleForFaq: "student" | "tutor" | "general" =
    normalizedRole === "student"
      ? "student"
      : normalizedRole === "tutor"
        ? "tutor"
        : "general";

  const activeFaqs =
    effectiveRoleForFaq === "student"
      ? STUDENT_FAQS
      : effectiveRoleForFaq === "tutor"
        ? TUTOR_FAQS
        : GENERAL_FAQS;

  const faqTitle =
    effectiveRoleForFaq === "student"
      ? "Students Frequently Asked Questions"
      : effectiveRoleForFaq === "tutor"
        ? "Tutors Frequently Asked Questions"
        : "General Frequently Asked Questions";

  const isPlanHighlighted = (plan: (typeof PLANS)[number]) => {
    if (!plan.paidForRole) return false;
    if (normalizedRole === "student") return plan.paidForRole === "student";
    if (normalizedRole === "tutor") return plan.paidForRole === "tutor";
    return plan.paidForRole === "tutor";
  };

  const handleStripeCheckout = async (planId: string) => {
    const { user, token } = getAuthSession();

    if (!user?.email) {
      toast.info("Please sign in first to upgrade to Pro.");
      router.push("/sign-in");
      return;
    }

    if (user.role === "admin") {
      toast.info("Admin accounts do not need a Pro subscription.");
      return;
    }

    if (user.plan === "pro") {
      toast.success("Your account is already on the Pro plan!");
      return;
    }

    try {
      setLoadingPlanId(planId);
      const data = await apiRequest<{
        success?: boolean;
        url?: string;
        message?: string;
      }>("/api/payments/create-checkout-session", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ role: user.role }),
      });

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.message || "Could not start Stripe checkout.");
      }
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Failed to initiate payment.";
      toast.error(msg);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
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
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 dark:text-blue-400">
            Transparent Plans
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            Simple Pricing for{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300">
              Students &amp; Mentors
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-300 dark:text-slate-300 sm:text-base">
            Start free or upgrade to Pro via Stripe for priority student
            features and unlimited tutor batch postings.
          </p>

          {(normalizedRole === "student" || normalizedRole === "tutor") && (
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-xs dark:border-blue-400/40 dark:text-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Highlighted for your {normalizedRole.toUpperCase()} role:{" "}
                  {normalizedRole === "student"
                    ? "Pro Student ($10)"
                    : "Pro Tutor ($15)"}
                </span>
              </span>
            </div>
          )}
        </MotionSection>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AutoList className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan, index) => {
            const highlighted = isPlanHighlighted(plan);
            const isStudentPlan = plan.paidForRole === "student";
            const isAlreadyPro =
              Boolean(plan.paidForRole) && currentUser?.plan === "pro";
            const isRoleMismatch =
              Boolean(plan.paidForRole) &&
              Boolean(currentUser?.role) &&
              currentUser?.role !== "admin" &&
              currentUser?.role !== plan.paidForRole;
            const isLoading = loadingPlanId === plan.id;

            return (
              <MotionCard
                key={plan.id}
                index={index}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-7 backdrop-blur-md transition-all duration-300 ${
                  highlighted
                    ? isStudentPlan
                      ? "border-amber-500/90 bg-gradient-to-b from-[#fffdf9] via-[#fffaf0] to-amber-100/75 shadow-xl shadow-amber-900/15 ring-2 ring-amber-500/35 hover:shadow-2xl hover:shadow-amber-700/25 dark:border-blue-400/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/75 dark:shadow-blue-950/50 dark:ring-blue-400/35 dark:hover:shadow-blue-500/30"
                      : "border-orange-500/90 bg-gradient-to-b from-[#fffdf9] via-[#fff8f0] to-orange-100/75 shadow-xl shadow-orange-900/15 ring-2 ring-orange-500/35 hover:shadow-2xl hover:shadow-orange-700/25 dark:border-sky-400/90 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/75 dark:shadow-indigo-950/50 dark:ring-sky-400/35 dark:hover:shadow-sky-500/30"
                    : "border-stone-200/90 bg-[#fffdf9]/90 opacity-92 shadow-xs hover:border-amber-500/50 hover:opacity-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/85 dark:hover:border-blue-500/50"
                }`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/75 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent"
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                      {plan.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        highlighted
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs dark:from-blue-600 dark:to-indigo-500"
                          : "bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {highlighted ? (
                        <Crown className="h-3 w-3" />
                      ) : (
                        plan.paidForRole && <Sparkles className="h-3 w-3" />
                      )}
                      <span>{plan.badge}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-stone-600 dark:text-slate-400">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold tracking-tight ${
                        highlighted
                          ? "bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300"
                          : "text-stone-900 dark:text-white"
                      }`}
                    >
                      {plan.priceLabel}
                    </span>
                    {plan.suffix && (
                      <span className="text-sm text-stone-500 dark:text-slate-400">
                        {plan.suffix}
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-stone-200/80 pt-6 text-sm text-stone-700 dark:border-slate-800 dark:text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!plan.paidForRole ? (
                  <MotionButton className="relative mt-8 w-full">
                    <Link
                      href={plan.ctaHref}
                      className="flex w-full items-center justify-center rounded-xl border border-stone-300 bg-[#faf7f2] px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-blue-500"
                    >
                      {plan.ctaLabel}
                    </Link>
                  </MotionButton>
                ) : isAlreadyPro ? (
                  <button
                    type="button"
                    disabled
                    className="relative mt-8 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-emerald-600/20 px-5 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    Active Pro Plan
                  </button>
                ) : (
                  <MotionButton className="relative mt-8 w-full">
                    <button
                      type="button"
                      disabled={isLoading || isRoleMismatch}
                      onClick={() => handleStripeCheckout(plan.id)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                        highlighted
                          ? "bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-700/25 hover:brightness-110 dark:from-blue-600 dark:via-blue-500 dark:to-indigo-500 dark:shadow-blue-600/30"
                          : "border border-stone-300 bg-[#faf7f2] text-stone-900 hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-blue-500"
                      }`}
                    >
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <span>
                        {isRoleMismatch
                          ? `Requires ${plan.paidForRole.toUpperCase()} account`
                          : plan.ctaLabel}
                      </span>
                    </button>
                  </MotionButton>
                )}
              </MotionCard>
            );
          })}
        </AutoList>

        <MotionSection className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center justify-center gap-2 text-center">
            <HelpCircle className="h-5 w-5 text-amber-700 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
              {faqTitle}
            </h2>
          </div>

          <AutoList className="mt-6 space-y-4">
            {activeFaqs.map((faq, idx) => (
              <MotionCard
                key={`${effectiveRoleForFaq}-${faq.question}`}
                index={idx}
                className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs hover:border-amber-500/50 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/50"
              >
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </MotionCard>
            ))}
          </AutoList>
        </MotionSection>
      </section>
    </div>
  );
}
