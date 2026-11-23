"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Receipt,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface PaymentItem {
  id: string;
  userEmail: string;
  userName: string;
  userRole: string;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentStatus: string;
  paidAt: string;
}

interface PaymentsResponse {
  success?: boolean;
  count?: number;
  totalRevenue?: number;
  payments?: PaymentItem[];
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.token === "string") return parsed.token;
    if (typeof parsed.accessToken === "string") return parsed.accessToken;
    return null;
  } catch {
    return null;
  }
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "tutor">(
    "all",
  );

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = readToken();
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const res = await apiRequest<PaymentsResponse>("/api/payments", {
          headers,
        });

        const list = Array.isArray(res?.payments) ? res.payments : [];
        setPayments(list);
        setTotalAmount(
          typeof res?.totalRevenue === "number"
            ? res.totalRevenue
            : list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load subscription records.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesRole =
        roleFilter === "all" ||
        (item.userRole || "").toLowerCase() === roleFilter;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesRole;

      return (
        matchesRole &&
        ((item.userName || "").toLowerCase().includes(q) ||
          (item.userEmail || "").toLowerCase().includes(q) ||
          (item.planName || "").toLowerCase().includes(q) ||
          (item.transactionId || "").toLowerCase().includes(q))
      );
    });
  }, [payments, roleFilter, searchQuery]);

  const upgradedUsersCount = useMemo(() => {
    return new Set(
      payments
        .filter((p) => (p.paymentStatus || "").toLowerCase() === "paid")
        .map((p) => p.userEmail?.toLowerCase()),
    ).size;
  }, [payments]);

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="flex flex-col justify-between gap-4 rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-700/80 dark:bg-[#06142e] sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-300 dark:text-blue-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Subscription &amp; Tier Records</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Subscription{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 bg-clip-text text-transparent dark:from-blue-300 dark:via-sky-200 dark:to-indigo-300">
                Records &amp; Tiers
              </span>
            </h1>
            <p className="mt-1 text-sm text-stone-200 dark:text-slate-200">
              Verify plan upgrades, transaction IDs, and test/sandbox checkout
              records across roles.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-[#261e16] px-4 py-2.5 text-sm font-semibold text-white transition hover:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-400"
          >
            <ArrowLeft className="h-4 w-4 text-amber-300 dark:text-blue-400" />
            <span>Back to Admin Center</span>
          </Link>
        </MotionSection>

        {/* Summary Cards */}
        <AutoList className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MotionCard
            index={0}
            className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-emerald-50/35 p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:from-slate-900 dark:to-emerald-950/30"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Recorded Volume
              </span>
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-emerald-300 dark:to-teal-300">
              {loading ? "..." : `$${totalAmount.toFixed(2)}`}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Includes test &amp; sandbox checkouts
            </p>
          </MotionCard>

          <MotionCard
            index={1}
            className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:from-slate-900 dark:to-blue-950/40"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Records
              </span>
              <Receipt className="h-4 w-4 text-amber-700 dark:text-blue-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-3xl font-extrabold text-transparent dark:from-blue-300 dark:to-sky-300">
              {loading ? "..." : payments.length}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Logged checkout entries
            </p>
          </MotionCard>

          <MotionCard
            index={2}
            className="rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] to-amber-50/45 p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:from-slate-900 dark:to-indigo-950/35"
          >
            <div className="flex items-center justify-between text-stone-600 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider">
                Upgraded Accounts
              </span>
              <Users className="h-4 w-4 text-amber-700 dark:text-indigo-400" />
            </div>
            <p className="mt-3 bg-gradient-to-r from-stone-900 via-amber-900 to-stone-800 bg-clip-text text-3xl font-extrabold text-transparent dark:from-white dark:via-blue-200 dark:to-sky-300">
              {loading ? "..." : upgradedUsersCount}
            </p>
            <p className="mt-1 text-xs text-stone-600 dark:text-slate-300">
              Paid / active tier updates
            </p>
          </MotionCard>
        </AutoList>

        {/* Filters & Table */}
        <MotionCard
          index={0}
          className="mt-6 rounded-2xl border border-stone-200/90 bg-[#fffdf9] p-6 shadow-xs backdrop-blur-xs dark:border-slate-700/80 dark:bg-slate-900"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, plan, or Txn ID..."
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2 pr-3 pl-9 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-amber-700 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:bg-slate-900"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["all", "student", "tutor"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    roleFilter === role
                      ? "bg-amber-700 text-white dark:bg-blue-600 dark:text-white"
                      : "bg-stone-200/80 text-stone-700 hover:bg-stone-300/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs font-semibold uppercase text-stone-600 dark:border-slate-800 dark:text-slate-300">
                  <th className="py-3 pr-4">User</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Plan</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Transaction ID</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-stone-500 dark:text-slate-400"
                    >
                      Loading subscription records...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-stone-500 dark:text-slate-400"
                    >
                      No subscription records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition-colors hover:bg-[#faf7f2] dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-stone-900 dark:text-white">
                          {payment.userName}
                        </p>
                        <p className="text-xs text-stone-600 dark:text-slate-300">
                          {payment.userEmail}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 capitalize">
                        <span className="rounded-md bg-stone-200/80 px-2 py-0.5 text-xs font-medium text-stone-800 dark:bg-slate-800 dark:text-slate-200">
                          {payment.userRole}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-stone-800 dark:text-slate-100">
                        {payment.planName}
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-emerald-700 dark:text-emerald-400">
                        ${Number(payment.amount).toFixed(2)}{" "}
                        <span className="text-xs uppercase">
                          {payment.currency}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-stone-600 dark:text-slate-300">
                        {payment.transactionId}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CreditCard className="h-3 w-3" />
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-stone-600 dark:text-slate-300">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </MotionCard>
      </div>
    </div>
  );
}
