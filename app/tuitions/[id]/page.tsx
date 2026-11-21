"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Laptop,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface TuitionDetail {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline" | string;
  location?: string;
  monthlyFee: number;
  daysPerWeek?: number;
  schedule?: string;
  description?: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus?: string;
  isActive?: boolean;
}

interface StoredSession {
  user: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  token: string | null;
}

const SEVEN_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function format24HourTo12Hour(time24: string): string {
  const parts = time24.split(":");
  if (parts.length < 2) return "6:00 PM";
  const hourNum = Number(parts[0]);
  const minuteNum = Number(parts[1]);
  if (Number.isNaN(hourNum) || Number.isNaN(minuteNum)) return "6:00 PM";

  const period = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
  const paddedMinutes = String(minuteNum).padStart(2, "0");
  return `${hour12}:${paddedMinutes} ${period}`;
}

function buildScheduleString(days: string[], time24: string): string {
  const daysPart = days.length > 0 ? days.join(" / ") : "Flexible Days";
  const timePart = format24HourTo12Hour(time24);
  return `${daysPart}, ${timePart}`;
}

function readSession(): StoredSession {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const token = typeof parsed.token === "string" ? parsed.token : null;
    const candidate =
      parsed.user && typeof parsed.user === "object"
        ? (parsed.user as { name?: string; email?: string; role?: string })
        : (parsed as { name?: string; email?: string; role?: string });
    return { user: candidate, token };
  } catch {
    return { user: null, token: null };
  }
}

export default function TuitionDetailsPage() {
  const params = useParams<{ id: string }>();
  const tuitionId = params?.id;

  const [tuition, setTuition] = useState<TuitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [session, setSession] = useState<StoredSession>({
    user: null,
    token: null,
  });
  const [phone, setPhone] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Sun",
    "Tue",
    "Thu",
  ]);
  const [time24, setTime24] = useState<string>("18:00");
  const [preferredSchedule, setPreferredSchedule] = useState(
    buildScheduleString(["Sun", "Tue", "Thu"], "18:00"),
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    setSession(readSession());
    const onAuthChange = () => setSession(readSession());
    window.addEventListener("mentorlagbe-auth-change", onAuthChange);
    return () =>
      window.removeEventListener("mentorlagbe-auth-change", onAuthChange);
  }, []);

  useEffect(() => {
    if (!tuitionId) return;
    let isMounted = true;

    const loadTuitionDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const payload = await apiRequest<unknown>(`/api/tuitions/${tuitionId}`);
        const obj =
          payload && typeof payload === "object"
            ? (payload as { tuition?: unknown; data?: unknown })
            : null;

        const candidate =
          obj?.tuition && typeof obj.tuition === "object"
            ? obj.tuition
            : obj?.data && typeof obj.data === "object"
              ? obj.data
              : payload;

        if (
          candidate &&
          typeof candidate === "object" &&
          ("title" in candidate || "subject" in candidate)
        ) {
          if (isMounted) {
            setTuition(candidate as TuitionDetail);
          }
          return;
        }

        const listPayload = await apiRequest<unknown>("/api/tuitions");
        const listObj =
          listPayload && typeof listPayload === "object"
            ? (listPayload as { tuitions?: unknown; data?: unknown })
            : null;

        const rawList = Array.isArray(listPayload)
          ? listPayload
          : Array.isArray(listObj?.tuitions)
            ? listObj.tuitions
            : Array.isArray(listObj?.data)
              ? listObj.data
              : [];

        const matched = (rawList as TuitionDetail[]).find(
          (item) => String(item._id || item.id) === String(tuitionId),
        );

        if (isMounted) {
          if (matched) {
            setTuition(matched);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (isMounted) {
          setNotFound(true);
          toast.info("Could not load tuition details right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTuitionDetail();
    return () => {
      isMounted = false;
    };
  }, [tuitionId]);

  const handleToggleDay = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : SEVEN_DAYS.filter((d) => selectedDays.includes(d) || d === day);

    setSelectedDays(updatedDays);
    setPreferredSchedule(buildScheduleString(updatedDays, time24));
  };

  const handleTimeChange = (nextTime: string) => {
    const value = nextTime || "18:00";
    setTime24(value);
    setPreferredSchedule(buildScheduleString(selectedDays, value));
  };

  const handleApplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { user, token } = readSession();

    if (!user?.email) {
      toast.info("Please sign in as a student to apply.");
      return;
    }

    if (user.role?.toLowerCase() !== "student") {
      toast.error("Only student accounts can apply for tuitions.");
      return;
    }

    const composedMessage = [
      preferredSchedule.trim()
        ? `Preferred Schedule: ${preferredSchedule.trim()}`
        : "",
      phone.trim() ? `Phone: ${phone.trim()}` : "",
      message.trim(),
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      setSubmitting(true);
      await apiRequest("/api/applications", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          tuitionId: String(tuition?._id || tuition?.id || tuitionId || ""),
          studentPhone: phone.trim(),
          preferredSchedule: preferredSchedule.trim(),
          message: composedMessage,
        }),
      });

      setApplied(true);
      setPhone("");
      setMessage("");
      toast.success("Application submitted successfully!");
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Failed to submit application.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isOnline = tuition?.mode?.toLowerCase() === "online";
  const scheduleText =
    tuition?.schedule ||
    (tuition?.daysPerWeek ? `${tuition.daysPerWeek} days/week` : "Flexible");

  const role = session.user?.role?.toLowerCase();
  const isLoggedIn = Boolean(session.user?.email);
  const isStudent = role === "student";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19]">
      {/* Top Dark Header */}
      <section className="bg-[#06142e] py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Tuitions</span>
          </Link>

          {!loading && tuition && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{tuition.subject}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {isOnline ? (
                    <Laptop className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  <span>{tuition.mode || "Online"}</span>
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                {tuition.title}
              </h1>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-4">
              <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        )}

        {!loading && (notFound || !tuition) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tuition Batch Not Found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              This batch may have been removed or the link is invalid. Explore
              other active tuitions from the directory.
            </p>
            <div className="mt-6">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse Tuitions</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && tuition && (
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
            {/* Left Overview + Mentor Summary */}
            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Batch Overview
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  {tuition.description?.trim() ||
                    "Structured mentorship sessions focused on concept clarity, regular practice, and consistent academic progress."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/70">
                    <GraduationCap className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Class Level
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tuition.classLevel || "General"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/70">
                    <Calendar className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Weekly Schedule
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {scheduleText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/70">
                    <MapPin className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Location / Mode
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {isOnline
                          ? "Online Session"
                          : tuition.location || "Local Batch"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950/70">
                    <UserCheck className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Mentor
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tuition.tutorName || "Verified Mentor"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    What to Expect After Applying
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Your request goes directly to{" "}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {tuition.tutorName || "the mentor"}
                  </span>{" "}
                  with your preferred day and time slot. You can monitor{" "}
                  <span className="font-medium">Pending</span>,{" "}
                  <span className="font-medium">Accepted</span>, or{" "}
                  <span className="font-medium">Rejected</span> status from your
                  Student Dashboard.
                </p>
              </div>
            </div>

            {/* Right Fee & Apply Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monthly Fee
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  ৳{Number(tuition.monthlyFee || 0).toLocaleString()}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Active &amp; Open for Applications</span>
                </div>

                {!isLoggedIn ? (
                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Sign in with a Student account to apply for this tuition.
                    </p>
                    <Link
                      href="/sign-in"
                      className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Sign In to Apply
                    </Link>
                    <Link
                      href="/sign-up?role=student"
                      className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Create Student Account
                    </Link>
                  </div>
                ) : !isStudent ? (
                  <div className="mt-6 rounded-xl border-t border-slate-100 pt-5 dark:border-slate-800">
                    <p className="rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Only <strong>Student</strong> accounts can apply to
                      tuitions. You are signed in as{" "}
                      <strong className="uppercase">{role}</strong>.
                    </p>
                  </div>
                ) : applied ? (
                  <div className="mt-6 space-y-3 rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span>Application Submitted!</span>
                    </div>
                    <p className="text-xs">
                      Your application is now pending review. Track it anytime
                      in your Student Dashboard.
                    </p>
                    <Link
                      href="/dashboard/student/my-applications"
                      className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Go to My Applications
                    </Link>
                  </div>
                ) : (
                  <form
                    onSubmit={handleApplySubmit}
                    className="mt-6 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., 017XXXXXXXX"
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Preferred Schedule (7-Day &amp; 24-Hour)</span>
                        </label>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                          {selectedDays.length}{" "}
                          {selectedDays.length === 1 ? "day" : "days"}
                        </span>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {SEVEN_DAYS.map((day) => {
                          const active = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleToggleDay(day)}
                              className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
                                active
                                  ? "bg-blue-600 text-white"
                                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <label
                          htmlFor="preferred-time-24h"
                          className="text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Time Slot (24-Hour Input)
                        </label>
                        <input
                          id="preferred-time-24h"
                          type="time"
                          value={time24}
                          onChange={(e) => handleTimeChange(e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>

                      <input
                        type="text"
                        value={preferredSchedule}
                        onChange={(e) => setPreferredSchedule(e.target.value)}
                        placeholder="e.g., Sun / Tue / Thu, 6:00 PM"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Learning Note (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your goals or questions for the mentor..."
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span>{submitting ? "Submitting..." : "Apply Now"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
