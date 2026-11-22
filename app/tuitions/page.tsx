"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Filter,
  GraduationCap,
  Laptop,
  MapPin,
  RotateCcw,
  Search,
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
  tutorName?: string;
  status?: string;
  approvalStatus?: string;
  isActive?: boolean;
}

function TuitionsCatalogContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") || "";

  const [tuitions, setTuitions] = useState<TuitionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let isMounted = true;

    const fetchTuitions = async () => {
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
          setTuitions(approvedOnly);
        }
      } catch {
        if (isMounted) {
          setTuitions([]);
          toast.info("Could not fetch live tuition listings right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTuitions();
    return () => {
      isMounted = false;
    };
  }, []);

  const subjects = useMemo(() => {
    const unique = new Set<string>();
    tuitions.forEach((t) => {
      if (t.subject?.trim()) unique.add(t.subject.trim());
    });
    return ["All", ...Array.from(unique)];
  }, [tuitions]);

  const filteredTuitions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = tuitions.filter((item) => {
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.classLevel?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);

      const matchesSubject =
        selectedSubject === "All" ||
        item.subject?.toLowerCase() === selectedSubject.toLowerCase();

      const matchesMode =
        selectedMode === "All" ||
        item.mode?.toLowerCase() === selectedMode.toLowerCase();

      return matchesSearch && matchesSubject && matchesMode;
    });

    if (sortOrder === "fee-asc") {
      return [...list].sort(
        (a, b) => Number(a.monthlyFee || 0) - Number(b.monthlyFee || 0),
      );
    }
    if (sortOrder === "fee-desc") {
      return [...list].sort(
        (a, b) => Number(b.monthlyFee || 0) - Number(a.monthlyFee || 0),
      );
    }

    return list;
  }, [tuitions, searchQuery, selectedSubject, selectedMode, sortOrder]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSubject("All");
    setSelectedMode("All");
    setSortOrder("default");
    toast.success("Filters cleared.");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSubject !== "All" ||
    selectedMode !== "All" ||
    sortOrder !== "default";

  return (
    <div className="min-h-screen bg-transparent">
      {/* Page Header Banner */}
      <section className="bg-[#16120e] py-12 text-white dark:bg-[#06142e] sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300 dark:text-blue-400">
            Mentorship Directory
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
            Browse Active Tuitions &amp; Batches
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-300 dark:text-slate-300 sm:text-base">
            Filter verified mentorship batches by subject, class level, online
            or local mode, and monthly fee.
          </p>
        </div>
      </section>

      {/* Filter Controls & Results */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-4 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/90 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Search Box */}
            <div className="relative md:col-span-5">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, subject, class, or location..."
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-4 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-500"
              />
            </div>

            {/* Subject Filter */}
            <div className="md:col-span-3">
              <select
                aria-label="Filter by subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === "All" ? "All Subjects" : sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Filter */}
            <div className="md:col-span-2">
              <select
                aria-label="Filter by study mode"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              >
                <option value="All">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>

            {/* Sort By Fee */}
            <div className="md:col-span-2">
              <select
                aria-label="Sort by monthly fee"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
              >
                <option value="default">Sort: Latest</option>
                <option value="fee-asc">Fee: Low to High</option>
                <option value="fee-desc">Fee: High to Low</option>
              </select>
            </div>
          </div>

          {/* Count & Reset Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-3 text-xs text-stone-600 dark:border-slate-800 dark:text-slate-400 sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Filter className="h-3.5 w-3.5 text-amber-700 dark:text-blue-400" />
              <span>
                Showing {filteredTuitions.length}{" "}
                {filteredTuitions.length === 1 ? "listing" : "listings"}
              </span>
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 font-semibold text-amber-800 transition hover:text-amber-900 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex h-64 flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/90 p-6 dark:border-slate-800 dark:bg-slate-900/90"
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

        {/* Tuitions Grid */}
        {!loading && filteredTuitions.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTuitions.map((item, idx) => {
              const itemId = item._id || item.id || String(idx);
              const isOnline = item.mode?.toLowerCase() === "online";
              const scheduleText =
                item.schedule ||
                (item.daysPerWeek ? `${item.daysPerWeek} days/week` : "");

              return (
                <article
                  key={itemId}
                  className="flex h-full flex-col justify-between rounded-2xl border border-stone-200/90 bg-[#fffdf9]/92 p-6 shadow-xs backdrop-blur-xs transition hover:-translate-y-0.5 hover:border-amber-600/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-blue-950/80 dark:text-blue-300">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{item.subject}</span>
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isOnline
                            ? "bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : "bg-orange-100/85 text-orange-800 dark:bg-sky-950/70 dark:text-sky-300"
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

                    <h2 className="mt-4 line-clamp-2 text-lg font-bold text-stone-900 dark:text-white">
                      {item.title}
                    </h2>

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

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-4 dark:border-slate-800">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-slate-400">
                        Monthly Fee
                      </p>
                      <p className="text-base font-bold text-stone-900 dark:text-white">
                        ৳{Number(item.monthlyFee || 0).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/tuitions/${itemId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500 sm:text-sm"
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

        {/* Empty State */}
        {!loading && filteredTuitions.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-[#fffdf9]/90 p-12 text-center dark:border-slate-700 dark:bg-slate-900/90">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">
              {hasActiveFilters
                ? "No Matching Tuitions Found"
                : "No Published Tuitions Available Yet"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600 dark:text-slate-400">
              {hasActiveFilters
                ? "Try adjusting your search keywords, subject, or study mode filters."
                : "Approved tuition listings from verified tutors will appear here once published."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Clear All Filters
                </button>
              ) : (
                <Link
                  href="/sign-up"
                  className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Join as a Tutor
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function TuitionsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-stone-500 dark:text-slate-400">
          Loading tuition directory...
        </div>
      }
    >
      <TuitionsCatalogContent />
    </Suspense>
  );
}
