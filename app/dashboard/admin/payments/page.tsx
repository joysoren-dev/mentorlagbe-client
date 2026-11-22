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

interface PaymentItem {
  id: string;
  userEmail: string;
  userName: string;
  userRole: string;
  planName: string;
  amount: number;
  currency: string;
  transactionId: string;
  stripeSessionId: string;
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
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
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
        setTotalRevenue(
          typeof res?.totalRevenue === "number"
            ? res.totalRevenue
            : list.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payment transactions.",
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

  const proSubscribersCount = useMemo(() => {
    return new Set(
      payments
        .filter((p) => (p.paymentStatus || "").toLowerCase() === "paid")
        .map((p) => p.userEmail?.toLowerCase()),
    ).size;
  }, [payments]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-[#06142e] p-6 text-white sm:flex-row sm:items-center sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400">
              <Shield className="h-3.5 w-3.5" />
              <span>Admin Revenue & Transactions</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Payment History & Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Monitor all Stripe Pro plan upgrades, transaction IDs, and
              platform revenue.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-blue-500"
          >
            <ArrowLeft className="h-4 w-4 text-blue-400" />
            <span>Back to Admin Center</span>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Total Revenue
              </span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : `$${totalRevenue.toFixed(2)}`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Total Transactions
              </span>
              <Receipt className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase">
                Pro Subscribers
              </span>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : proSubscribersCount}
            </p>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, plan, or Txn ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800">
                  <th className="py-3 pr-4">User</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Plan</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Transaction ID</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Loading payment transactions...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {payment.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {payment.userEmail}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 capitalize">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {payment.userRole}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-slate-800 dark:text-slate-200">
                        {payment.planName}
                      </td>
                      <td className="py-3.5 pr-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${Number(payment.amount).toFixed(2)}{" "}
                        <span className="text-xs uppercase">
                          {payment.currency}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {payment.transactionId}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CreditCard className="h-3 w-3" />
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-slate-500">
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
        </div>
      </div>
    </div>
  );
}
