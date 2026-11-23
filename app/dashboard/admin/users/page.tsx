"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { MotionCard, MotionSection } from "@/components/MotionPrimitives";

type UserRole = "student" | "tutor" | "admin";

interface AdminUserItem {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  classLevel?: string;
  expertSubjects?: string;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleTab, setRoleTab] = useState<"all" | "student" | "tutor" | "admin">(
    "all",
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const paramRole = new URLSearchParams(window.location.search).get("role");
      if (
        paramRole === "student" ||
        paramRole === "tutor" ||
        paramRole === "admin"
      ) {
        setRoleTab(paramRole);
      }
    }

    const loadUsers = async () => {
      try {
        setLoading(true);
        const token = readToken();
        const res = await apiRequest<unknown>("/api/users", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const obj =
          res && typeof res === "object"
            ? (res as { users?: unknown; data?: unknown })
            : null;
        const list = Array.isArray(res)
          ? res
          : Array.isArray(obj?.users)
            ? obj.users
            : Array.isArray(obj?.data)
              ? obj.data
              : [];
        setUsers(list as AdminUserItem[]);
      } catch {
        setUsers([]);
        toast.info("Could not load users list.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      setUpdatingId(id);
      const token = readToken();
      await apiRequest(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({ role }),
      });
      setUsers((prev) =>
        prev.map((u) => (String(u._id || u.id) === id ? { ...u, role } : u)),
      );
      toast.success(`Role updated to ${role}!`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update role.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const r = (u.role || "student").toLowerCase();
      if (roleTab !== "all" && r !== roleTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        r.includes(q)
      );
    });
  }, [users, roleTab, search]);

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="mb-6">
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Admin Dashboard</span>
          </Link>
        </MotionSection>

        <MotionCard
          index={0}
          className="rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs sm:p-8 dark:border-slate-700/80 dark:bg-slate-900"
        >
          <div className="border-b border-stone-200/80 pb-5 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Student &amp; Tutor Directory
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 dark:text-white">
              Users &amp;{" "}
              <span className="bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-sky-300">
                Role Management
              </span>
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-slate-300">
              Track students and tutors separately, inspect plans, and switch
              roles between student, tutor, and admin.
            </p>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-1.5">
              {(["all", "student", "tutor", "admin"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    roleTab === tab
                      ? "bg-amber-700 text-white dark:bg-blue-600 dark:text-white"
                      : "bg-[#faf7f2] text-stone-700 hover:text-stone-900 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {tab === "all" ? `All (${users.length})` : `${tab}s`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2 pr-3 pl-9 text-xs text-stone-900 placeholder-stone-400 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2] p-10 text-center dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm text-stone-600 dark:text-slate-300">
                No users found.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-600 dark:border-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Plan</th>
                    <th className="py-3 pr-4">Current Role</th>
                    <th className="py-3 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {filteredUsers.map((u, idx) => {
                    const id = String(u._id || u.id || idx);
                    const currentRole = (u.role || "student").toLowerCase();

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-[#faf7f2] dark:hover:bg-slate-800/40"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-bold text-stone-900 dark:text-white">
                            {u.name || "User"}
                          </div>
                          <div className="text-xs text-stone-600 dark:text-slate-300">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-xs font-bold uppercase text-amber-800 dark:text-blue-300">
                          {u.plan || "free"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-semibold capitalize text-amber-900 dark:bg-blue-950 dark:text-blue-200">
                            {currentRole}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <select
                            aria-label={`Change role for ${u.name || u.email || "user"}`}
                            disabled={updatingId === id}
                            value={currentRole}
                            onChange={(e) =>
                              handleRoleChange(id, e.target.value as UserRole)
                            }
                            className="rounded-lg border border-stone-300 bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-stone-800 transition focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:bg-slate-900"
                          >
                            <option value="student">student</option>
                            <option value="tutor">tutor</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </MotionCard>
      </div>
    </div>
  );
}
