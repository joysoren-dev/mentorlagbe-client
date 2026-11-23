"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Crown,
  FileText,
  GraduationCap,
  MapPin,
  Send,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface ApplicationItem {
  id?: string;
  _id?: string;
  tuitionTitle?: string;
  tuitionSubject?: string;
  monthlyFee?: number;
  status?: string;
}

interface ApprovedTuitionTutor {
  id: string;
  title: string;
  subject: string;
  tutorName: string;
  tutorEmail: string;
}

export interface CustomMentorRequest {
  id: string;
  subject: string;
  classLevel: string;
  mode: string;
  location?: string;
  preferredSchedule: string;
  monthlyBudget: number;
  preferredTutorName: string;
  preferredTutorEmail: string;
  note: string;
  status: "pending" | "matched" | "cancelled";
  createdAt: string;
}

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  classLevel?: string;
  preferredSubjects?: string;
  preferredMode?: string;
  preferredSchedule?: string;
}

const SEVEN_DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const REQUESTS_STORAGE_KEY = "mentorlagbe-student-requests";

function readSession(): { user: StoredUser | null; token: string | null } {
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

function readLocalRequests(email?: string): CustomMentorRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        (!email || !item.studentEmail || item.studentEmail === email),
    ) as CustomMentorRequest[];
  } catch {
    return [];
  }
}

export default function StudentDashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomMentorRequest[]>(
    [],
  );
  const [availableTutors, setAvailableTutors] = useState<
    ApprovedTuitionTutor[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Seek a Mentor form state
  const [seekSubject, setSeekSubject] = useState("");
  const [seekClassLevel, setSeekClassLevel] = useState("");
  const [seekMode, setSeekMode] = useState("Online");
  const [seekArea, setSeekArea] = useState("");
  const [seekDays, setSeekDays] = useState<string[]>(["Sun", "Tue", "Thu"]);
  const [seekTime, setSeekTime] = useState("6:00 PM");
  const [seekBudget, setSeekBudget] = useState("3000");
  const [selectedTutorKey, setSelectedTutorKey] = useState("");
  const [seekNote, setSeekNote] = useState("");
  const [submittingSeek, setSubmittingSeek] = useState(false);

  useEffect(() => {
    const { user: currentUser, token } = readSession();
    if (!currentUser?.email) {
      router.replace("/sign-in");
      return;
    }

    const normalizedRole = (currentUser.role || "student").toLowerCase();
    if (normalizedRole !== "student") {
      router.replace("/dashboard");
      return;
    }

    setUser(currentUser);
    if (currentUser.classLevel) setSeekClassLevel(currentUser.classLevel);
    if (currentUser.preferredSubjects) {
      const firstSubj = currentUser.preferredSubjects.split(",")[0]?.trim();
      if (firstSubj) setSeekSubject(firstSubj);
    }
    if (currentUser.preferredMode === "Offline") setSeekMode("Offline");

    setCustomRequests(readLocalRequests(currentUser.email));

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [appsRes, tuitionsRes] = await Promise.allSettled([
          apiRequest<unknown>("/api/applications/my-applications", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }),
          apiRequest<unknown>("/api/tuitions"),
        ]);

        if (appsRes.status === "fulfilled") {
          const res = appsRes.value;
          const obj =
            res && typeof res === "object"
              ? (res as { applications?: unknown; data?: unknown })
              : null;
          const list = Array.isArray(res)
            ? res
            : Array.isArray(obj?.applications)
              ? obj.applications
              : Array.isArray(obj?.data)
                ? obj.data
                : [];
          setApplications(list as ApplicationItem[]);
        }

        if (tuitionsRes.status === "fulfilled") {
          const tRes = tuitionsRes.value;
          const tObj =
            tRes && typeof tRes === "object"
              ? (tRes as { tuitions?: unknown; data?: unknown })
              : null;
          const rawTuitions = Array.isArray(tRes)
            ? tRes
            : Array.isArray(tObj?.tuitions)
              ? tObj.tuitions
              : Array.isArray(tObj?.data)
                ? tObj.data
                : [];

          const uniqueTutors = new Map<string, ApprovedTuitionTutor>();
          for (const item of rawTuitions as Record<string, unknown>[]) {
            const tName =
              typeof item.tutorName === "string" ? item.tutorName.trim() : "";
            const tEmail =
              typeof item.tutorEmail === "string" ? item.tutorEmail.trim() : "";
            const subj =
              typeof item.subject === "string" ? item.subject.trim() : "";
            const title =
              typeof item.title === "string" ? item.title.trim() : "";
            const id = String(item._id || item.id || `${tEmail}-${subj}`);
            if (tName) {
              const key = `${tEmail || tName}::${subj}`;
              if (!uniqueTutors.has(key)) {
                uniqueTutors.set(key, {
                  id,
                  title,
                  subject: subj,
                  tutorName: tName,
                  tutorEmail: tEmail,
                });
              }
            }
          }
          setAvailableTutors(Array.from(uniqueTutors.values()));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const showAreaField =
    seekMode === "Offline" || seekMode === "1-on-1 Session (Offline)";

  const toggleSeekDay = (day: string) => {
    setSeekDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : SEVEN_DAYS.filter((d) => prev.includes(d) || d === day),
    );
  };

  const handleSeekSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    const cleanSubject = seekSubject.trim();
    const cleanClass = seekClassLevel.trim();
    if (!cleanSubject) {
      toast.error("Please enter the subject you need a mentor for.");
      return;
    }
    if (!cleanClass) {
      toast.error("Please enter your class level or exam goal.");
      return;
    }

    const chosenTutor = availableTutors.find(
      (t) =>
        `${t.tutorEmail || t.tutorName}::${t.subject}` === selectedTutorKey,
    );

    const scheduleStr = `${
      seekDays.length > 0 ? seekDays.join(" / ") : "Flexible Days"
    }, ${seekTime.trim() || "Flexible Time"}`;

    const cleanArea = seekArea.trim();
    const combinedNote = [
      cleanArea ? `Preferred Area: ${cleanArea}` : "",
      seekNote.trim(),
    ]
      .filter(Boolean)
      .join(" · ");

    const newRequest: CustomMentorRequest & { studentEmail: string } = {
      id: `req-${Date.now()}`,
      studentEmail: user.email,
      subject: cleanSubject,
      classLevel: cleanClass,
      mode: seekMode,
      location: showAreaField ? cleanArea || "Offline Area" : "Online Session",
      preferredSchedule: scheduleStr,
      monthlyBudget: Number(seekBudget) || 0,
      preferredTutorName: chosenTutor?.tutorName || "Any Verified Mentor",
      preferredTutorEmail: chosenTutor?.tutorEmail || "",
      note: combinedNote,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmittingSeek(true);
      const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
      const existing = raw ? (JSON.parse(raw) as unknown[]) : [];
      const nextAll = [
        newRequest,
        ...(Array.isArray(existing) ? existing : []),
      ];
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(nextAll));
      window.dispatchEvent(new Event("mentorlagbe-student-requests-change"));

      setCustomRequests((prev) => [newRequest, ...prev]);
      setSeekNote("");
      setSeekArea("");
      setSelectedTutorKey("");
      toast.success(
        "Mentor request posted! Track or manage it in My Applications.",
      );
    } catch {
      toast.error("Could not save your mentor request right now.");
    } finally {
      setSubmittingSeek(false);
    }
  };

  const totalApplied = applications.length;
  const acceptedCount = applications.filter(
    (a) =>
      (a.status || "").toLowerCase() === "accepted" ||
      (a.status || "").toLowerCase() === "approved",
  ).length;
  const pendingCount = applications.filter(
    (a) => (a.status || "pending").toLowerCase() === "pending",
  ).length;
  const rejectedCount = applications.filter(
    (a) => (a.status || "").toLowerCase() === "rejected",
  ).length;

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Breadcrumb */}
        <MotionSection className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-300 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Hub</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
          >
            <span>Edit Academic Preferences</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </MotionSection>

        {/* Hero Banner */}
        <MotionSection className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-700/80 dark:bg-[#06142e] sm:p-8">
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -top-24 right-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
          />
          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
                Student Dashboard
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Welcome,{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-200 dark:to-indigo-300">
                  {user?.name || "Student"}
                </span>
              </h1>
              <p className="mt-1.5 text-sm text-stone-200 dark:text-slate-200">
                Plan:{" "}
                <strong className="uppercase text-amber-300 dark:text-blue-300">
                  {user?.plan || "free"}
                </strong>{" "}
                · Track your applications, discover verified batches, or seek a
                batch / 1-on-1 mentor directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <MotionButton>
                <Link
                  href="/dashboard/student/my-applications"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                >
                  <FileText className="h-4 w-4" />
                  <span>My Applications</span>
                </Link>
              </MotionButton>
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
              >
                <BookOpen className="h-4 w-4 text-amber-300 dark:text-blue-400" />
                <span>Browse Tuitions</span>
              </Link>
            </div>
          </div>
        </MotionSection>

        {/* 4 Reusable Stats Cards */}
        <AutoList className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MotionCard
            index={0}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-blue-950/40 dark:hover:border-blue-500/60"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent dark:from-white/5 dark:to-transparent"
            />
            <div className="relative flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Applied
              </span>
              <FileText className="h-4 w-4 text-amber-700 dark:text-blue-400" />
            </div>
            <p className="relative mt-3 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-800 bg-clip-text text-3xl font-extrabold text-transparent dark:from-white dark:via-blue-200 dark:to-sky-300">
              {loading ? "..." : totalApplied}
            </p>
            <p className="relative mt-1 text-xs font-medium text-stone-600 dark:text-slate-300">
              + {customRequests.length} custom mentor{" "}
              {customRequests.length === 1 ? "seek" : "seeks"}
            </p>
          </MotionCard>

          <MotionCard
            index={1}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-amber-950/30 dark:hover:border-amber-400/60"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent dark:from-white/5 dark:to-transparent"
            />
            <div className="relative flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pending
              </span>
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="relative mt-3 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-amber-300 dark:to-orange-300">
              {loading ? "..." : pendingCount}
            </p>
            <p className="relative mt-1 text-xs font-medium text-stone-600 dark:text-slate-300">
              Awaiting tutor response
            </p>
          </MotionCard>

          <MotionCard
            index={2}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-emerald-50/35 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-emerald-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-emerald-950/30 dark:hover:border-emerald-400/60"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent dark:from-white/5 dark:to-transparent"
            />
            <div className="relative flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Accepted
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="relative mt-3 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-emerald-300 dark:to-teal-300">
              {loading ? "..." : acceptedCount}
            </p>
            <p className="relative mt-1 text-xs font-medium text-stone-600 dark:text-slate-300">
              Confirmed tuition enrollments
            </p>
          </MotionCard>

          <MotionCard
            index={3}
            className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-rose-50/35 p-6 shadow-xs backdrop-blur-xs transition-all hover:border-rose-500/60 dark:border-slate-700/80 dark:from-slate-900 dark:to-rose-950/30 dark:hover:border-rose-400/60"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent dark:from-white/5 dark:to-transparent"
            />
            <div className="relative flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Rejected
              </span>
              <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="relative mt-3 bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-rose-300 dark:to-pink-300">
              {loading ? "..." : rejectedCount}
            </p>
            <p className="relative mt-1 text-xs font-medium text-stone-600 dark:text-slate-300">
              Closed or declined requests
            </p>
          </MotionCard>
        </AutoList>

        {/* Seek a Mentor / Custom Tuition Request Section */}
        <MotionSection className="mt-8 rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col justify-between gap-2 border-b border-stone-200/80 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                <Compass className="h-3.5 w-3.5" />
                <span>Custom Mentorship Seek</span>
              </div>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                Request a{" "}
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                  Batch or 1-on-1 Mentor
                </span>{" "}
                by Subject, Mode &amp; Schedule
              </h2>
              <p className="mt-1 text-xs text-stone-600 dark:text-slate-300 sm:text-sm">
                Choose Online, Offline, or 1-on-1 mentorship along with your
                subject, days, time slot, budget, and preferred mentor.
              </p>
            </div>
            <Link
              href="/dashboard/student/my-applications?tab=requests"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300 sm:text-sm"
            >
              <span>View Saved Seeks ({customRequests.length})</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <form onSubmit={handleSeekSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Subject Needed *
                </label>
                <div className="relative mt-1.5">
                  <BookOpen className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={seekSubject}
                    onChange={(e) => setSeekSubject(e.target.value)}
                    placeholder="e.g., Higher Math, Physics"
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-3.5 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Class Level / Goal *
                </label>
                <div className="relative mt-1.5">
                  <GraduationCap className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={seekClassLevel}
                    onChange={(e) => setSeekClassLevel(e.target.value)}
                    placeholder="e.g., HSC Science, SSC"
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-3.5 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Preferred Mode
                </label>
                <select
                  value={seekMode}
                  onChange={(e) => setSeekMode(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm font-medium text-stone-900 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                >
                  <option value="Online">Online (Batch)</option>
                  <option value="Offline">Offline / Local (Batch)</option>
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
                  Monthly Budget (৳)
                </label>
                <input
                  type="number"
                  min={500}
                  step={100}
                  value={seekBudget}
                  onChange={(e) => setSeekBudget(e.target.value)}
                  placeholder="3000"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                />
              </div>
            </div>

            {showAreaField && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Preferred Area / Location (Optional)
                </label>
                <div className="relative mt-1.5">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={seekArea}
                    onChange={(e) => setSeekArea(e.target.value)}
                    placeholder="e.g., Rajshahi / Local Area or Neighborhood"
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-3.5 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Preferred Days */}
              <div className="rounded-xl border border-stone-200/90 bg-[#faf7f2] p-3.5 dark:border-slate-700/80 dark:bg-slate-950 lg:col-span-5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                  <span>Preferred Days ({seekDays.length} selected)</span>
                </label>
                <div className="mt-2.5 grid grid-cols-7 gap-1">
                  {SEVEN_DAYS.map((day) => {
                    const active = seekDays.includes(day);
                    return (
                      <motion.button
                        key={day}
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleSeekDay(day)}
                        className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
                          active
                            ? "bg-amber-700 text-white dark:bg-blue-600 dark:text-white"
                            : "border border-stone-200 bg-[#fffdf9] text-stone-700 hover:border-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-400"
                        }`}
                      >
                        {day}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Time */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Preferred Time Slot
                </label>
                <div className="relative mt-1.5">
                  <Clock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={seekTime}
                    onChange={(e) => setSeekTime(e.target.value)}
                    placeholder="e.g., 6:00 PM - 7:30 PM"
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-3.5 pl-10 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {/* Optional Tutor Selection */}
              <div className="lg:col-span-4">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Preferred Tutor (Optional)
                </label>
                <div className="relative mt-1.5">
                  <UserCheck className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <select
                    value={selectedTutorKey}
                    onChange={(e) => setSelectedTutorKey(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-3.5 pl-10 text-sm text-stone-900 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  >
                    <option value="">Any Verified Mentor</option>
                    {availableTutors.map((t) => {
                      const val = `${t.tutorEmail || t.tutorName}::${t.subject}`;
                      return (
                        <option key={val} value={val}>
                          {t.tutorName} ({t.subject || "Mentor"})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                  Specific Topics or Learning Goal (Optional)
                </label>
                <input
                  type="text"
                  value={seekNote}
                  onChange={(e) => setSeekNote(e.target.value)}
                  placeholder="e.g., Need 1-on-1 help with Calculus & Vector before HSC test exam"
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                />
              </div>

              <MotionButton>
                <button
                  type="submit"
                  disabled={submittingSeek}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 disabled:opacity-60 dark:from-blue-600 dark:to-indigo-500 sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  <span>
                    {submittingSeek ? "Posting..." : "Post Mentor Request"}
                  </span>
                </button>
              </MotionButton>
            </div>
          </form>
        </MotionSection>

        {/* Current Plan Banner */}
        <MotionSection className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200/90 bg-gradient-to-r from-[#fffdf9] via-[#fffdf9] to-amber-50/40 p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/35">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-700/12 text-amber-800 dark:bg-blue-500/15 dark:text-blue-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-white">
                Current Plan:{" "}
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                  {(user?.plan || "free").toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-slate-300">
                Upgrade to Pro Student ($10) anytime from Pricing for priority
                booking and faster tutor matching.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>View Pricing</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </MotionSection>
      </div>
    </div>
  );
}
