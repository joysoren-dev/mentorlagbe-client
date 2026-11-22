"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface TutorTuition {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel?: string;
  mode?: string;
  monthlyFee?: number;
  approvalStatus?: string;
  isActive?: boolean;
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

export default function MyTuitionsPage() {
  const [tuitions, setTuitions] = useState<TutorTuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTuitions = async () => {
    try {
      setLoading(true);
      const token = readToken();
      const res = await apiRequest<unknown>("/api/tuitions/my-tuitions", {
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
      setTuitions(list as TutorTuition[]);
    } catch {
      setTuitions([]);
      toast.info("Could not load your tuitions right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTuitions();
  }, []);

  const handleToggleActive = async (id: string) => {
    try {
      setBusyId(id);
      const token = readToken();
      await apiRequest(`/api/tuitions/${id}/toggle`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTuitions((prev) =>
        prev.map((t) =>
          String(t._id || t.id) === id
            ? { ...t, isActive: t.isActive === false ? true : false }
            : t,
        ),
      );
      toast.success("Batch status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to toggle.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBusyId(id);
      const token = readToken();
      await apiRequest(`/api/tuitions/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTuitions((prev) => prev.filter((t) => String(t._id || t.id) !== id));
      toast.success("Tuition deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tutor Dashboard</span>
          </Link>
          <Link
            href="/dashboard/tutor/post-tuition"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500 sm:text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Post New Tuition</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
            My Tuition Batches
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-600" />
            </div>
          ) : tuitions.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2]/80 p-10 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-sm text-stone-600 dark:text-slate-400">
                You haven&apos;t posted any tuition batches yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">Batch</th>
                    <th className="py-3 pr-4">Subject / Level</th>
                    <th className="py-3 pr-4">Fee</th>
                    <th className="py-3 pr-4">Approval</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {tuitions.map((t, idx) => {
                    const id = String(t._id || t.id || idx);
                    const isActive = t.isActive !== false;
                    const approval = (
                      t.approvalStatus || "pending"
                    ).toLowerCase();

                    return (
                      <tr key={id}>
                        <td className="py-4 pr-4 font-semibold text-stone-900 dark:text-white">
                          {t.title}
                        </td>
                        <td className="py-4 pr-4 text-stone-600 dark:text-slate-300">
                          {t.subject} · {t.classLevel || "General"}
                        </td>
                        <td className="py-4 pr-4 font-medium text-stone-900 dark:text-white">
                          ৳{Number(t.monthlyFee || 0).toLocaleString()}
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              approval === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : approval === "rejected"
                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {t.approvalStatus || "pending"}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            disabled={busyId === id}
                            onClick={() => handleToggleActive(id)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              isActive
                                ? "bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-950"
                                : "bg-stone-200/80 text-stone-700 hover:bg-stone-300/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}
                          >
                            {isActive ? "Active" : "Closed"}
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            disabled={busyId === id}
                            onClick={() => handleDelete(id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
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
