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
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import {
  AutoList,
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

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

const CACHE_KEY = "mentorlagbe-featured-tuitions-v1";

function readCachedTuitions(): TuitionItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TuitionItem[]) : [];
  } catch {
    return [];
  }
}

function writeCachedTuitions(items: TuitionItem[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export default function FeaturedTuitions() {
  const [tuitions, setTuitions] = useState<TuitionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const cached = readCachedTuitions();
    const hadCache = cached.length > 0;

    if (hadCache) {
      setTuitions(cached);
      setLoading(false);
    }

    const loadFeatured = async () => {
      try {
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
        const approvedOnly = typedList
          .filter((item) => {
            if (item.isActive === false) return false;
            const st = item.approvalStatus || item.status;
            if (!st) return true;
            return (
              st.toLowerCase() === "approved" || st.toLowerCase() === "active"
            );
          })
          .slice(0, 6);

        if (isMounted) {
          setTuitions(approvedOnly);
          writeCachedTuitions(approvedOnly);
        }
      } catch {
        if (isMounted && !hadCache) {
          setTuitions([]);
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
    <section className="relative overflow-hidden border-t border-stone-200/80 bg-transparent py-16 dark:border-slate-800/80 sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl dark:bg-blue-600/15"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionSection className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
              Featured Listings
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              Popular Tuitions &amp;{" "}
              <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent dark:from-blue-400 dark:via-sky-300 dark:to-indigo-400">
                Mentorship Batches
              </span>
            </h2>
            <p className="text-sm text-stone-600 dark:text-slate-400 sm:text-base">
              Explore active batches across subjects, class levels, and online
              or local learning modes.
            </p>
          </div>

          <MotionButton className="self-start sm:self-auto">
            <Link
              href="/tuitions"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-[#fffdf9]/90 px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-2xs backdrop-blur-xs transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <span>View All Tuitions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MotionButton>
        </MotionSection>

        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-60 flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/90 p-6 dark:border-slate-800 dark:bg-slate-900/90"
              >
                <div className="space-y-3">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-stone-200 dark:bg-slate-800" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-stone-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200 dark:bg-slate-800" />
                </div>
                <div className="flex items-center justify-between border-t border-stone-200/70 pt-4 dark:border-slate-800">
                  <div className="h-6 w-24 animate-pulse rounded bg-stone-200 dark:bg-slate-800" />
                  <div className="h-9 w-28 animate-pulse rounded-lg bg-stone-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tuitions.length > 0 && (
          <AutoList className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((item, idx) => {
              const itemId = item._id || item.id || String(idx);
              const isOnline = item.mode?.toLowerCase() === "online";
              const scheduleText =
                item.schedule ||
                (item.daysPerWeek ? `${item.daysPerWeek} days/week` : "");

              return (
                <MotionCard
                  key={itemId}
                  index={idx}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/90 bg-gradient-to-b from-[#fffdf9] via-[#fffdf9] to-amber-50/40 p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-600/70 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/35 dark:hover:border-blue-500/70 dark:hover:shadow-blue-950/40"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/70 via-white/15 to-transparent dark:from-white/5 dark:to-transparent"
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-100/90 px-3 py-1 text-xs font-semibold text-amber-900 dark:border-blue-400/20 dark:bg-blue-950/80 dark:text-blue-300">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{item.subject}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isOnline
                            ? "bg-emerald-100/85 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : "bg-orange-100/90 text-orange-800 dark:bg-sky-950/70 dark:text-sky-300"
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

                    <h3 className="mt-4 line-clamp-2 text-lg font-bold tracking-tight text-stone-900 dark:text-white">
                      {item.title}
                    </h3>

                    <div className="mt-3 space-y-2 text-xs text-stone-600 dark:text-slate-400 sm:text-sm">
                      <p className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                        <span>Level: {item.classLevel || "General"}</span>
                      </p>
                      {scheduleText && (
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                          <span className="line-clamp-1">{scheduleText}</span>
                        </p>
                      )}
                      {!isOnline && item.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                          <span className="line-clamp-1">{item.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-slate-800">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                        Monthly Fee
                      </p>
                      <p className="text-lg font-extrabold tracking-tight text-stone-900 dark:text-white">
                        ৳{Number(item.monthlyFee || 0).toLocaleString()}
                      </p>
                    </div>

                    <MotionButton>
                      <Link
                        href={`/tuitions/${itemId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500 sm:text-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </MotionButton>
                  </div>
                </MotionCard>
              );
            })}
          </AutoList>
        )}

        {!loading && tuitions.length === 0 && (
          <MotionSection className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-[#fffdf9]/90 p-10 text-center dark:border-slate-700 dark:bg-slate-900/90">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800 dark:bg-blue-500/15 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-stone-900 dark:text-white">
              Featured Tuitions Will Appear Here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-slate-400">
              Approved tuition batches from verified tutors will show up
              automatically once published. You can still explore the tuitions
              directory or join as a tutor.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <MotionButton>
                <Link
                  href="/tuitions"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500"
                >
                  Browse Tuitions
                </Link>
              </MotionButton>
              <MotionButton>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-[#fffdf9] px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
                >
                  Become a Tutor
                </Link>
              </MotionButton>
            </div>
          </MotionSection>
        )}
      </div>
    </section>
  );
}
