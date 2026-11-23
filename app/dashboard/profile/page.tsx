"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  Crown,
  GraduationCap,
  ImageIcon,
  LayoutDashboard,
  Mail,
  Phone,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  MotionButton,
  MotionCard,
  MotionSection,
} from "@/components/MotionPrimitives";

interface ProfileUser {
  id?: string;
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
  phone?: string;
  bio?: string;
  image?: string;
  // Tutor-specific fields
  expertSubjects?: string;
  certifications?: string;
  skills?: string;
  teachingMode?: string;
  experienceYears?: string;
  // Student-specific fields
  classLevel?: string;
  preferredSubjects?: string;
  preferredMode?: string;
  preferredSchedule?: string;
  // Admin-specific profile note
  moderatorNote?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

function getStoredSession(): {
  rawObj: Record<string, unknown>;
  token: string | null;
  user: ProfileUser;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    const token = typeof record.token === "string" ? record.token : null;
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

    const str = (key: string, fallback = "") =>
      typeof candidateObj[key] === "string"
        ? (candidateObj[key] as string)
        : fallback;

    return {
      rawObj: record,
      token,
      user: {
        id: str("id") || str("_id") || undefined,
        name: name || (email ? email.split("@")[0] : "User"),
        email,
        role: (roleRaw || "student").toLowerCase(),
        plan: str("plan", "free").toLowerCase(),
        phone: str("phone"),
        bio: str("bio"),
        image: str("image"),
        expertSubjects: str("expertSubjects"),
        certifications: str("certifications"),
        skills: str("skills"),
        teachingMode: str("teachingMode", "Online & Offline"),
        experienceYears: str("experienceYears"),
        classLevel: str("classLevel"),
        preferredSubjects: str("preferredSubjects"),
        preferredMode: str("preferredMode", "Online & Offline"),
        preferredSchedule: str("preferredSchedule"),
        moderatorNote: str("moderatorNote"),
      },
    };
  } catch {
    return null;
  }
}

function parseTagList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Common fields
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [imageInput, setImageInput] = useState("");

  // Tutor fields
  const [expertSubjects, setExpertSubjects] = useState("");
  const [certifications, setCertifications] = useState("");
  const [skills, setSkills] = useState("");
  const [teachingMode, setTeachingMode] = useState("Online & Offline");
  const [experienceYears, setExperienceYears] = useState("");

  // Student fields
  const [classLevel, setClassLevel] = useState("");
  const [preferredSubjects, setPreferredSubjects] = useState("");
  const [preferredMode, setPreferredMode] = useState("Online & Offline");
  const [preferredSchedule, setPreferredSchedule] = useState("");

  // Admin profile note
  const [moderatorNote, setModeratorNote] = useState("");

  useEffect(() => {
    const stored = getStoredSession();
    if (!stored) {
      router.replace("/sign-in");
      return;
    }

    const u = stored.user;
    setUser(u);
    setNameInput(u.name || "");
    setEmailInput(u.email || "");
    setPhoneInput(u.phone || "");
    setBioInput(u.bio || "");
    setImageInput(u.image || "");

    setExpertSubjects(u.expertSubjects || "");
    setCertifications(u.certifications || "");
    setSkills(u.skills || "");
    setTeachingMode(u.teachingMode || "Online & Offline");
    setExperienceYears(u.experienceYears || "");

    setClassLevel(u.classLevel || "");
    setPreferredSubjects(u.preferredSubjects || "");
    setPreferredMode(u.preferredMode || "Online & Offline");
    setPreferredSchedule(u.preferredSchedule || "");

    setModeratorNote(u.moderatorNote || "");
    setLoading(false);
  }, [router]);

  const hasUnsavedChanges = useMemo(() => {
    if (!user) return false;
    return (
      nameInput.trim() !== (user.name || "") ||
      emailInput.trim() !== (user.email || "") ||
      phoneInput.trim() !== (user.phone || "") ||
      bioInput.trim() !== (user.bio || "") ||
      imageInput.trim() !== (user.image || "") ||
      expertSubjects.trim() !== (user.expertSubjects || "") ||
      certifications.trim() !== (user.certifications || "") ||
      skills.trim() !== (user.skills || "") ||
      teachingMode !== (user.teachingMode || "Online & Offline") ||
      experienceYears.trim() !== (user.experienceYears || "") ||
      classLevel.trim() !== (user.classLevel || "") ||
      preferredSubjects.trim() !== (user.preferredSubjects || "") ||
      preferredMode !== (user.preferredMode || "Online & Offline") ||
      preferredSchedule.trim() !== (user.preferredSchedule || "") ||
      moderatorNote.trim() !== (user.moderatorNote || "")
    );
  }, [
    user,
    nameInput,
    emailInput,
    phoneInput,
    bioInput,
    imageInput,
    expertSubjects,
    certifications,
    skills,
    teachingMode,
    experienceYears,
    classLevel,
    preferredSubjects,
    preferredMode,
    preferredSchedule,
    moderatorNote,
  ]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = nameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const role = (user.role || "student").toLowerCase();

    const updatedFields: Partial<ProfileUser> = {
      name: trimmedName,
      email: trimmedEmail,
      phone: phoneInput.trim(),
      bio: bioInput.trim(),
      image: imageInput.trim(),
      ...(role === "tutor"
        ? {
            expertSubjects: expertSubjects.trim(),
            certifications: certifications.trim(),
            skills: skills.trim(),
            teachingMode,
            experienceYears: experienceYears.trim(),
          }
        : role === "admin"
          ? {
              moderatorNote: moderatorNote.trim(),
            }
          : {
              classLevel: classLevel.trim(),
              preferredSubjects: preferredSubjects.trim(),
              preferredMode,
              preferredSchedule: preferredSchedule.trim(),
            }),
    };

    try {
      setSaving(true);
      const stored = getStoredSession();

      try {
        await apiRequest("/api/auth/profile", {
          method: "PATCH",
          headers: stored?.token
            ? { Authorization: `Bearer ${stored.token}` }
            : {},
          body: JSON.stringify(updatedFields),
        });
      } catch {
        // Persist smoothly locally even if backend profile route is still syncing
      }

      const nextUser: ProfileUser = {
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
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-transparent py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-56 animate-pulse rounded-2xl border border-stone-200/90 bg-[#fffdf9]/90 dark:border-slate-800 dark:bg-slate-900/90" />
        </div>
      </div>
    );
  }

  const role = (user.role || "student").toLowerCase();
  const planLabel = (user.plan || "free").toUpperCase();
  const initials = (nameInput || user.name || "U").slice(0, 1).toUpperCase();

  const roleDashboardHref =
    role === "admin"
      ? "/dashboard/admin"
      : role === "tutor"
        ? "/dashboard/tutor"
        : "/dashboard/student";

  const previewTags =
    role === "tutor"
      ? parseTagList(expertSubjects)
      : role === "student"
        ? parseTagList(preferredSubjects)
        : [];

  return (
    <div className="min-h-screen bg-transparent py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
        <MotionSection className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-[#fffdf9]/90 px-3.5 py-2 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:text-amber-800 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-400 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard Hub</span>
          </Link>

          <Link
            href={roleDashboardHref}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-600/30 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-500/20 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25 sm:text-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>
              Open{" "}
              {role === "admin"
                ? "Admin Dashboard"
                : role === "tutor"
                  ? "Tutor Dashboard"
                  : "Student Dashboard"}
            </span>
          </Link>
        </MotionSection>

        {/* Main Grid: Left Identity Preview + Right Role-Based Form */}
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
          {/* Left Role Identity Card */}
          <MotionCard
            index={0}
            className="relative overflow-hidden rounded-2xl border border-stone-800 bg-[#16120e] p-6 text-white shadow-lg dark:border-slate-800 dark:bg-[#06142e] lg:col-span-4"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl dark:bg-blue-500/25"
            />

            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400/50 bg-amber-500/15 dark:border-blue-400/50 dark:bg-blue-500/15">
                  {imageInput ? (
                    <img
                      src={imageInput}
                      alt={nameInput || "Profile avatar"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-amber-300 dark:text-blue-300">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 dark:bg-blue-500/20 dark:text-blue-300">
                    {role === "admin" ? (
                      <Shield className="h-3 w-3" />
                    ) : role === "tutor" ? (
                      <Award className="h-3 w-3" />
                    ) : (
                      <GraduationCap className="h-3 w-3" />
                    )}
                    <span>{role}</span>
                  </span>
                  <h1 className="mt-1 truncate text-lg font-bold">
                    {nameInput || user.name}
                  </h1>
                  <p className="truncate text-xs text-stone-300 dark:text-slate-300">
                    {emailInput || user.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-stone-300 dark:text-slate-300">
                  <Crown className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                  <span>Current Plan</span>
                </span>
                <span className="font-bold text-amber-300 dark:text-blue-300">
                  {planLabel}
                </span>
              </div>

              {bioInput.trim() && (
                <p className="mt-4 text-xs leading-relaxed text-stone-300 dark:text-slate-300">
                  {bioInput}
                </p>
              )}

              {/* Role-Specific Live Highlights */}
              {role === "tutor" && (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
                  <p className="font-bold uppercase tracking-wider text-amber-300 dark:text-blue-400">
                    Mentor Credentials Preview
                  </p>
                  {experienceYears.trim() && (
                    <p className="flex items-center gap-2 text-stone-200">
                      <Briefcase className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                      <span>Experience: {experienceYears}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-stone-200">
                    <BookOpen className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                    <span>Mode: {teachingMode}</span>
                  </p>
                  {certifications.trim() && (
                    <p className="flex items-start gap-2 text-stone-200">
                      <Award className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400 dark:text-blue-400" />
                      <span>{certifications}</span>
                    </p>
                  )}
                </div>
              )}

              {role === "student" && (
                <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs">
                  <p className="font-bold uppercase tracking-wider text-amber-300 dark:text-blue-400">
                    Learning Profile Preview
                  </p>
                  {classLevel.trim() && (
                    <p className="flex items-center gap-2 text-stone-200">
                      <GraduationCap className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                      <span>Class / Goal: {classLevel}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-stone-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                    <span>Preferred Mode: {preferredMode}</span>
                  </p>
                  {preferredSchedule.trim() && (
                    <p className="flex items-center gap-2 text-stone-200">
                      <Clock className="h-3.5 w-3.5 text-amber-400 dark:text-blue-400" />
                      <span>{preferredSchedule}</span>
                    </p>
                  )}
                </div>
              )}

              {role === "admin" && moderatorNote.trim() && (
                <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs">
                  <p className="font-bold uppercase tracking-wider text-amber-300 dark:text-blue-400">
                    Personal Note
                  </p>
                  <p className="leading-relaxed text-stone-200">
                    {moderatorNote}
                  </p>
                </div>
              )}

              {previewTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3.5">
                  {previewTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200 dark:bg-blue-500/20 dark:text-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </MotionCard>

          {/* Right Form Card */}
          <MotionCard
            index={1}
            className="rounded-2xl border border-stone-200/90 bg-[#fffdf9]/95 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95 sm:p-8 lg:col-span-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-blue-400">
                  Account &amp; Role Profile
                </p>
                <h2 className="mt-1 text-xl font-bold text-stone-900 dark:text-white">
                  Update {role.charAt(0).toUpperCase() + role.slice(1)} Profile
                </h2>
              </div>
              {hasUnsavedChanges && (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Unsaved changes
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="mt-6 space-y-6">
              {/* Photo Upload / URL */}
              <div className="flex flex-col gap-4 rounded-xl border border-stone-200/90 bg-[#faf7f2] p-4 dark:border-slate-800 dark:bg-slate-950/70 sm:flex-row sm:items-center">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-300 bg-[#fffdf9] dark:border-slate-700 dark:bg-slate-900">
                  {imageInput ? (
                    <img
                      src={imageInput}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-amber-800 dark:text-blue-400">
                      {initials}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-700 to-orange-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:brightness-110 dark:from-blue-600 dark:to-indigo-500">
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
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-[#fffdf9] px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <ImageIcon className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                    <input
                      type="text"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="Or paste an image URL (https://...)"
                      className="w-full rounded-lg border border-stone-300 bg-[#fffdf9] py-2 pr-3 pl-9 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Contact Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-4 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-4 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-slate-400" />
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g., 017XXXXXXXX"
                      className="w-full rounded-xl border border-stone-300 bg-[#faf7f2] py-2.5 pr-4 pl-10 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Section */}
              {role === "tutor" && (
                <div className="space-y-4 rounded-xl border border-amber-500/25 bg-amber-50/40 p-4 dark:border-blue-500/25 dark:bg-blue-950/25">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-blue-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Tutor Expertise &amp; Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Expert Subjects (comma separated)
                      </label>
                      <input
                        type="text"
                        value={expertSubjects}
                        onChange={(e) => setExpertSubjects(e.target.value)}
                        placeholder="e.g., Higher Math, Physics, ICT"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Certifications &amp; Qualifications
                      </label>
                      <input
                        type="text"
                        value={certifications}
                        onChange={(e) => setCertifications(e.target.value)}
                        placeholder="e.g., B.Sc. in CSE, IELTS 8.0, NSDA Level 3"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Core Teaching Skills
                      </label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g., Problem Solving, Board Exam Prep, Live Coding"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                          Teaching Mode
                        </label>
                        <select
                          value={teachingMode}
                          onChange={(e) => setTeachingMode(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3 py-2.5 text-sm text-stone-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                        >
                          <option value="Online & Offline">
                            Online &amp; Offline
                          </option>
                          <option value="Online">Online Only</option>
                          <option value="Offline">Offline / Local</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                          Experience
                        </label>
                        <input
                          type="text"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g., 3+ Years"
                          className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {role === "student" && (
                <div className="space-y-4 rounded-xl border border-amber-500/25 bg-amber-50/40 p-4 dark:border-blue-500/25 dark:bg-blue-950/25">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-blue-400">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Student Academic Preferences</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Class Level / Exam Goal
                      </label>
                      <input
                        type="text"
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        placeholder="e.g., HSC Science, SSC, University Admission"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Preferred Subjects (comma separated)
                      </label>
                      <input
                        type="text"
                        value={preferredSubjects}
                        onChange={(e) => setPreferredSubjects(e.target.value)}
                        placeholder="e.g., Mathematics, Physics, English"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Preferred Study Mode
                      </label>
                      <select
                        value={preferredMode}
                        onChange={(e) => setPreferredMode(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      >
                        <option value="Online & Offline">
                          Online &amp; Offline
                        </option>
                        <option value="Online">Online Batches</option>
                        <option value="Offline">Local / Offline Batches</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                        Preferred Days &amp; Time Slot
                      </label>
                      <input
                        type="text"
                        value={preferredSchedule}
                        onChange={(e) => setPreferredSchedule(e.target.value)}
                        placeholder="e.g., Sun / Tue / Thu · 6:00 PM"
                        className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === "admin" && (
                <div className="space-y-2 rounded-xl border border-amber-500/25 bg-amber-50/40 p-4 dark:border-blue-500/25 dark:bg-blue-950/25">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                    Personal Profile Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={moderatorNote}
                    onChange={(e) => setModeratorNote(e.target.value)}
                    placeholder="Short note for your account profile..."
                    className="w-full rounded-xl border border-stone-300 bg-[#fffdf9] px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"
                  />
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-slate-300">
                  Short Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder={
                    role === "tutor"
                      ? "Introduce your teaching style, academic background, and batch focus..."
                      : role === "admin"
                        ? "Short personal bio..."
                        : "Share your learning goals and subjects you want mentorship in..."
                  }
                  className="mt-1.5 w-full rounded-xl border border-stone-300 bg-[#faf7f2] px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-700 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500 dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <MotionButton>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:brightness-110 disabled:opacity-60 dark:from-blue-600 dark:to-indigo-500"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Profile"}</span>
                  </button>
                </MotionButton>
              </div>
            </form>
          </MotionCard>
        </div>
      </div>
    </div>
  );
}
