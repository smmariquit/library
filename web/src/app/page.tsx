"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";

export default function Home() {
  const { loading, user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-medium text-amber-700">Personal Library</p>
      <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
        Your books, ready when you are.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-stone-600">
        Sign in to upload a PDF, organize your library, and pick up where you left off.
      </p>
      <div className="flex gap-3">
        {!loading && user ? (
          <Link className="rounded-lg bg-stone-950 px-5 py-3 font-medium text-white" href="/library">
            Open your library
          </Link>
        ) : (
          <>
            <Link className="rounded-lg bg-stone-950 px-5 py-3 font-medium text-white" href="/signup">
              Create an account
            </Link>
            <Link className="rounded-lg border border-stone-300 px-5 py-3 font-medium" href="/login">
              Sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
