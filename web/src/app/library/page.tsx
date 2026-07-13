"use client";

import Link from "next/link";
import { BookOpen, ChevronRight, LibraryBig, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Alert, Button, Eyebrow, LoadingShelf, StatusBadge } from "@/components/ui";
import { api, type Book } from "@/lib/api";

export default function LibraryPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api("/books", token, { signal: controller.signal })
      .then((response) => response.json())
      .then(setBooks)
      .catch((error: Error) => {
        if (error.name !== "AbortError") setMessage(error.message);
      });
    return () => controller.abort();
  }, [attempt, token]);

  if (loading || !token || (!books && !message)) return <LoadingShelf />;

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Your shelf</Eyebrow>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-strong">My library</h1>
            <p className="mt-2 text-sm text-muted">
              {books?.length === 0 ? "No books yet — your shelf is waiting." : `${books?.length ?? 0} book${books?.length === 1 ? "" : "s"} on your shelf.`}
            </p>
          </div>
          <Link className="btn-primary" href="/library/new"><Plus aria-hidden="true" className="h-4 w-4" />Add a book</Link>
        </div>

        {message && (
          <div className="mt-6 grid gap-3">
            <Alert tone="error">{message}</Alert>
            <Button
              className="w-fit"
              variant="secondary"
              onClick={() => {
                setBooks(null);
                setMessage("");
                setAttempt((value) => value + 1);
              }}
            >
              Try again
            </Button>
          </div>
        )}

        {!message && books?.length === 0 && (
          <section className="empty-shelf mt-8 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
              <LibraryBig aria-hidden="true" className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-strong">Your shelf is empty.</h2>
            <p className="mt-2 text-muted">Add a PDF and it will be waiting here when you are.</p>
            <Link className="btn-primary mt-6 inline-flex" href="/library/new"><Plus aria-hidden="true" className="h-4 w-4" />Add your first book</Link>
          </section>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {books?.map((book) => (
            <Link key={book.id} href={`/library/${book.id}`} className="book-card block">
              <div className="flex items-start justify-between gap-4">
                <StatusBadge status={book.reading_status} />
                <ChevronRight aria-hidden="true" className="h-5 w-5 text-muted" />
              </div>
              <BookOpen aria-hidden="true" className="mt-6 h-5 w-5 text-amber-800" />
              <h2 className="mt-3 text-xl font-semibold text-strong">{book.title}</h2>
              <p className="mt-1 text-sm text-muted">{book.author}</p>
              {book.description && <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{book.description}</p>}
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
