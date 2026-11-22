import type { Metadata } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MentorLagbe | Smart Tuition & Mentorship Platform",
  description:
    "Find verified tutors and mentorship batches by subject, class level, mode, and monthly budget.",
};

const themeInitScript = `
  (function () {
    try {
      var saved = localStorage.getItem("mentorlagbe-theme");
      var isDark = saved === "dark";
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="theme-grid-bg flex min-h-screen flex-col antialiased"
      >
        <Suspense
          fallback={
            <div className="h-16 w-full bg-[#16120e] dark:bg-[#06142e]" />
          }
        >
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
