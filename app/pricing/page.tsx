"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    badge: "Free Forever",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description:
      "Ideal for students exploring verified tutors and mentors starting their first batch.",
    features: [
      "Browse all verified tuition listings",
      "Filter by subject, class level, and mode",
      "Direct batch inquiry & application",
      "Basic profile & dashboard access",
    ],
    ctaLabel: "Get Started Free",
    ctaHref: "/sign-up",
    highlighted: false,
  },
  {
    name: "Mentor Pro",
    badge: "Most Popular",
    monthlyPrice: 499,
    yearlyPrice: 399,
    description:
      "Built for active tutors who want higher visibility, priority approvals, and batch analytics.",
    features: [
      "Publish up to 15 active tuition batches",
      "Featured placement on Home & Directory",
      "Verified Mentor badge on all listings",
      "Applicant tracking & instant notifications",
      "Priority review & support",
    ],
    ctaLabel: "Start Mentor Pro",
    ctaHref: "/sign-up",
    highlighted: true,
  },
  {
    name: "Coaching & Team",
    badge: "For Academies",
    monthlyPrice: 1499,
    yearlyPrice: 1199,
    description:
      "Designed for coaching centers and multi-subject mentorship teams managing larger cohorts.",
    features: [
      "Unlimited active tuition & batch listings",
      "Multi-subject & multi-location management",
      "Dedicated academy profile & branding",
      "Monthly enrollment & fee insights",
      "24/7 priority onboarding assistance",
    ],
    ctaLabel: "Create Academy Account",
    ctaHref: "/sign-up",
    highlighted: false,
  },
];

const FAQS = [
  {
    question:
      "Do students need to pay a subscription fee to apply for tuitions?",
    answer:
      "No. Students can browse all approved listings and apply to batches completely free. You only pay the tutor's stated monthly tuition fee once enrolled.",
  },
  {
    question: "Can tutors start publishing batches on the free plan?",
    answer:
      "Yes. New tutors can create an account on the Starter plan and submit tuition listings for admin approval without upfront charges.",
  },
  {
    question: "Can I switch between monthly and yearly billing anytime?",
    answer:
      "Yes, you can upgrade, downgrade, or switch billing cycles directly from your dashboard settings at any time.",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19]">
      {/* Header Banner */}
      <section className="bg-[#06142e] py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Transparent Plans
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">
            Simple Pricing for Students &amp; Mentors
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Students browse and apply for free. Tutors and academies can scale
            their reach with flexible monthly or yearly plans.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 p-1.5">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                !yearly
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition sm:text-sm ${
                yearly
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Yearly Billing</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-300">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={`flex h-full flex-col justify-between rounded-2xl border p-7 shadow-sm transition ${
                  plan.highlighted
                    ? "border-blue-600 bg-white ring-2 ring-blue-600/20 dark:border-blue-500 dark:bg-slate-900"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                        plan.highlighted
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {plan.highlighted && <Sparkles className="h-3 w-3" />}
                      <span>{plan.badge}</span>
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {price === 0 ? "Free" : `৳${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        / month
                      </span>
                    )}
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`mt-8 flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border border-slate-300 bg-slate-50 text-slate-900 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:border-blue-500"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="flex items-center justify-center gap-2 text-center">
            <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
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
