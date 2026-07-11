"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    setMessage(result.error?.message ?? "If that account exists, Mailpit now has a reset email.");
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-2xl font-semibold">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-stone-800">We’ll send a reset link to your local Mailpit inbox.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <button type="submit" disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">{submitting ? "Sending…" : "Send reset email"}</button>
      </form>
      {message && <p role="alert" aria-live="polite" className="mt-4 text-sm text-stone-700">{message}</p>}
      <Link className="mt-6 inline-block text-sm text-stone-800 underline" href="/login">Back to sign in</Link>
    </AuthCard>
  );
}
