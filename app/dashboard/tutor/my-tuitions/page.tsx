"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  Loader2,
  PlusCircle,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface TutorTuition {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel?: string;
  mode?: string;
  location?: string;
  monthlyFee?: number;
  daysPerWeek?: number;
  schedule?: string;
  description?: string;
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

  // Edit modal state
  const [editingItem, setEditingItem] = useState<TutorTuition | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editClassLevel, setEditClassLevel] = useState("");
  const [editMode, setEditMode] = useState("Online");
  const [editLocation, setEditLocation] = useState("");
  const [editFee, setEditFee] = useState("0");
  const [editSchedule, setEditSchedule] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  const openEditModal = (item: TutorTuition) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditSubject(item.subject || "");
    setEditClassLevel(item.classLevel || "");
    setEditMode(item.mode || "Online");
    setEditLocation(item.location || "");
    setEditFee(String(item.monthlyFee ?? 0));
    setEditSchedule(item.schedule || "");
    setEditDescription(item.description || "");
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const id = String(editingItem._id || editingItem.id || "");
    if (!id) return;

    try {
      setSavingEdit(true);
      const token = readToken();
      const payload = {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        classLevel: editClassLevel.trim(),
        mode: editMode,
        location:
          editMode === "Online" ? "Online Session" : editLocation.trim(),
        monthlyFee: Number(editFee) || 0,
        schedule: editSchedule.trim(),
        description: editDescription.trim(),
      };

      await apiRequest(`/api/tuitions/${id}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify(payload),
      });

      setTuitions((prev) =>
        prev.map((t) =>
          String(t._id || t.id) === id ? { ...t, ...payload } : t,
        ),
      );
      setEditingItem(null);
      toast.success("Tuition updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update tuition.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

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
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard/tutor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Tutor Dashboard</span>
          </Link>
          <MotionButton>
            <Link
              href="/dashboard/tutor/post-tuition"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500 sm:text-sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post New Tuition</span>
            </Link>
          </MotionButton>
        </MotionSection>

        <MotionCard
          index={0}
          className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900 sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
            Tutor Listings Management
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
            My{" "}
            <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
              Tuition Batches
            </span>
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-slate-300">
            Edit details, toggle Active or Closed status, or delete your posted
            tuitions.
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-400" />
            </div>
          ) : tuitions.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-stone-600 dark:text-slate-300">
                You haven&apos;t posted any tuition batches yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-600 dark:border-slate-800 dark:text-slate-300">
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
                        <td className="py-4 pr-4">
                          <div className="font-bold text-stone-900 dark:text-white">
                            {t.title}
                          </div>
                          <div className="mt-0.5 text-xs text-stone-500 dark:text-slate-400">
                            {t.mode || "Online"}
                            {t.schedule ? ` · ${t.schedule}` : ""}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-stone-700 dark:text-slate-200">
                          {t.subject} · {t.classLevel || "General"}
                        </td>
                        <td className="py-4 pr-4 font-bold text-stone-900 dark:text-white">
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
                                : "bg-stone-200/80 text-stone-700 hover:bg-stone-300/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            }`}
                          >
                            {isActive ? "Active" : "Closed"}
                          </button>
                        </td>
                        <td className="py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(t)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyId === id}
                              onClick={() => handleDelete(id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-900/60"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
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
        </MotionCard>

        {/* Edit Tuition Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl border border-stone-200 bg-[#fffdf9] p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-slate-800">
                <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">
                  Edit Tuition Listing
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Class Level
                    </label>
                    <input
                      type="text"
                      value={editClassLevel}
                      onChange={(e) => setEditClassLevel(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Monthly Fee (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Mode
                    </label>
                    <select
                      value={editMode}
                      onChange={(e) => setEditMode(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Schedule
                    </label>
                    <input
                      type="text"
                      value={editSchedule}
                      onChange={(e) => setEditSchedule(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                {editMode === "Offline" && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-200">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-[#faf7f2] p-3 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 dark:border-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingEdit ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
