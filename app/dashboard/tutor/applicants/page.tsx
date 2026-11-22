"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface TutorApplicant {
  id?: string;
  _id?: string;
  tuitionTitle?: string;
  studentName?: string;
  studentEmail?: string;
  message?: string;
  status?: string;
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

export default function TutorApplicantsPage() {
  const [applicants, setApplicants] = useState<TutorApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplicants = async () => {
    try {
      setLoading(true);
      const token = readToken();
      const res = await apiRequest<unknown>("/api/applications/tutor", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
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
      setApplicants(list as TutorApplicant[]);
    } catch {
      setApplicants([]);
      toast.info("Could not load applicants right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, []);

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdatingId(id);
      const token = readToken();
      await apiRequest(`/api/applications/${id}/status`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ status }),
      });
      setApplicants((prev) =>
        prev.map((item) =>
          String(item.id || item._id) === id ? { ...item, status } : item,
        ),
      );
      toast.success(`Application ${status}!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/tutor"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Tutor Dashboard</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Student Applicants
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review student requests for your batches and approve or reject them.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : applicants.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No student applications received yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 pr-4 text-left">Student</th>
                    <th className="py-3 pr-4 text-left">Batch</th>
                    <th className="py-3 pr-4 text-left">Details</th>
                    <th className="py-3 pr-4 text-left">Status</th>
                    <th className="py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applicants.map((app, idx) => {
                    const id = String(app.id || app._id || idx);
                    const statusLower = (app.status || "pending").toLowerCase();

                    return (
                      <tr key={id} className="align-top">
                        <td className="py-4 pr-4 text-left">
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {app.studentName || "Student"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {app.studentEmail}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-left font-medium text-slate-800 dark:text-slate-200">
                          {app.tuitionTitle || "Tuition Batch"}
                        </td>
                        <td className="py-4 pr-4 text-left text-xs text-slate-600 dark:text-slate-400">
                          {app.message || "—"}
                        </td>
                        <td className="py-4 pr-4 text-left">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              statusLower === "approved" ||
                              statusLower === "accepted"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : statusLower === "rejected"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {app.status || "pending"}
                          </span>
                        </td>
                        <td className="py-4 text-left">
                          <div className="flex flex-col items-start gap-1.5">
                            <button
                              type="button"
                              disabled={updatingId === id}
                              onClick={() => handleStatus(id, "approved")}
                              className="inline-flex w-24 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === id}
                              onClick={() => handleStatus(id, "rejected")}
                              className="inline-flex w-24 items-center justify-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              <X className="h-3.5 w-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
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
