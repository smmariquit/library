"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { api, Book } from "@/lib/api";

export default function BookPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { token, loading } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [message, setMessage] = useState("");
  const [pdfURL, setPdfURL] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  useEffect(() => {
    if (!token) return;
    api(`/books/${params.bookId}`, token)
      .then((response) => response.json())
      .then(setBook)
      .catch((error: Error) => setMessage(error.message));
  }, [params.bookId, token]);

  useEffect(() => () => {
    if (pdfURL) URL.revokeObjectURL(pdfURL);
  }, [pdfURL]);

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !book) return;
    const form = new FormData(event.currentTarget);
    try {
      const response = await api(`/books/${book.id}`, token, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          author: form.get("author"),
          description: form.get("description") || null,
          reading_status: form.get("reading_status"),
        }),
      });
      setBook(await response.json());
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
    }
  }

  async function openReader() {
    if (!token || !book) return;
    try {
      const response = await api(`/books/${book.id}/content`, token);
      const nextURL = URL.createObjectURL(await response.blob());
      setPdfURL((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextURL;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not open this PDF.");
    }
  }

  async function remove() {
    if (!token || !book || !window.confirm(`Delete “${book.title}”?`)) return;
    try {
      await api(`/books/${book.id}`, token, { method: "DELETE" });
      router.push("/library");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete this book.");
    }
  }

  if (loading || !token || !book) {
    return <main className="p-8 text-stone-600">{message || "Loading book…"}</main>;
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm text-stone-600 underline" href="/library">← Back to library</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section>
            <p className="text-sm font-medium text-amber-700">{book.reading_status}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{book.title}</h1>
            <p className="mt-2 text-stone-600">{book.author}</p>
            <button type="button" className="mt-6 rounded-lg bg-stone-950 px-4 py-3 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950" onClick={openReader}>Read PDF</button>
            {pdfURL && <iframe title={`PDF Reader for ${book.title}`} src={pdfURL} className="mt-6 h-[72vh] w-full rounded-xl border border-stone-200 bg-white" />}
          </section>
          <form className="grid content-start gap-4 rounded-2xl border border-stone-200 bg-white p-5" onSubmit={update}>
            <h2 className="font-semibold">Book details</h2>
            <div className="grid gap-1">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <input id="title" required name="title" defaultValue={book.title} className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="author" className="text-sm font-medium">Author</label>
              <input id="author" required name="author" defaultValue={book.author} className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" name="description" defaultValue={book.description ?? ""} rows={4} className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
            </div>
            <div className="grid gap-1">
              <label htmlFor="reading_status" className="text-sm font-medium">Status</label>
              <select id="reading_status" name="reading_status" defaultValue={book.reading_status} className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950"><option value="unread">Unread</option><option value="reading">Reading</option><option value="finished">Finished</option></select>
            </div>
            <button type="submit" className="rounded-lg bg-stone-950 px-4 py-2.5 font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">Save changes</button>
            <button type="button" className="rounded-lg px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-950" onClick={remove}>Delete book</button>
            {message && <p role="alert" aria-live="polite" className="text-sm text-stone-700">{message}</p>}
          </form>
        </div>
      </main>
    </AppShell>
  );
}
