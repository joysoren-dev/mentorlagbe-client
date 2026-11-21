"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  Crown,
  FileText,
  GraduationCap,
  HelpCircle,
  ImageIcon,
  LayoutDashboard,
  Mail,
  Phone,
  PlusCircle,
  Save,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface DashboardUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
  phone?: string;
  bio?: string;
  image?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function getStoredPayload(): {
  rawObj: Record<string, unknown>;
  user: DashboardUser;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    const candidateObj =
      "user" in record && record.user && typeof record.user === "object"
        ? (record.user as Record<string, unknown>)
        : record;

    const email =
      typeof candidateObj.email === "string" ? candidateObj.email : "";
    const name = typeof candidateObj.name === "string" ? candidateObj.name : "";
    const roleRaw =
      typeof candidateObj.role === "string" ? candidateObj.role : "";

    if (!email && !name && !roleRaw) return null;

    return {
      rawObj: record,
      user: {
        id:
          typeof candidateObj.id === "string"
            ? candidateObj.id
            : typeof candidateObj._id === "string"
              ? candidateObj._id
              : undefined,
        name: name || (email ? email.split("@")[0] : "User"),
        email,
        role: (roleRaw || "student").toLowerCase(),
        plan: (typeof candidateObj.plan === "string"
          ? candidateObj.plan
          : "free"
        ).toLowerCase(),
        phone: typeof candidateObj.phone === "string" ? candidateObj.phone : "",
        bio: typeof candidateObj.bio === "string" ? candidateObj.bio : "",
        image: typeof candidateObj.image === "string" ? candidateObj.image : "",
      },
    };
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const stored = getStoredPayload();
    if (!stored) {
      router.replace("/sign-in");
      return;
    }
    setUser(stored.user);
    setNameInput(stored.user.name || "");
    setEmailInput(stored.user.email || "");
    setPhoneInput(stored.user.phone || "");
    setBioInput(stored.user.bio || "");
    setImageInput(stored.user.image || "");
    setLoading(false);
  }, [router]);

  const hasUnsavedChanges = useMemo(() => {
    if (!user) return false;
    return (
      nameInput.trim() !== (user.name || "") ||
      emailInput.trim() !== (user.email || "") ||
      phoneInput.trim() !== (user.phone || "") ||
      bioInput.trim() !== (user.bio || "") ||
      imageInput.trim() !== (user.image || "")
    );
  }, [user, nameInput, emailInput, phoneInput, bioInput, imageInput]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageInput(reader.result);
        toast.info("Photo selected. Click 'Save Profile' to apply.");
      }
    };
    reader.onerror = () => {
      toast.error("Could not read the selected image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      toast.error("Please enter your name.");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSavingProfile(true);

      const updatedFields = {
        name: trimmedName,
        email: trimmedEmail,
        phone: phoneInput.trim(),
        bio: bioInput.trim(),
        image: imageInput.trim(),
      };

      try {
        await apiRequest("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify(updatedFields),
        });
      } catch {
        // Keep local profile state updated smoothly even if backend route is pending
      }

      const stored = getStoredPayload();
      const nextUser: DashboardUser = {
        ...user,
        ...updatedFields,
      };

      if (stored) {
        const hasNestedUser =
          "user" in stored.rawObj &&
          stored.rawObj.user &&
          typeof stored.rawObj.user === "object";

        const nextPayload = hasNestedUser
          ? {
              ...stored.rawObj,
              user: {
                ...(stored.rawObj.user as Record<string, unknown>),
                ...updatedFields,
              },
            }
          : {
              ...stored.rawObj,
              ...updatedFields,
            };

        localStorage.setItem("mentorlagbe-user", JSON.stringify(nextPayload));
      } else {
        localStorage.setItem(
          "mentorlagbe-user",
          JSON.stringify({ user: nextUser }),
        );
      }

      window.dispatchEvent(new Event("mentorlagbe-auth-change"));
      setUser(nextUser);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Could not update profile right now.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 py-14 dark:bg-[#070d19]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      </div>
    );
  }

  const role = user.role || "student";
  const planLabel = (user.plan || "free").toUpperCase();
  const initials = (user.name || "U").slice(0, 1).toUpperCase();

  const roleGuide =
    role === "tutor"
      ? {
          workspaceTitle: "Tutor Mentorship Workspace",
          whyHere:
            "You are here to create batches, manage student applicants, and grow enrollments.",
          doingNow:
            "Managing your tutor identity, batch workflow, and free/pro plan readiness.",
          nextStep:
            "Open Tutor Workspace, post a new batch, or review incoming student applicants.",
        }
      : role === "admin"
        ? {
            workspaceTitle: "Admin Moderation & Oversight Center",
            whyHere:
              "You are here to keep tuition listings accurate, review users, and maintain platform quality.",
            doingNow:
              "Overseeing role-based platform workflows, listings, and account integrity.",
            nextStep:
              "Verify tuition moderation queue, user roles, or review platform pricing tiers.",
          }
        : {
            workspaceTitle: "Student Learning Workspace",
            whyHere:
              "You are here to find verified mentors/batches, apply for free, and track your application status.",
            doingNow:
              "Viewing your student account, active application status, and learning path.",
            nextStep:
              "Open My Applications, browse active tuitions, or inspect free/mentor pricing.",
          };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-[#070d19] sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Orientation Banner */}
        <div className="rounded-2xl border border-slate-200 bg-[#06142e] p-6 text-white shadow-sm dark:border-slate-800 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Avatar in Top Banner */}
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-blue-400/50 bg-blue-600/20">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-300">
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{roleGuide.workspaceTitle}</span>
                  <span className="rounded bg-blue-500/25 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {role}
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, {user.name}
                </h1>

                <p className="max-w-2xl text-sm text-slate-300">
                  {roleGuide.whyHere}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300 sm:text-sm">
                  {user.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>{user.email}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-blue-400" />
                    <span>Account Tier: {planLabel}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {role === "tutor" && (
                <Link
                  href="/dashboard/tutor"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Tutor Workspace</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {role === "student" && (
                <Link
                  href="/dashboard/student/my-applications"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <FileText className="h-4 w-4" />
                  <span>My Applications</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-500"
              >
                <BookOpen className="h-4 w-4 text-blue-400" />
                <span>Browse Tuitions</span>
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-500"
              >
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <span>How It Works</span>
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-blue-500"
              >
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Pricing</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Clear Orientation Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Compass className="h-4 w-4" />
              <span>What You Are Doing Here</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {roleGuide.doingNow}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <ArrowRight className="h-4 w-4" />
              <span>What To Do Next</span>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              {roleGuide.nextStep}
            </p>
          </div>
        </div>

        {/* Role-Specific Action Cards */}
        {role === "student" && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Applied Batches
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Track applications you submit to tutors and check whether they
                are pending, accepted, or rejected.
              </p>
              <Link
                href="/dashboard/student/my-applications"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <span>Open My Applications</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                How Students Apply
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Browse approved tuition listings for free, check weekly days and
                monthly fee, and apply directly.
              </p>
              <Link
                href="/tuitions"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <span>Go to Browse Tuitions</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Tag className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Student Overview &amp; Pricing
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                View your student dashboard stats or inspect transparent plans
                anytime.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/student"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>Student Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>View Pricing</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {role === "tutor" && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                My Tuition Batches
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Create and manage batches with subject, class level, schedule,
                and monthly fee.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/tutor/my-tuitions"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>Manage Batches</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/tutor/post-tuition"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300"
                >
                  <span>+ Post New</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Incoming Applicants
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Review student requests on your batches and approve or reject
                applications.
              </p>
              <Link
                href="/dashboard/tutor/applicants"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                <span>Review Applicants</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Crown className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Tutor Overview &amp; Plan ({planLabel})
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Open your full tutor summary or compare Mentor Pro and Coaching
                plans.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard/tutor"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>Tutor Home</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>Pricing Plans</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {role === "admin" && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Tuition Moderation
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Approve or reject tutor batch listings so students only see
                verified posts.
              </p>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                Queue Ready
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Users &amp; Roles
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Inspect student, tutor, and admin accounts across the platform.
              </p>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                3 Roles
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                <Crown className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                Guides &amp; Pricing
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Review platform workflow guides and subscription plan tiers.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>How It Works</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  <span>Pricing Plans</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Role-Agnostic Update Profile Section (Student / Tutor / Admin) */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Update Profile ({role.toUpperCase()})
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Update your profile photo, display name, email address, contact
                number, and short bio for your {role} account.
              </p>
            </div>
            {hasUnsavedChanges && (
              <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Unsaved changes
              </span>
            )}
          </div>

          <form onSubmit={handleProfileSave} className="mt-6 space-y-6">
            {/* Profile Photo Picker + URL */}
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70 sm:flex-row sm:items-center">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900">
                {imageInput ? (
                  <img
                    src={imageInput}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400">
                    {(nameInput || "U").slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500">
                    <Camera className="h-3.5 w-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {imageInput && (
                    <button
                      type="button"
                      onClick={() => setImageInput("")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <ImageIcon className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Name, Email, Phone */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number (Optional)
                </label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g., +880 17XX-XXXXXX"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Short Bio / Learning or Teaching Note
              </label>
              <textarea
                rows={3}
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder={
                  role === "tutor"
                    ? "Share your subjects, teaching experience, or batch focus..."
                    : role === "admin"
                      ? "Moderator notes or responsibility summary..."
                      : "Share your class/exam goals or preferred subjects..."
                }
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
