"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface StudentApplication {
  id?: string;
  _id?: string;
  tuitionId?: string;
  tuitionTitle?: string;
  tuitionSubject?: string;
  monthlyFee?: number;
  tutorEmail?: string;
  message?: string;
  status?: string;
  createdAt?: string;
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

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const token = readToken();
      const res = await apiRequest<unknown>(
        "/api/applications/my-applications",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCancel = async (appId: string) => {
    try {
      setCancellingId(appId);
      const token = readToken();
      await apiRequest(`/api/applications/${appId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/student"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Student Overview</span>
          </Link>
          <Link
            href="/tuitions"
            className="rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500 sm:text-sm"
          >
            Browse More Tuitions
          </Link>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
            View status updates for your submitted tuition applications. Pending
            applications can be cancelled.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-600" />
            </div>
          ) : applications.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2]/80 p-10 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-sm font-semibold text-stone-800 dark:text-slate-200">
                No applications found yet.
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
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Batch / Tuition</th>
                    <th className="py-3 pr-4">Subject</th>
                    <th className="py-3 pr-4">Fee</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {applications.map((app, idx) => {
                    const appId = String(app.id || app._id || idx);
                    const statusLower = (app.status || "pending").toLowerCase();
                    const isPending = statusLower === "pending";

                    return (
                      <tr key={appId}>
                        <td className="py-4 pr-4 font-semibold text-stone-900 dark:text-white">
                          <div>{app.tuitionTitle || "Tuition Batch"}</div>
                          {app.message && (
                            <div className="mt-0.5 text-xs font-normal text-stone-500 dark:text-slate-400">
                              {app.message}
                            </div>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-stone-600 dark:text-slate-300">
                          {app.tuitionSubject || "General"}
                        </td>
                        <td className="py-4 pr-4 font-medium text-stone-900 dark:text-white">
                          ৳{Number(app.monthlyFee || 0).toLocaleString()}
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
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>
                                {cancellingId === appId
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-stone-400 dark:text-slate-500">
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
        </div>
      </div>
    </div>
  );
}
