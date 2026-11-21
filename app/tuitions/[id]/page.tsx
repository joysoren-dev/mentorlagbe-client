"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Laptop,
  MapPin,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface TuitionDetail {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: "Online" | "Offline" | string;
  location?: string;
  monthlyFee: number;
  daysPerWeek?: number;
  schedule?: string;
  description?: string;
  tutorName?: string;
  tutorEmail?: string;
  approvalStatus?: string;
  isActive?: boolean;
}

export default function TuitionDetailsPage() {
  const params = useParams<{ id: string }>();
  const tuitionId = params?.id;

  const [tuition, setTuition] = useState<TuitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!tuitionId) return;
    let isMounted = true;

    const loadTuitionDetail = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const payload = await apiRequest<unknown>(`/api/tuitions/${tuitionId}`);
        const obj =
          payload && typeof payload === "object"
            ? (payload as { tuition?: unknown; data?: unknown })
            : null;

        const candidate =
          obj?.tuition && typeof obj.tuition === "object"
            ? obj.tuition
            : obj?.data && typeof obj.data === "object"
              ? obj.data
              : payload;

        if (
          candidate &&
          typeof candidate === "object" &&
          ("title" in candidate || "subject" in candidate)
        ) {
          if (isMounted) {
            setTuition(candidate as TuitionDetail);
          }
          return;
        }

        // Fallback: jodi single id endpoint na thake, tahole list theke id match kore nebe
        const listPayload = await apiRequest<unknown>("/api/tuitions");
        const listObj =
          listPayload && typeof listPayload === "object"
            ? (listPayload as { tuitions?: unknown; data?: unknown })
            : null;

        const rawList = Array.isArray(listPayload)
          ? listPayload
          : Array.isArray(listObj?.tuitions)
            ? listObj.tuitions
            : Array.isArray(listObj?.data)
              ? listObj.data
              : [];

        const matched = (rawList as TuitionDetail[]).find(
          (item) => String(item._id || item.id) === String(tuitionId),
        );

        if (isMounted) {
          if (matched) {
            setTuition(matched);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (isMounted) {
          setNotFound(true);
          toast.info("Could not load tuition details right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTuitionDetail();
    return () => {
      isMounted = false;
    };
  }, [tuitionId]);

  const isOnline = tuition?.mode?.toLowerCase() === "online";
  const scheduleText =
    tuition?.schedule ||
    (tuition?.daysPerWeek ? `${tuition.daysPerWeek} days/week` : "Flexible");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19]">
      {/* Top Dark Header */}
      <section className="bg-[#06142e] py-10 text-white sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tuitions"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Tuitions</span>
          </Link>

          {!loading && tuition && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{tuition.subject}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {isOnline ? (
                    <Laptop className="h-3.5 w-3.5" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  <span>{tuition.mode || "Online"}</span>
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                {tuition.title}
              </h1>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-4">
              <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        )}

        {!loading && (notFound || !tuition) && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Tuition Batch Not Found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              This batch may have been removed or the link is invalid. Explore
              other active tuitions from the directory.
            </p>
            <div className="mt-6">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Browse Tuitions</span>
              </Link>
            </div>
          </div>
        )}

        {!loading && tuition && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Overview & Description */}
            <div className="space-y-6 lg:col-span-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Batch Overview
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  {tuition.description?.trim() ||
                    "Structured mentorship sessions focused on concept clarity, regular practice, and consistent academic progress."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Class Level
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tuition.classLevel || "General"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Weekly Schedule
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {scheduleText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Location / Mode
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {isOnline
                          ? "Online Session"
                          : tuition.location || "Local Batch"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <UserCheck className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Mentor
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {tuition.tutorName || "Verified Mentor"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Fee & Enrollment Card */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Monthly Fee
                </p>
                <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                  ৳{Number(tuition.monthlyFee || 0).toLocaleString()}
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Active &amp; Open for Inquiries</span>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/sign-in"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Sign In to Apply
                  </Link>
                  <Link
                    href="/tuitions"
                    className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Explore More Batches
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
