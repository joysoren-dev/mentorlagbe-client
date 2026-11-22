"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

type UserRole = "student" | "tutor" | "admin";

interface AdminUserItem {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
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

  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-transparent py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Admin Dashboard</span>
        </Link>

        <div className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="border-b border-stone-200/80 pb-5 dark:border-slate-800">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Users &amp; Role Management
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">
              Inspect registered accounts and switch roles between student,
              tutor, and admin.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-amber-700 dark:text-blue-600" />
            </div>
          ) : users.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-[#faf7f2]/80 p-10 text-center dark:border-slate-700 dark:bg-slate-950/60">
              <p className="text-sm text-stone-600 dark:text-slate-400">
                No users found.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 text-xs uppercase text-stone-500 dark:border-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Plan</th>
                    <th className="py-3 pr-4">Current Role</th>
                    <th className="py-3 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                  {users.map((u, idx) => {
                    const id = String(u._id || u.id || idx);
                    const currentRole = (u.role || "student").toLowerCase();

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-[#faf7f2]/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-4 pr-4">
                          <div className="font-semibold text-stone-900 dark:text-white">
                            {u.name || "User"}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-slate-400">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-xs font-semibold uppercase text-stone-600 dark:text-slate-300">
                          {u.plan || "free"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex rounded-full bg-amber-100/90 px-2.5 py-1 text-xs font-semibold capitalize text-amber-900 dark:bg-blue-950 dark:text-blue-300">
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
                            className="rounded-lg border border-stone-300 bg-[#faf7f2] px-3 py-1.5 text-xs font-semibold text-stone-800 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
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
        </div>
      </div>
    </div>
  );
}
