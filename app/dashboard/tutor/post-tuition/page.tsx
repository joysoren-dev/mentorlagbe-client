"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

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

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.token === "string") return parsed.token;
    if (typeof parsed.accessToken === "string") return parsed.accessToken;
    if (parsed.user && typeof parsed.user === "object") {
      const u = parsed.user as Record<string, unknown>;
      if (typeof u.token === "string") return u.token;
      if (typeof u.accessToken === "string") return u.accessToken;
    }
    return null;
  } catch {
    return null;
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
      toast.error("Please enter both batch title and subject.");
      return;
    }

    try {
      setSubmitting(true);
      const token = readToken();
      await apiRequest("/api/tuitions", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          title: title.trim(),
          subject: subject.trim(),
          classLevel: classLevel.trim(),
          mode,
          location: mode === "Online" ? "Online Session" : location.trim(),
          monthlyFee: Number(monthlyFee) || 0,
          daysPerWeek: Number(daysPerWeek) || 3,
          schedule: schedule.trim(),
          description: description.trim(),
        }),
      });

      toast.success("Tuition batch created! Sent for admin approval.");
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
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/tutor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tutor Dashboard</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create New Tuition Batch
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Publish a batch listing. Once approved by an admin, it goes live in
            the tuition directory.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Batch Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., HSC ICT & Programming Fundamentals Batch"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., ICT or Higher Math"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Class Level
                </label>
                <input
                  type="text"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  placeholder="e.g., HSC / SSC / Class 8"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Fee (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Days / Week
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            {/* Flexible 7-Day + 24-Hour Time Schedule Builder */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Class Days &amp; 24-Hour Time</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {QUICK_DAY_SETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyDaySet(preset.days)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Day-by-Day Selector */}
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Choose individual days:
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEK_DAYS.map((day) => {
                    const active = selectedDays.includes(day.short);
                    return (
                      <button
                        key={day.short}
                        type="button"
                        onClick={() => handleToggleDay(day.short)}
                        className={`rounded-lg py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-blue-600 text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 24-Hour Exact Time Input + Quick 24h Presets */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Exact Time (24-Hour Clock — Vor / Rat / Anytime):
                  </label>
                  <input
                    type="time"
                    value={time24}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
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
                              ? "bg-slate-900 text-white dark:bg-blue-500"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
                <p className="mb-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Final schedule preview (editable):
                </p>
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Sun / Tue / Thu, 07:00 PM"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            {mode === "Offline" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Rajshahi / Dhanmondi"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Syllabus coverage, problem solving approach, and batch goals..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              <span>{submitting ? "Publishing..." : "Publish Tuition"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
