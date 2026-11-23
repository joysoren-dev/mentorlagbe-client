"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, PlusCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

const WEEK_DAYS = [
  { short: "Sat", full: "Sat" },
  { short: "Sun", full: "Sun" },
  { short: "Mon", full: "Mon" },
  { short: "Tue", full: "Tue" },
  { short: "Wed", full: "Wed" },
  { short: "Thu", full: "Thu" },
  { short: "Fri", full: "Fri" },
];

const QUICK_DAY_SETS: { label: string; days: string[] }[] = [
  { label: "Sun / Tue / Thu", days: ["Sun", "Tue", "Thu"] },
  { label: "Sat / Mon / Wed", days: ["Sat", "Mon", "Wed"] },
  { label: "Fri / Sat", days: ["Fri", "Sat"] },
  {
    label: "All Week",
    days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
  },
];

const QUICK_TIMES_24H = [
  { label: "05:30 AM (Vor)", value: "05:30" },
  { label: "04:00 PM", value: "16:00" },
  { label: "07:00 PM", value: "19:00" },
  { label: "09:30 PM", value: "21:30" },
  { label: "11:30 PM (Late Night)", value: "23:30" },
];

function format24To12Hour(time24: string): string {
  const parts = time24.split(":");
  if (parts.length < 2) return time24;
  const hour24 = Number(parts[0]);
  const minute = Number(parts[1]);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) return time24;

  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const paddedHour = String(hour12).padStart(2, "0");
  const paddedMin = String(minute).padStart(2, "0");
  return `${paddedHour}:${paddedMin} ${period}`;
}

function readSession(): {
  token: string | null;
  plan: string;
  expertSubjects: string[];
} {
  if (typeof window === "undefined") {
    return { token: null, plan: "free", expertSubjects: [] };
  }
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { token: null, plan: "free", expertSubjects: [] };
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

    const plan =
      typeof candidate.plan === "string"
        ? candidate.plan.toLowerCase()
        : "free";
    const subjRaw =
      typeof candidate.expertSubjects === "string"
        ? candidate.expertSubjects
        : "";
    const expertSubjects = subjRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return { token, plan, expertSubjects };
  } catch {
    return { token: null, plan: "free", expertSubjects: [] };
  }
}

export default function PostTuitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("HSC");
  const [mode, setMode] = useState("Online");
  const [location, setLocation] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("2500");
  const [daysPerWeek, setDaysPerWeek] = useState("3");

  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Sun",
    "Tue",
    "Thu",
  ]);
  const [time24, setTime24] = useState("19:00");
  const [schedule, setSchedule] = useState("Sun / Tue / Thu, 07:00 PM");

  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingCount, setExistingCount] = useState<number>(0);
  const [profileSubjects, setProfileSubjects] = useState<string[]>([]);
  const [userPlan, setUserPlan] = useState<string>("free");

  useEffect(() => {
    const session = readSession();
    setUserPlan(session.plan);
    setProfileSubjects(session.expertSubjects);

    const checkExistingPosts = async () => {
      try {
        const res = await apiRequest<unknown>("/api/tuitions/my-tuitions", {
          headers: session.token
            ? { Authorization: `Bearer ${session.token}` }
            : {},
        });
        const obj =
          res && typeof res === "object"
            ? (res as { tuitions?: unknown[]; data?: unknown[] })
            : null;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(obj?.tuitions)
            ? obj.tuitions
            : Array.isArray(obj?.data)
              ? obj.data
              : [];
        setExistingCount(list.length);
      } catch {
        // Ignore if endpoint is not reachable locally
      }
    };

    checkExistingPosts();
  }, []);

  const requiresLocation =
    mode === "Offline" || mode === "1-on-1 Session (Offline)";

  const syncSchedule = (nextDays: string[], nextTime24: string) => {
    const daysText = nextDays.length > 0 ? nextDays.join(" / ") : "Custom Days";
    const timeText = nextTime24 ? format24To12Hour(nextTime24) : "";
    setDaysPerWeek(String(Math.max(1, nextDays.length || 1)));
    setSchedule(timeText ? `${daysText}, ${timeText}` : daysText);
  };

  const handleToggleDay = (day: string) => {
    const exists = selectedDays.includes(day);
    const nextDays = exists
      ? selectedDays.filter((d) => d !== day)
      : WEEK_DAYS.map((w) => w.short).filter(
          (d) => selectedDays.includes(d) || d === day,
        );
    setSelectedDays(nextDays);
    syncSchedule(nextDays, time24);
  };

  const handleApplyDaySet = (days: string[]) => {
    setSelectedDays(days);
    syncSchedule(days, time24);
  };

  const handleTimeChange = (newTime24: string) => {
    setTime24(newTime24);
    syncSchedule(selectedDays, newTime24);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      toast.error("Please enter both batch/session title and subject.");
      return;
    }

    if (userPlan !== "pro" && existingCount >= 2) {
      toast.error(
        "Free plan tutors can post up to 2 tuitions. Upgrade to Pro for unlimited batches!",
      );
      return;
    }

    try {
      setSubmitting(true);
      const session = readSession();

      const isOneOnOne =
        mode === "1-on-1 Session (Online)" ||
        mode === "1-on-1 Session (Offline)";
      const backendMode: "Online" | "Offline" =
        mode === "Offline" || mode === "1-on-1 Session (Offline)"
          ? "Offline"
          : "Online";

      const cleanTitle = title.trim();
      const finalTitle =
        isOneOnOne &&
        !cleanTitle.toLowerCase().includes("1-on-1") &&
        !cleanTitle.toLowerCase().includes("one-on-one")
          ? `${cleanTitle} (1-on-1 Session)`
          : cleanTitle;

      const cleanSubject = subject.trim();
      const cleanLevel = classLevel.trim() || "General";
      const cleanDesc = description.trim();
      const finalDescription =
        cleanDesc ||
        (isOneOnOne
          ? `1-on-1 mentorship session (${backendMode}) for ${cleanSubject} (${cleanLevel}).`
          : `${backendMode} batch for ${cleanSubject} (${cleanLevel}).`);

      await apiRequest("/api/tuitions", {
        method: "POST",
        headers: session.token
          ? { Authorization: `Bearer ${session.token}` }
          : {},
        body: JSON.stringify({
          title: finalTitle,
          subject: cleanSubject,
          classLevel: cleanLevel,
          mode: backendMode,
          location: requiresLocation
            ? location.trim() || "Local Area"
            : "Online Session",
          monthlyFee: Number(monthlyFee) || 0,
          daysPerWeek: Number(daysPerWeek) || 3,
          schedule: schedule.trim() || "Sun / Tue / Thu, 07:00 PM",
          description: finalDescription,
          approvalStatus: "pending",
          isActive: true,
        }),
      });

      toast.success("Tuition created! Sent for admin approval.");
      router.push("/dashboard/tutor/my-tuitions");
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Failed to post tuition.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tutor Dashboard</span>
          </Link>

          <motion.span
            initial={{ opacity: 0.85, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-600/30 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-200 dark:ring-blue-400/30"
          >
            {userPlan === "pro"
              ? "Pro Plan · Unlimited Posts"
              : `Free Plan · ${existingCount}/2 Used`}
          </motion.span>
        </MotionSection>

        <MotionCard
          index={0}
          className="relative overflow-hidden rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 sm:p-8"
        >
          {/* Animated Ambient Top Highlight */}
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-24 right-8 h-48 w-64 rounded-full bg-amber-500/15 blur-3xl dark:bg-blue-500/20"
          />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Batch &amp; 1-on-1 Mentorship Builder
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Create New{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                Tuition Batch
              </span>
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-slate-300">
              Publish an Online, Offline, or 1-on-1 session. Once approved by an
              admin, it goes live in the tuition directory.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Batch or 1-on-1 Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., HSC ICT Batch or 1-on-1 Math Mentorship"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., ICT or Higher Math"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                  {profileSubjects.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-slate-400">
                        <Sparkles className="h-3 w-3 text-amber-700 dark:text-blue-400" />
                        <span>From profile:</span>
                      </span>
                      {profileSubjects.map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setSubject(subj)}
                          className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-500/25 dark:bg-blue-500/20 dark:text-blue-200 dark:hover:bg-blue-500/30"
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Class Level
                  </label>
                  <input
                    type="text"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    placeholder="e.g., HSC / SSC / Class 8"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm font-medium text-stone-900 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="1-on-1 Session (Online)">
                      1-on-1 Session (Online)
                    </option>
                    <option value="1-on-1 Session (Offline)">
                      1-on-1 Session (Offline)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Monthly Fee (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Days / Week
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* Flexible 7-Day + 24-Hour Time Schedule Builder */}
              <div className="space-y-4 rounded-xl border border-stone-200/90 bg-[#faf7f2] p-4 dark:border-slate-700/80 dark:bg-slate-950">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-slate-100">
                    <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                    <span>Class Days &amp; 24-Hour Time</span>
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {QUICK_DAY_SETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyDaySet(preset.days)}
                        className="rounded-md border border-stone-200 bg-[#fffdf9] px-2 py-0.5 text-[11px] font-medium text-stone-700 transition hover:border-amber-600 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Day-by-Day Selector */}
                <div>
                  <p className="mb-1.5 text-[11px] font-medium text-stone-500 dark:text-slate-400">
                    Choose individual days:
                  </p>
                  <div className="grid grid-cols-7 gap-1.5">
                    {WEEK_DAYS.map((day) => {
                      const active = selectedDays.includes(day.short);
                      return (
                        <motion.button
                          key={day.short}
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleToggleDay(day.short)}
                          className={`rounded-lg py-2 text-xs font-semibold transition ${
                            active
                              ? "bg-amber-700 text-white shadow-xs dark:bg-blue-600 dark:text-white"
                              : "border border-stone-200 bg-[#fffdf9] text-stone-700 hover:border-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400"
                          }`}
                        >
                          {day.short}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 24-Hour Exact Time Input + Quick 24h Presets */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-stone-500 dark:text-slate-400">
                      Exact Time (24-Hour Clock — Vor / Rat / Anytime):
                    </label>
                    <input
                      type="time"
                      value={time24}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2 text-sm font-medium text-stone-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>

                  <div>
                    <p className="mb-1.5 text-[11px] font-medium text-stone-500 dark:text-slate-400">
                      Quick time presets:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_TIMES_24H.map((item) => {
                        const active = time24 === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => handleTimeChange(item.value)}
                            className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                              active
                                ? "bg-amber-800 text-white dark:bg-blue-500 dark:text-white"
                                : "border border-stone-200 bg-[#fffdf9] text-stone-700 hover:border-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Editable Final Schedule String */}
                <div>
                  <p className="mb-1 text-[11px] font-medium text-stone-500 dark:text-slate-400">
                    Final schedule preview (editable):
                  </p>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    placeholder="Sun / Tue / Thu, 07:00 PM"
                    className="w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2 text-sm font-semibold text-amber-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-blue-200 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {requiresLocation && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Location / Area *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Rajshahi / Dhanmondi"
                    className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Description (Batch or 1-on-1 Details)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Syllabus coverage, 1-on-1 or batch format, problem solving approach, and goals..."
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] p-3 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex justify-end pt-1">
                <MotionButton>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 disabled:opacity-60 dark:from-blue-600 dark:to-indigo-500"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <PlusCircle className="h-4 w-4" />
                    )}
                    <span>
                      {submitting ? "Publishing..." : "Publish Tuition"}
                    </span>
                  </button>
                </MotionButton>
              </div>
            </form>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
