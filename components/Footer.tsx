import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#06142e] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span>MentorLagbe</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Smart tuition and mentorship platform connecting students with
              verified tutors for online and local learning batches.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/" className="transition hover:text-blue-400">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/tuitions"
                  className="transition hover:text-blue-400"
                >
                  Browse Tuitions
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="transition hover:text-blue-400"
                >
                  Pricing / Pro Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="transition hover:text-blue-400"
                >
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact Info
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Rajshahi, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <span>support@mentorlagbe.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Connect With Us
            </h3>
            <p className="mt-4 text-sm text-slate-400">
              Follow updates, tuition batches, and mentorship tips on X.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Follow MentorLagbe on X"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white transition hover:border-blue-500 hover:bg-blue-600"
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

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} MentorLagbe. All rights reserved.</p>
          <p>Built for students, mentors, and modern learning communities.</p>
        </div>
      </div>
    </footer>
  );
}
