"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function NewBookPage() {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setMessage("");
    try {
      const response = await api("/books", token, { method: "POST", body: new FormData(event.currentTarget) });
      const book = await response.json();
      router.push(`/library/${book.id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add the book.");
      setSubmitting(false);
    }
  }

  if (loading || !token) return <main className="p-8 text-stone-800">Loading…</main>;

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm font-medium text-amber-900">Add a book</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Put a new PDF on your shelf.</h1>
        <form className="mt-8 grid gap-5 rounded-2xl border border-stone-200 bg-white p-6" onSubmit={submit}>
          <div className="grid gap-1">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <input id="title" required name="title" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="author" className="text-sm font-medium">Author</label>
            <input id="author" required name="author" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea id="description" name="description" rows={4} className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
          </div>
          <div className="grid gap-1">
            <label htmlFor="reading_status" className="text-sm font-medium">Reading status</label>
            <select id="reading_status" name="reading_status" defaultValue="unread" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950"><option value="unread">Unread</option><option value="reading">Reading</option><option value="finished">Finished</option></select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="file" className="text-sm font-medium">PDF file</label>
            <input id="file" required accept="application/pdf,.pdf" name="file" type="file" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
          </div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">{submitting ? "Adding book…" : "Add to library"}</button>
          {message && <p role="alert" aria-live="polite" className="text-sm text-red-900">{message}</p>}
        </form>
      </main>
    </AppShell>
  );
}
