"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Save, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Alert, Button, FieldLabel, LoadingBook, SelectInput, StatusBadge, TextArea, TextInput } from "@/components/ui";
import { api, type Book } from "@/lib/api";

export default function BookPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { token, loading } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [readerLoading, setReaderLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!loading && !token) router.replace("/login");
  }, [loading, router, token]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    api(`/books/${params.bookId}`, token, { signal: controller.signal })
      .then((response) => response.json())
      .then(setBook)
      .catch((error: Error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      });
    return () => controller.abort();
  }, [attempt, params.bookId, token]);

  useEffect(() => () => {
    if (pdfURL) URL.revokeObjectURL(pdfURL);
  }, [pdfURL]);

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !book) return;
    setSaving(true);
    setFeedback(null);
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
      setFeedback({ tone: "success", text: "Changes saved." });
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Could not save changes." });
    } finally {
      setSaving(false);
    }
  }

  async function openReader() {
    if (!token || !book) return;
    setReaderLoading(true);
    setFeedback(null);
    try {
      const response = await api(`/books/${book.id}/content`, token);
      const nextURL = URL.createObjectURL(await response.blob());
      setPdfURL(nextURL);
    } catch (error) {
      setReaderLoading(false);
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Could not open this PDF." });
    }
  }

  async function remove() {
    if (!token || !book || !window.confirm(`Delete “${book.title}”?`)) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await api(`/books/${book.id}`, token, { method: "DELETE" });
      router.push("/library");
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Could not delete this book." });
      setDeleting(false);
    }
  }

  if (loading || !token || (!book && !loadError)) return <LoadingBook />;

  if (loadError || !book) {
    return (
      <AppShell>
        <main className="mx-auto max-w-2xl px-6 py-16">
          <div className="panel p-6">
            <Alert tone="error">{loadError || "This book could not be loaded."}</Alert>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setLoadError("");
                  setAttempt((value) => value + 1);
                }}
              >
                Try again
              </Button>
              <Link className="btn-secondary" href="/library">Back to library</Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link className="text-sm font-medium text-muted underline decoration-stone-300 underline-offset-4 hover:text-strong" href="/library">
          <span className="inline-flex items-center gap-2"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to library</span>
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="panel p-6">
            <StatusBadge status={book.reading_status} />
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-strong">{book.title}</h1>
            <p className="mt-2 text-lg text-muted">{book.author}</p>
            <Button className="mt-6" loading={readerLoading} onClick={openReader}>
              {!readerLoading && <BookOpen aria-hidden="true" className="h-4 w-4" />}
              {readerLoading ? "Opening PDF…" : pdfURL ? "Reload PDF" : "Read PDF"}
            </Button>
            {pdfURL && (
              <div className="mt-6">
                {readerLoading && <div className="mb-3"><Alert tone="waiting">Rendering your PDF…</Alert></div>}
                <iframe
                  title={`PDF Reader for ${book.title}`}
                  src={pdfURL}
                  aria-busy={readerLoading}
                  onLoad={() => setReaderLoading(false)}
                  className="h-[72vh] w-full rounded-xl border border-stone-200 bg-white"
                />
              </div>
            )}
          </section>
          <form className="panel grid content-start gap-4 p-5" onSubmit={update}>
            <h2 className="text-xl font-semibold text-strong">Book details</h2>
            <div className="grid gap-1">
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <TextInput id="title" required name="title" defaultValue={book.title} />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="author">Author</FieldLabel>
              <TextInput id="author" required name="author" defaultValue={book.author} />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <TextArea id="description" name="description" defaultValue={book.description ?? ""} rows={4} />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="reading_status">Status</FieldLabel>
              <SelectInput id="reading_status" name="reading_status" defaultValue={book.reading_status}>
                <option value="unread">Unread</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </SelectInput>
            </div>
            <Button type="submit" loading={saving} disabled={deleting}>
              {!saving && <Save aria-hidden="true" className="h-4 w-4" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="danger" loading={deleting} disabled={saving} onClick={remove}>
              {!deleting && <Trash2 aria-hidden="true" className="h-4 w-4" />}
              {deleting ? "Deleting…" : "Delete book"}
            </Button>
            {feedback && <Alert tone={feedback.tone}>{feedback.text}</Alert>}
          </form>
        </div>
      </main>
    </AppShell>
  );
}
