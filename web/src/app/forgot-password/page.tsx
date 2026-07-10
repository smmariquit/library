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
      <p className="mt-2 text-sm leading-6 text-stone-600">We’ll send a reset link to your local Mailpit inbox.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium">Email<input required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <button disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60">{submitting ? "Sending…" : "Send reset email"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
      <Link className="mt-6 inline-block text-sm text-stone-600 underline" href="/login">Back to sign in</Link>
    </AuthCard>
  );
}
