"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { api, Book } from "@/lib/api";

export default function LibraryPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  useEffect(() => {
    if (!token) return;
    api("/books", token)
      .then((response) => response.json())
      .then(setBooks)
      .catch((error: Error) => setMessage(error.message));
  }, [token]);

  if (loading || !token) return <main className="p-8 text-stone-600">Loading your library…</main>;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-700">Your shelf</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">My library</h1>
          </div>
          <Link className="rounded-lg bg-stone-950 px-4 py-2.5 font-medium text-white" href="/library/new">Add a book</Link>
        </div>

        {message && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-800">{message}</p>}
        {!message && books.length === 0 && (
          <section className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold">Your shelf is empty.</h2>
            <p className="mt-2 text-stone-600">Add a PDF and it will be waiting here when you are.</p>
            <Link className="mt-5 inline-block font-medium underline" href="/library/new">Add your first book</Link>
          </section>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {books.map((book) => (
            <Link key={book.id} href={`/library/${book.id}`} className="rounded-xl border border-stone-200 bg-white p-5 transition hover:border-stone-400">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700">{book.reading_status}</p>
              <h2 className="mt-2 text-lg font-semibold">{book.title}</h2>
              <p className="mt-1 text-sm text-stone-600">{book.author}</p>
              {book.description && <p className="mt-4 line-clamp-2 text-sm text-stone-600">{book.description}</p>}
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
