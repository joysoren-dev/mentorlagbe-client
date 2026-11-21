"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface AdminTuition {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel?: string;
  mode?: string;
  monthlyFee?: number;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus?: string;
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

export default function AdminTuitionsModerationPage() {
  const [tuitions, setTuitions] = useState<AdminTuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTuitions = async () => {
    try {
      setLoading(true);
      const token = readToken();
      const res = await apiRequest<unknown>("/api/tuitions/admin/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const obj =
        res && typeof res === "object"
          ? (res as { tuitions?: unknown; data?: unknown })
          : null;
      const list = Array.isArray(res)
        ? res
        : Array.isArray(obj?.tuitions)
          ? obj.tuitions
          : Array.isArray(obj?.data)
            ? obj.data
            : [];
      setTuitions(list as AdminTuition[]);
    } catch {
      setTuitions([]);
      toast.info("Could not load tuitions for moderation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTuitions();
  }, []);

  const handleApproval = async (
    id: string,
    approvalStatus: "approved" | "rejected",
  ) => {
    try {
      setUpdatingId(id);
      const token = readToken();
      await apiRequest(`/api/tuitions/admin/${id}/approval`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ approvalStatus }),
      });
      setTuitions((prev) =>
        prev.map((item) =>
          String(item._id || item.id) === id
            ? { ...item, approvalStatus }
            : item,
        ),
      );
      toast.success(`Tuition marked as ${approvalStatus}!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update approval.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Tuition Moderation Queue
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Approve tutor batches to make them visible on the public tuition
            page, or reject inappropriate listings.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : tuitions.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                No tuition batches found.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-800">
                  <tr>
                    <th className="py-3 pr-4">Batch</th>
                    <th className="py-3 pr-4">Tutor</th>
                    <th className="py-3 pr-4">Subject / Level</th>
                    <th className="py-3 pr-4">Fee</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tuitions.map((t, idx) => {
                    const id = String(t._id || t.id || idx);
                    const statusLower = (
                      t.approvalStatus || "pending"
                    ).toLowerCase();

                    return (
                      <tr key={id}>
                        <td className="py-4 pr-4 font-semibold text-slate-900 dark:text-white">
                          {t.title}
                        </td>
                        <td className="py-4 pr-4 text-xs text-slate-600 dark:text-slate-300">
                          <div>{t.tutorName || "Tutor"}</div>
                          <div className="text-slate-400">{t.tutorEmail}</div>
                        </td>
                        <td className="py-4 pr-4 text-slate-600 dark:text-slate-300">
                          {t.subject} · {t.classLevel || "General"}
                        </td>
                        <td className="py-4 pr-4 font-medium text-slate-900 dark:text-white">
                          ৳{Number(t.monthlyFee || 0).toLocaleString()}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              statusLower === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : statusLower === "rejected"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {t.approvalStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              disabled={updatingId === id}
                              onClick={() => handleApproval(id, "approved")}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === id}
                              onClick={() => handleApproval(id, "rejected")}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
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
