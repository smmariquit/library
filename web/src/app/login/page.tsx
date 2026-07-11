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
      <p className="mt-2 text-sm leading-6 text-stone-800">Sign in to continue reading.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" required name="email" type="email" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" required name="password" type="password" className="rounded-lg border border-stone-300 px-3 py-2 font-normal focus:border-stone-950 focus:outline-none focus:ring-1 focus:ring-stone-950" />
        </div>
        <button type="submit" disabled={submitting} className="rounded-lg bg-stone-950 px-4 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-950">
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {message && <p role="alert" aria-live="polite" className="mt-4 text-sm text-red-900">{message}</p>}
      <div className="mt-6 flex justify-between text-sm">
        <Link className="text-stone-800 underline" href="/forgot-password">Forgot password?</Link>
        <Link className="text-stone-800 underline" href="/signup">Create account</Link>
      </div>
    </AuthCard>
  );
}
