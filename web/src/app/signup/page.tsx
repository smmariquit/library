"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signUp.email({
      name: String(form.get("name")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      callbackURL: `${window.location.origin}/verify`,
    });
    setSubmitting(false);
    setMessage(result.error?.message ?? "Check Mailpit for your verification email.");
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-2xl font-semibold">Create your library</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">Keep your reading shelf in one quiet place.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium">Name<input required name="name" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">Email<input required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">Password<input required minLength={8} name="password" type="password" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <button disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
      <p className="mt-6 text-sm text-stone-600">Already have an account? <Link className="font-medium text-stone-950 underline" href="/login">Sign in</Link></p>
    </AuthCard>
  );
}
