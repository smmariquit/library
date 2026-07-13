"use client";

import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { Alert, Button, Eyebrow, FieldLabel, LoadingShelf, Panel, SelectInput, TextArea, TextInput } from "@/components/ui";
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

  if (loading || !token) return <LoadingShelf />;

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Eyebrow>Add a book</Eyebrow>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-strong">Put a new PDF on your shelf.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Upload a PDF, add a few details, and it will appear on your shelf right away.</p>
        <Panel className="mt-8 p-6">
          <form className="grid gap-5" onSubmit={submit}>
            <div className="grid gap-1">
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <TextInput id="title" required name="title" />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="author">Author</FieldLabel>
              <TextInput id="author" required name="author" />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <TextArea id="description" name="description" rows={4} />
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="reading_status">Reading status</FieldLabel>
              <SelectInput id="reading_status" name="reading_status" defaultValue="unread">
                <option value="unread">Unread</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </SelectInput>
            </div>
            <div className="grid gap-1">
              <FieldLabel htmlFor="file">PDF file</FieldLabel>
              <TextInput id="file" required accept="application/pdf,.pdf" name="file" type="file" />
            </div>
            <Button type="submit" loading={submitting}>
              {submitting ? "Adding book…" : <><Upload aria-hidden="true" className="h-4 w-4" />Add to library</>}
            </Button>
            {message && <Alert tone="error">{message}</Alert>}
          </form>
        </Panel>
      </main>
    </AppShell>
  );
}
