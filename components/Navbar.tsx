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

  const syncUser = useCallback(() => {
    setUser(extractUserFromStorage());
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("mentorlagbe-theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

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
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mentorlagbe-theme", "dark");
      toast.success("Switched to Dark Mode");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mentorlagbe-theme", "light");
      toast.success("Switched to Light Mode");
    }
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[#06142e]/95 text-white backdrop-blur dark:border-slate-800">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span>MentorLagbe</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition hover:text-blue-400 ${
                pathname === item.href ? "text-blue-400" : "text-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200 transition hover:border-blue-500 hover:text-white"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/90 bg-slate-900/85 px-3 py-1.5">
                <UserCircle2 className="h-4 w-4 text-blue-400" />
                <span className="max-w-[130px] truncate text-xs font-semibold text-white">
                  {user.name}
                </span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-300">
                  {roleLabel}
                </span>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3.5 py-2 text-sm font-medium text-slate-100 transition hover:border-red-400/70 hover:bg-red-500/10 hover:text-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-blue-400 hover:bg-slate-800/70"
              >
                Sign In
              </Link>

              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
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
            aria-label="Toggle color theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-200"
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-white"
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
        <div className="border-t border-slate-800 bg-[#06142e] px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800/70 hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <div className="space-y-2.5 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-900/85 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">
                      {user.name}
                    </span>
                  </div>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                    {roleLabel}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-center text-sm font-medium text-white"
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
                  className="flex-1 rounded-lg border border-slate-600 px-3 py-2 text-center text-sm font-medium text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white"
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
