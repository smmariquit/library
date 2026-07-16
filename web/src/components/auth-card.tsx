"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AuthBackground } from "@/components/page-background";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <AuthBackground>
      <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
        <section className="panel w-full p-7">
          <div className="flex items-start justify-between gap-4">
            <Link href="/" className="brand-mark text-strong hover:opacity-80">
              <span className="brand-icon h-9 w-9">
                <BookOpen aria-hidden="true" className="h-5 w-5" />
              </span>
              Personal Library
            </Link>
            <ThemeToggle />
          </div>
          {children}
        </section>
      </main>
    </AuthBackground>
  );
}
