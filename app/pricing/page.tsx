"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface StoredUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
  token?: string;
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
    highlighted: false,
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
    highlighted: false,
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
    highlighted: true,
    paidForRole: "tutor" as const,
  },
];

const FAQS = [
  {
    question:
      "Do students need to pay a subscription fee to apply for tuitions?",
    answer:
      "No. Students can browse all approved listings and apply to batches for free. Upgrading to Pro Student ($10) unlocks priority booking and Pro status.",
  },
  {
    question: "What does the Pro Tutor ($15) upgrade include?",
    answer:
      "Free tutors can post up to 2 tuitions, while Pro Tutors get unlimited tuition posts, a Pro plan badge, and full applicant management.",
  },
  {
    question: "How does Stripe upgrade my account to Pro?",
    answer:
      "Once you complete Stripe Checkout, your payment is recorded and your account plan automatically updates to Pro.",
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
      <section className="bg-[#16120e] py-14 text-white dark:bg-[#06142e] sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 dark:text-blue-400">
            Transparent Plans
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            Simple Pricing for Students &amp; Mentors
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-300 dark:text-slate-300 sm:text-base">
            Start free or upgrade to Pro via Stripe for priority student
            features and unlimited tutor batch postings.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isAlreadyPro =
              Boolean(plan.paidForRole) && currentUser?.plan === "pro";
            const isRoleMismatch =
              Boolean(plan.paidForRole) &&
              Boolean(currentUser?.role) &&
              currentUser?.role !== "admin" &&
              currentUser?.role !== plan.paidForRole;
            const isLoading = loadingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`flex h-full flex-col justify-between rounded-2xl border p-7 shadow-xs backdrop-blur-xs transition ${
                  plan.highlighted
                    ? "border-amber-600 bg-[#fffdf9]/95 ring-2 ring-amber-600/20 dark:border-blue-500 dark:bg-slate-900/95 dark:ring-blue-500/20"
                    : "border-stone-200/90 bg-[#fffdf9]/92 dark:border-slate-800 dark:bg-slate-900/90"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                      {plan.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        plan.highlighted
                          ? "bg-amber-700 text-white dark:bg-blue-600"
                          : "bg-stone-100 text-stone-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {plan.highlighted && <Sparkles className="h-3 w-3" />}
                      <span>{plan.badge}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-stone-600 dark:text-slate-400">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-stone-900 dark:text-white">
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
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!plan.paidForRole ? (
                  <Link
                    href={plan.ctaHref}
                    className="mt-8 flex w-full items-center justify-center rounded-xl border border-stone-300 bg-[#faf7f2] px-5 py-3 text-sm font-semibold text-stone-900 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-blue-500"
                  >
                    {plan.ctaLabel}
                  </Link>
                ) : isAlreadyPro ? (
                  <button
                    type="button"
                    disabled
                    className="mt-8 flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-emerald-600/20 px-5 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    Active Pro Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading || isRoleMismatch}
                    onClick={() => handleStripeCheckout(plan.id)}
                    className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-amber-700 text-white hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                        : "border border-stone-300 bg-[#faf7f2] text-stone-900 hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-blue-500"
                    }`}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>
                      {isRoleMismatch
                        ? `Requires ${plan.paidForRole.toUpperCase()} account`
                        : plan.ctaLabel}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center justify-center gap-2 text-center">
            <HelpCircle className="h-5 w-5 text-amber-700 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90"
              >
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
