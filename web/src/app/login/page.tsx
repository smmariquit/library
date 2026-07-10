"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (result.error) {
      setMessage(result.error.message ?? "Could not sign in.");
      setSubmitting(false);
      return;
    }
    await refresh();
    router.push("/library");
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-2xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">Sign in to continue reading.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <label className="grid gap-1 text-sm font-medium">Email<input required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <label className="grid gap-1 text-sm font-medium">Password<input required name="password" type="password" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" /></label>
        <button disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
      <div className="mt-6 flex justify-between text-sm">
        <Link className="text-stone-600 underline" href="/forgot-password">Forgot password?</Link>
        <Link className="text-stone-600 underline" href="/signup">Create account</Link>
      </div>
    </AuthCard>
  );
}
