"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import FeaturedTuitions from "@/components/FeaturedTuitions";
import HowItWorks from "@/components/HowItWorks";
import WhyChooseUs from "@/components/WhyChooseUs";

interface HeroSlide {
  id: number;
  tag: string;
  badge: string;
  image: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix: string;
  description: string;
  panelLabel: string;
  panelTitle: string;
  highlightOneTitle: string;
  highlightOneDesc: string;
  highlightTwoTitle: string;
  highlightTwoDesc: string;
  statOneValue: string;
  statOneLabel: string;
  statTwoValue: string;
  statTwoLabel: string;
  statThreeValue: string;
  statThreeLabel: string;
}

const SLIDE_INTERVAL_MS = 3400;

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    tag: "01 / Overview",
    badge: "Online & Local Mentorship Marketplace",
    image: "/images/slide 1.jpeg",
    titlePrefix: "Find Your Ideal Tutor or ",
    titleHighlight: "Mentorship Batch",
    titleSuffix: " Today",
    description:
      "Connect with verified mentors across academic subjects, board exams, university courses, and skill tracks with transparent monthly fees.",
    panelLabel: "Structured Learning Hub",
    panelTitle: "1-on-1 & Small Group Batches",
    highlightOneTitle: "Role-Based Workflows",
    highlightOneDesc:
      "Dedicated portals for students to apply and track status, and for tutors to manage batches and applicants.",
    highlightTwoTitle: "Clear Schedules & Monthly Plans",
    highlightTwoDesc:
      "Filter listings by subject, class level, and study mode before submitting an application.",
    statOneValue: "Live",
    statOneLabel: "Batches",
    statTwoValue: "2 Modes",
    statTwoLabel: "Online/Local",
    statThreeValue: "Pro",
    statThreeLabel: "Upgrades",
  },
  {
    id: 1,
    tag: "02 / For Tutors",
    badge: "Built for Dedicated Tutors & Mentors",
    image: "/images/slide 2.jpeg",
    titlePrefix: "Showcase Your Batches & ",
    titleHighlight: "Grow Student Enrollments",
    titleSuffix: " Seamlessly",
    description:
      "Create structured tuition listings, review incoming student applications, and upgrade to Pro for unlimited batch postings.",
    panelLabel: "Tutor Workspace",
    panelTitle: "Batch Posting & Applicant Control",
    highlightOneTitle: "Simple Batch Management",
    highlightOneDesc:
      "Update monthly fees, weekly class days, active status, and review student requests in one dashboard.",
    highlightTwoTitle: "Pro Plan Advantages",
    highlightTwoDesc:
      "Unlock expanded posting capacity and stand out to students searching for active mentors.",
    statOneValue: "Free/Pro",
    statOneLabel: "Tutor Plans",
    statTwoValue: "Direct",
    statTwoLabel: "Applicants",
    statThreeValue: "Easy",
    statThreeLabel: "Controls",
  },
  {
    id: 2,
    tag: "03 / For Students",
    badge: "Verified Tutors & Instant Applications",
    image: "/images/slide 3.jpeg",
    titlePrefix: "Learn Faster With ",
    titleHighlight: "Subject Specialists",
    titleSuffix: " & Guided Tracks",
    description:
      "Browse approved tuition posts, compare schedules and learning modes, and apply directly with real-time status updates.",
    panelLabel: "Student & Tutor Portal",
    panelTitle: "Simple Enrollment & Moderation",
    highlightOneTitle: "Moderated Quality Listings",
    highlightOneDesc:
      "Tuition posts are reviewed for clarity and active availability so students browse reliable batches.",
    highlightTwoTitle: "Real-Time Application Tracking",
    highlightTwoDesc:
      "Check pending, accepted, or rejected application states anytime from your student dashboard.",
    statOneValue: "Verified",
    statOneLabel: "Mentors",
    statTwoValue: "Fast",
    statTwoLabel: "Apply Flow",
    statThreeValue: "Secure",
    statThreeLabel: "Checkout",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) =>
        prev === HERO_SLIDES.length - 1 ? 0 : prev + 1,
      );
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="w-full">
      {/* Full-Width Horizontal 3-Slide Hero Carousel */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden bg-[#06142e] text-white"
      >
        {/* Sliding Track: each slide is a full-width separate slide with its own photo */}
        <div
          className="flex w-full transition-transform duration-400 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative w-full min-w-full shrink-0 overflow-hidden"
            >
              <img
                src={encodeURI(slide.image)}
                alt={slide.panelTitle}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-70"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06142e]/85 via-[#06142e]/55 to-[#06142e]/75"
              />
              <div className="pointer-events-none absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

              <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                  {/* Left Column: Slide Content + Search Bar */}
                  <div className="space-y-6 lg:col-span-7">
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-[#06142e]/80 px-3.5 py-1.5 text-xs font-medium text-blue-300 backdrop-blur-sm">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>{slide.badge}</span>
                        </span>
                        <span className="rounded-full border border-slate-700/80 bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-slate-200 backdrop-blur-sm">
                          {slide.tag}
                        </span>
                      </div>

                      <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-4xl lg:text-5xl lg:leading-[1.15]">
                        {slide.titlePrefix}
                        <span className="text-blue-400">
                          {slide.titleHighlight}
                        </span>
                        {slide.titleSuffix}
                      </h1>

                      <p className="max-w-2xl rounded-xl bg-[#06142e]/55 px-3.5 py-2.5 text-base leading-relaxed text-slate-200 backdrop-blur-[2px] sm:text-lg">
                        {slide.description}
                      </p>
                    </div>

                    {/* Quick Search Form -> Navigates to /tuitions with query */}
                    <form
                      action="/tuitions"
                      method="GET"
                      className="flex flex-col gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2.5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-1 items-center gap-2.5 px-3 py-1.5">
                        <BookOpen className="h-4 w-4 shrink-0 text-blue-400" />
                        <input
                          type="text"
                          name="search"
                          placeholder="Search subject, course, or batch title (e.g., Math, Physics, IELTS)..."
                          className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        <span>Browse Tuitions</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-xs text-slate-200 sm:text-sm">
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#06142e]/65 px-2.5 py-1 backdrop-blur-[2px]">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Verified Tutors</span>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#06142e]/65 px-2.5 py-1 backdrop-blur-[2px]">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Online &amp; Offline Modes</span>
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-lg bg-[#06142e]/65 px-2.5 py-1 backdrop-blur-[2px]">
                        <CheckCircle2 className="h-4 w-4 text-blue-400" />
                        <span>Real-Time Status</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Visual Highlight Panel */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/85 p-6 shadow-2xl backdrop-blur-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                            {slide.panelLabel}
                          </p>
                          <h2 className="mt-1 text-lg font-semibold text-white">
                            {slide.panelTitle}
                          </h2>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                          {slide.id === 0 && (
                            <ShieldCheck className="h-5 w-5" />
                          )}
                          {slide.id === 1 && <Award className="h-5 w-5" />}
                          {slide.id === 2 && (
                            <GraduationCap className="h-5 w-5" />
                          )}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3.5">
                        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#06142e]/85 p-3.5">
                          <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {slide.highlightOneTitle}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                              {slide.highlightOneDesc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-[#06142e]/85 p-3.5">
                          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {slide.highlightTwoTitle}
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                              {slide.highlightTwoDesc}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-center">
                        <div className="rounded-lg bg-slate-800/60 p-2.5">
                          <p className="text-base font-bold text-white">
                            {slide.statOneValue}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {slide.statOneLabel}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-800/60 p-2.5">
                          <p className="text-base font-bold text-blue-400">
                            {slide.statTwoValue}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {slide.statTwoLabel}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-800/60 p-2.5">
                          <p className="text-base font-bold text-white">
                            {slide.statThreeValue}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {slide.statThreeLabel}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link
                          href="/tuitions"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                        >
                          <span>Explore all listings</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Centered Capsule Indicators */}
        <div className="relative mx-auto flex max-w-7xl items-center justify-center border-t border-slate-800/80 bg-[#06142e]/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide) => {
              const isActive = activeSlide === slide.id;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(slide.id)}
                  aria-label={`Go to slide ${slide.id + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 bg-blue-500"
                      : "w-2.5 bg-slate-600 hover:bg-slate-500"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Tuitions Section */}
      <FeaturedTuitions />
      {/* How It Works Section */}
      <HowItWorks />
      {/* Why Choose Us Section */}
      <WhyChooseUs />
    </div>
  );
}
