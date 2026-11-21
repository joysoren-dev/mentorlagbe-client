"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  Laptop,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface TuitionItem {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline" | string;
  location?: string;
  monthlyFee: number;
  schedule?: string;
  daysPerWeek?: number;
  status?: string;
  approvalStatus?: string;
  isActive?: boolean;
}

export default function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<TuitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      try {
        setLoading(true);
        const payload = await apiRequest<unknown>("/api/tuitions");
        const dataObj =
          payload && typeof payload === "object"
            ? (payload as { tuitions?: unknown; data?: unknown })
            : null;

        const rawList = Array.isArray(payload)
          ? payload
          : Array.isArray(dataObj?.tuitions)
            ? dataObj.tuitions
            : Array.isArray(dataObj?.data)
              ? dataObj.data
              : [];

        const typedList = rawList as TuitionItem[];
        const approvedOnly = typedList.filter((item) => {
          if (item.isActive === false) return false;
          const st = item.approvalStatus || item.status;
          if (!st) return true;
          return (
            st.toLowerCase() === "approved" || st.toLowerCase() === "active"
          );
        });

        if (isMounted) {
          setTuitions(approvedOnly.slice(0, 6));
        }
      } catch {
        if (isMounted) {
          setTuitions([]);
          toast.info(
            "Unable to load live tuitions right now. Showing available options.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-[#070d19] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Featured Listings
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Popular Tuitions &amp; Mentorship Batches
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Explore active batches across subjects, class levels, and online
              or local learning modes.
            </p>
          </div>

          <Link
            href="/tuitions"
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400 sm:self-auto"
          >
            <span>View All Tuitions</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-60 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="space-y-3">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tuitions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((item, idx) => {
              const itemId = item._id || item.id || String(idx);
              const isOnline = item.mode?.toLowerCase() === "online";
              const scheduleText =
                item.schedule ||
                (item.daysPerWeek ? `${item.daysPerWeek} days/week` : "");

              return (
                <article
                  key={itemId}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{item.subject}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isOnline
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {isOnline ? (
                          <Laptop className="h-3 w-3" />
                        ) : (
                          <MapPin className="h-3 w-3" />
                        )}
                        <span>{item.mode || "Online"}</span>
                      </span>
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                      <p className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>Level: {item.classLevel || "General"}</span>
                      </p>
                      {scheduleText && (
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="line-clamp-1">{scheduleText}</span>
                        </p>
                      )}
                      {!isOnline && item.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          <span className="line-clamp-1">{item.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Monthly Fee
                      </p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        ৳{Number(item.monthlyFee || 0).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/tuitions/${itemId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
                    >
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && tuitions.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Featured Tuitions Will Appear Here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Approved tuition batches from verified tutors will show up
              automatically once published. You can still explore the tuitions
              directory or join as a tutor.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tuitions"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Tuitions
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Become a Tutor
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
