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
      <p className="mt-2 text-sm leading-6 text-stone-800">Keep your reading shelf in one quiet place.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <input id="name" required name="name" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" required minLength={8} name="password" type="password" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <button type="submit" disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      {message && <p role="alert" aria-live="polite" className="mt-4 text-sm text-stone-700">{message}</p>}
      <p className="mt-6 text-sm text-stone-800">Already have an account? <Link className="font-medium text-stone-950 underline" href="/login">Sign in</Link></p>
    </AuthCard>
  );
}
