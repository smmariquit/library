"use client";

import Link from "next/link";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <section className="w-full rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
        <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-950">
          ← Personal Library
        </Link>
        {children}
      </section>
    </main>
  );
}
