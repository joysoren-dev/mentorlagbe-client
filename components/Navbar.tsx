"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: "student" | "tutor" | "admin" | string;
  plan?: string;
}

function extractUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mentorlagbe-user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const candidate =
      parsed && typeof parsed === "object" && "user" in parsed && parsed.user
        ? parsed.user
        : parsed;

    if (!candidate || typeof candidate !== "object") return null;
    if (!candidate.email && !candidate.name && !candidate.role) return null;

    return {
      id: candidate.id || candidate._id,
      name: candidate.name || candidate.email?.split("@")[0] || "User",
      email: candidate.email || "",
      image:
        typeof candidate.image === "string"
          ? candidate.image
          : typeof candidate.avatar === "string"
            ? candidate.avatar
            : typeof candidate.picture === "string"
              ? candidate.picture
              : "",
      role: candidate.role || "student",
      plan: candidate.plan || "free",
    };
  } catch {
    return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [imgError, setImgError] = useState(false);

  const syncUser = useCallback(() => {
    setImgError(false);
    setUser(extractUserFromStorage());
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("mentorlagbe-theme");
    const shouldBeDark = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", shouldBeDark);
    setIsDark(shouldBeDark);

    syncUser();

    const handleAuthChange = () => syncUser();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "mentorlagbe-user" || e.key === null) {
        syncUser();
      }
    };

    window.addEventListener("mentorlagbe-auth-change", handleAuthChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("mentorlagbe-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncUser]);

  useEffect(() => {
    syncUser();
  }, [pathname, syncUser]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("mentorlagbe-theme", nextDark ? "dark" : "light");
    toast.success(
      nextDark ? "Switched to Dark Theme" : "Switched to Warm Light Theme",
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("mentorlagbe-user");
    window.dispatchEvent(new Event("mentorlagbe-auth-change"));
    setUser(null);
    setMobileOpen(false);
    toast.success("Logged out successfully.");
    router.push("/sign-in");
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Tuitions", href: "/tuitions" },
    { label: "Pricing", href: "/pricing" },
    { label: "How It Works", href: "/how-it-works" },
  ];

  const roleLabel = (user?.role || "student").toUpperCase();
  const isProfileActive = pathname === "/dashboard/profile";

  const renderAvatar = () => {
    if (user?.image && !imgError) {
      return (
        <img
          src={user.image}
          alt={user.name || "User avatar"}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-5 w-5 rounded-full object-cover"
        />
      );
    }
    return (
      <UserCircle2 className="h-4 w-4 text-amber-700 dark:text-blue-400" />
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/90 bg-[#faf7f2]/95 text-stone-900 shadow-xs backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-[#070d19]/95 dark:text-white dark:shadow-none">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-stone-900 dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-700 text-white dark:bg-blue-600">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>MentorLagbe</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${
                pathname === item.href
                  ? "font-semibold text-amber-800 underline decoration-amber-700/70 underline-offset-8 dark:text-blue-400 dark:decoration-blue-400/70"
                  : "text-stone-700 hover:text-amber-800 dark:text-slate-300 dark:hover:text-blue-400"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to Warm Light" : "Switch to Dark Mode"}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-300 bg-[#fffdf9] px-3 text-xs font-semibold text-stone-800 transition hover:border-amber-700 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-stone-700" />
                <span>Dark</span>
              </>
            )}
          </button>

          {user ? (
            <>
              <Link
                href="/dashboard/profile"
                title="Open Profile"
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition ${
                  isProfileActive
                    ? "border-amber-700 bg-amber-100/80 ring-2 ring-amber-600/15 dark:border-blue-400 dark:bg-blue-950/70 dark:ring-blue-500/20"
                    : "border-stone-300 bg-[#fffdf9] hover:border-amber-700 hover:bg-amber-50/70 dark:border-slate-700/90 dark:bg-slate-900/85 dark:hover:border-blue-500 dark:hover:bg-slate-800"
                }`}
              >
                {renderAvatar()}
                <span className="max-w-[130px] truncate text-xs font-semibold text-stone-900 dark:text-white">
                  {user.name}
                </span>
                <span className="rounded bg-amber-700/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-900 dark:bg-blue-500/20 dark:text-blue-300">
                  {roleLabel}
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-transparent px-3.5 py-2 text-sm font-medium text-stone-800 transition hover:border-red-500/60 hover:bg-red-50 hover:text-red-700 dark:border-slate-600 dark:text-slate-100 dark:hover:border-red-400/70 dark:hover:bg-red-500/10 dark:hover:text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg border border-stone-300 bg-[#fffdf9] px-4 py-2 text-sm font-medium text-stone-800 transition hover:border-amber-700 hover:bg-amber-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-100 dark:hover:border-blue-400 dark:hover:bg-slate-800/70"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-[#fffdf9] text-stone-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-stone-700" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-[#fffdf9] text-stone-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-[#faf7f2] px-4 py-4 dark:border-slate-800 dark:bg-[#070d19] md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-200/60 hover:text-amber-800 dark:text-slate-200 dark:hover:bg-slate-800/70 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="space-y-2.5 border-t border-stone-200 pt-3 dark:border-slate-800">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-[#fffdf9] px-3 py-2 transition hover:border-amber-700 dark:border-slate-800 dark:bg-slate-900/85 dark:hover:border-blue-500"
                >
                  <div className="flex items-center gap-2">
                    {renderAvatar()}
                    <span className="text-xs font-semibold text-stone-900 dark:text-white">
                      {user.name}
                    </span>
                  </div>
                  <span className="rounded bg-amber-700/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-blue-500/20 dark:text-blue-300">
                    {roleLabel}
                  </span>
                </Link>

                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg bg-amber-700 px-3 py-2 text-center text-sm font-medium text-white dark:bg-blue-600"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-center text-sm font-medium text-stone-800 dark:border-slate-600 dark:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg border border-stone-300 bg-[#fffdf9] px-3 py-2 text-center text-sm font-medium text-stone-800 dark:border-slate-600 dark:bg-transparent dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-amber-700 px-3 py-2 text-center text-sm font-medium text-white dark:bg-blue-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
