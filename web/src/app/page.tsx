"use client";

import Link from "next/link";
import { BookOpen, BookOpenCheck, ChartNoAxesColumnIncreasing, LibraryBig, Upload } from "lucide-react";
import { PageBackground } from "@/components/page-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { Eyebrow } from "@/components/ui";
import { useAuth } from "@/components/auth-provider";

const features = [
  { icon: Upload, title: "Upload PDFs", copy: "Add books to your private shelf in a few clicks." },
  { icon: ChartNoAxesColumnIncreasing, title: "Track progress", copy: "Mark titles unread, reading, or finished." },
  { icon: BookOpenCheck, title: "Read in-browser", copy: "Open any owned book without leaving the app." },
];

export default function Home() {
  const { loading, user } = useAuth();

  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-16 page-enter">
        <div className="flex items-center justify-end">
          <ThemeToggle />
        </div>

        <div className="flex flex-wrap gap-3">
          <span className="stat-pill">
            <BookOpen aria-hidden="true" className="h-4 w-4 text-amber-800" />
            PDF library for quiet reading
          </span>
          <span className="stat-pill">
            <LibraryBig aria-hidden="true" className="h-4 w-4 text-amber-800" />
            Upload, organize, resume
          </span>
        </div>

        <div className="max-w-3xl">
          <Eyebrow>Personal Library</Eyebrow>
          <h1 className="hero-title mt-4 font-semibold text-strong">
            Your books, ready when you are.
          </h1>
          <p className="hero-lede mt-5">
            A calm shelf for the PDFs you care about. Sign in to upload, organize your reading, and pick up where you left off.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {loading ? (
            <div className="skeleton h-12 w-44" role="status" aria-label="Checking your session" />
          ) : user ? (
            <Link className="btn-primary px-5 py-3" href="/library">
              Open your library
            </Link>
          ) : (
            <>
              <Link className="btn-primary px-5 py-3" href="/signup">
                Create an account
              </Link>
              <Link className="btn-secondary px-5 py-3" href="/login">
                Sign in
              </Link>
            </>
          )}
        </div>

        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="panel p-5">
              <Icon aria-hidden="true" className="h-5 w-5 text-amber-800" />
              <h2 className="mt-4 text-lg font-semibold text-strong">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </section>
      </main>
    </PageBackground>
  );
}
