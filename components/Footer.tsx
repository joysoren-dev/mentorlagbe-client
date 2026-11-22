import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/90 bg-[#faf7f2]/95 text-stone-700 backdrop-blur-xs transition-colors duration-200 dark:border-slate-800 dark:bg-[#06142e]/95 dark:text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-stone-900 dark:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-700 text-white dark:bg-blue-600">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span>MentorLagbe</span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">
              Smart tuition and mentorship platform connecting students with
              verified tutors for online and local learning batches.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-stone-700 dark:text-slate-300">
              <li>
                <Link
                  href="/"
                  className="transition hover:text-amber-800 dark:hover:text-blue-400"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tuitions"
                  className="transition hover:text-amber-800 dark:hover:text-blue-400"
                >
                  Browse Tuitions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition hover:text-amber-800 dark:hover:text-blue-400"
                >
                  Pricing / Pro Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="transition hover:text-amber-800 dark:hover:text-blue-400"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
              Contact Info
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-stone-600 dark:text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                <span>Rajshahi, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                <span>support@mentorlagbe.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-amber-700 dark:text-blue-400" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 dark:text-white">
              Connect With Us
            </h3>
            <p className="mt-4 text-sm text-stone-600 dark:text-slate-400">
              Follow updates, tuition batches, and mentorship tips on X.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow MentorLagbe on X"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-300 bg-[#fffdf9] text-stone-800 transition hover:border-amber-700 hover:bg-amber-700 hover:text-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row">
          <p>© 2026 MentorLagbe. All rights reserved.</p>
          <p>Built for students, mentors, and modern learning communities.</p>
        </div>
      </div>
    </footer>
  );
}
