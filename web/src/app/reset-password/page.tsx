"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage("This reset link is missing its token.");
      return;
    }
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const result = await authClient.resetPassword({ newPassword: String(form.get("password")), token });
    setSubmitting(false);
    setMessage(result.error?.message ?? "Password updated. You can now sign in.");
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-2xl font-semibold">Choose a new password</h1>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium">New password<input required minLength={8} name="password" type="password" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <button disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60">{submitting ? "Updating…" : "Update password"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-stone-700">{message}</p>}
      <Link className="mt-6 inline-block text-sm text-stone-600 underline" href="/login">Back to sign in</Link>
    </AuthCard>
  );
}
