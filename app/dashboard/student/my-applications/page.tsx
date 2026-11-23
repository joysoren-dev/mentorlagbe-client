"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Compass,
  FileText,
  Loader2,
  Mail,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";
import type { CustomMentorRequest } from "../page";

interface StudentApplication {
  id?: string;
  _id?: string;
  tuitionId?: string;
  tuitionTitle?: string;
  tuitionSubject?: string;
  subject?: string;
  monthlyFee?: number;
  tutorName?: string;
  tutorEmail?: string;
  preferredSchedule?: string;
  studentNote?: string;
  message?: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
}

const REQUESTS_STORAGE_KEY = "mentorlagbe-student-requests";

function readSession(): {
  email: string;
  role: string;
  token: string | null;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
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

    const email = typeof candidate.email === "string" ? candidate.email : "";
    const role =
      typeof candidate.role === "string"
        ? candidate.role.toLowerCase()
        : "student";
    if (!email) return null;
    return { email, role, token };
  } catch {
    return null;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomMentorRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"applications" | "requests">(
    "applications",
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = readSession();
    if (!session) {
      router.replace("/sign-in");
      return;
    }
    if (session.role !== "student") {
      router.replace("/dashboard");
      return;
    }

    const loadLocalRequests = () => {
      try {
        const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
        if (!raw) {
          setCustomRequests([]);
          return;
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCustomRequests(
            parsed.filter(
              (item) =>
                item &&
                typeof item === "object" &&
                (!item.studentEmail || item.studentEmail === session.email),
            ) as CustomMentorRequest[],
          );
        }
      } catch {
        setCustomRequests([]);
      }
    };

    const loadApplications = async () => {
      try {
        setLoading(true);
        const res = await apiRequest<unknown>(
          "/api/applications/my-applications",
          {
            headers: session.token
              ? { Authorization: `Bearer ${session.token}` }
              : {},
          },
        );
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
        setApplications(list as StudentApplication[]);
      } catch {
        setApplications([]);
        toast.info("Could not load your applications right now.");
      } finally {
        setLoading(false);
      }
    };

    loadLocalRequests();
    loadApplications();

    window.addEventListener(
      "mentorlagbe-student-requests-change",
      loadLocalRequests,
    );
    return () =>
      window.removeEventListener(
        "mentorlagbe-student-requests-change",
        loadLocalRequests,
      );
  }, [router]);

  const handleCancel = async (appId: string) => {
    try {
      setCancellingId(appId);
      const session = readSession();
      await apiRequest(`/api/applications/${appId}`, {
        method: "DELETE",
        headers: session?.token
          ? { Authorization: `Bearer ${session.token}` }
          : {},
      });
      setApplications((prev) =>
        prev.filter((item) => String(item.id || item._id) !== String(appId)),
      );
      toast.success("Application cancelled.");
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Failed to cancel application.";
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteCustomRequest = (reqId: string) => {
    try {
      const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CustomMentorRequest[]) : [];
      const next = Array.isArray(parsed)
        ? parsed.filter((item) => item.id !== reqId)
        : [];
      localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(next));
      setCustomRequests((prev) => prev.filter((item) => item.id !== reqId));
      toast.success("Custom mentor request removed.");
    } catch {
      toast.error("Could not remove request.");
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const statusLower = (app.status || "pending").toLowerCase();
      const normalizedStatus =
        statusLower === "approved" ? "accepted" : statusLower;
      if (statusFilter !== "all" && normalizedStatus !== statusFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (app.tuitionTitle || "").toLowerCase().includes(q) ||
        (app.tuitionSubject || app.subject || "").toLowerCase().includes(q) ||
        (app.tutorName || "").toLowerCase().includes(q) ||
        (app.tutorEmail || "").toLowerCase().includes(q)
      );
    });
  }, [applications, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-300 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Student Overview</span>
          </Link>

          <MotionButton>
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500 sm:text-sm"
            >
              <span>Browse More Tuitions</span>
            </Link>
          </MotionButton>
        </MotionSection>

        <MotionCard
          index={0}
          className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 sm:p-8"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-5 dark:border-slate-800 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                Enrollment Tracker
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                My{" "}
                <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                  Applications
                </span>{" "}
                &amp; Mentor Requests
              </h1>
              <p className="mt-1 text-sm text-stone-600 dark:text-slate-300">
                Track batch applications, tutor contact details, and your custom
                mentor seeks.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex rounded-xl border border-stone-200 bg-[#faf7f2] p-1 dark:border-slate-700/80 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setActiveTab("applications")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  activeTab === "applications"
                    ? "bg-amber-700 text-white shadow-2xs dark:bg-blue-600 dark:text-white"
                    : "text-stone-700 hover:text-amber-800 dark:text-slate-200 dark:hover:text-blue-300"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Batch Applications ({applications.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  activeTab === "requests"
                    ? "bg-amber-700 text-white shadow-2xs dark:bg-blue-600 dark:text-white"
                    : "text-stone-700 hover:text-amber-800 dark:text-slate-200 dark:hover:text-blue-300"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Mentor Seeks ({customRequests.length})</span>
              </button>
            </div>
          </div>

          {activeTab === "applications" ? (
            <>
              {/* Filter & Search Bar */}
              <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-1.5">
                  {["all", "pending", "accepted", "rejected"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                        statusFilter === st
                          ? "bg-amber-700/15 text-amber-900 ring-1 ring-amber-700/40 dark:bg-blue-500/20 dark:text-blue-200 dark:ring-blue-400/50"
                          : "bg-[#faf7f2] text-stone-700 hover:text-stone-900 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search batch, subject, tutor..."
                    className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2 pr-3 pl-9 text-xs text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-400" />
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-stone-800 dark:text-slate-100">
                    {applications.length === 0
                      ? "No batch applications found yet."
                      : "No applications match your current filter."}
                  </p>
                  <Link
                    href="/tuitions"
                    className="mt-4 inline-flex rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Explore Tuitions
                  </Link>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-stone-200 text-xs uppercase text-stone-600 dark:border-slate-800 dark:text-slate-300">
                      <tr>
                        <th className="py-3 pr-4">Tuition &amp; Subject</th>
                        <th className="py-3 pr-4">Tutor Details</th>
                        <th className="py-3 pr-4">Monthly Fee</th>
                        <th className="py-3 pr-4">Applied Date</th>
                        <th className="py-3 pr-4">Status</th>
                        <th className="py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                      {filteredApplications.map((app, idx) => {
                        const appId = String(app.id || app._id || idx);
                        const statusLower = (
                          app.status || "pending"
                        ).toLowerCase();
                        const isPending = statusLower === "pending";
                        const noteText =
                          app.preferredSchedule ||
                          app.studentNote ||
                          app.message;

                        return (
                          <tr key={appId} className="align-top">
                            <td className="py-4 pr-4">
                              <div className="font-bold text-stone-900 dark:text-white">
                                {app.tuitionTitle || "Tuition Batch"}
                              </div>
                              <div className="mt-0.5 text-xs font-semibold text-amber-800 dark:text-blue-400">
                                {app.tuitionSubject || app.subject || "General"}
                              </div>
                              {noteText && (
                                <div className="mt-1 max-w-xs text-xs text-stone-600 dark:text-slate-300">
                                  {noteText}
                                </div>
                              )}
                            </td>

                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-slate-100">
                                <UserCheck className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
                                <span>{app.tutorName || "Assigned Tutor"}</span>
                              </div>
                              {app.tutorEmail && (
                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-600 dark:text-slate-300">
                                  <Mail className="h-3 w-3" />
                                  <span>{app.tutorEmail}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-4 pr-4 font-bold text-stone-900 dark:text-white">
                              ৳{Number(app.monthlyFee || 0).toLocaleString()}
                            </td>

                            <td className="py-4 pr-4 text-xs text-stone-600 dark:text-slate-300">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>
                                  {formatDate(app.appliedAt || app.createdAt)}
                                </span>
                              </span>
                            </td>

                            <td className="py-4 pr-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                  statusLower === "accepted" ||
                                  statusLower === "approved"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : statusLower === "rejected"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                                }`}
                              >
                                {app.status || "pending"}
                              </span>
                            </td>

                            <td className="py-4 text-right">
                              {isPending ? (
                                <button
                                  type="button"
                                  disabled={cancellingId === appId}
                                  onClick={() => handleCancel(appId)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-900/60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>
                                    {cancellingId === appId
                                      ? "Cancelling..."
                                      : "Cancel"}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-xs text-stone-400 dark:text-slate-400">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6">
              {customRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-stone-800 dark:text-slate-100">
                    No custom mentor requests posted yet.
                  </p>
                  <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
                    Use the &ldquo;Request a Mentor&rdquo; form on your Student
                    Overview page to specify your subject, days, and budget.
                  </p>
                  <Link
                    href="/dashboard/student"
                    className="mt-4 inline-flex rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    Post a Mentor Request
                  </Link>
                </div>
              ) : (
                <AutoList className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {customRequests.map((req, idx) => (
                    <MotionCard
                      key={req.id}
                      index={idx}
                      className="flex flex-col justify-between rounded-xl border border-stone-200 bg-gradient-to-b from-[#faf7f2] to-amber-50/35 p-5 dark:border-slate-700/80 dark:from-slate-950 dark:to-blue-950/30"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:bg-blue-500/20 dark:text-blue-200">
                            {req.subject} · {req.mode}
                          </span>
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            {req.status}
                          </span>
                        </div>

                        <h3 className="mt-3 text-base font-extrabold text-stone-900 dark:text-white">
                          {req.classLevel}
                        </h3>
                        <p className="mt-1 text-xs text-stone-700 dark:text-slate-200">
                          Schedule: <strong>{req.preferredSchedule}</strong> ·
                          Budget:{" "}
                          <strong className="text-amber-800 dark:text-blue-300">
                            ৳{Number(req.monthlyBudget || 0).toLocaleString()}
                            /mo
                          </strong>
                        </p>
                        <p className="mt-1 text-xs text-stone-700 dark:text-slate-200">
                          Preferred Mentor:{" "}
                          <strong>{req.preferredTutorName}</strong>
                        </p>
                        {req.note && (
                          <p className="mt-2 rounded-lg border border-stone-200/80 bg-[#fffdf9] p-2.5 text-xs text-stone-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                            {req.note}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-stone-200/80 pt-3 text-xs dark:border-slate-800">
                        <span className="text-stone-600 dark:text-slate-300">
                          Posted {formatDate(req.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomRequest(req.id)}
                          className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </MotionCard>
                  ))}
                </AutoList>
              )}
            </div>
          )}
        </MotionCard>
      </div>
    </div>
  );
}
