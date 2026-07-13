"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { Alert, Button, FieldLabel, TextInput } from "@/components/ui";
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
    const email = String(form.get("email"));
    try {
      const result = await authClient.signIn.email({
        email,
        password: String(form.get("password")),
      });
      if (result.error) {
        const errorMessage = result.error.message ?? "Could not sign in.";
        if (result.error.code === "EMAIL_NOT_VERIFIED" || errorMessage.toLowerCase().includes("verif")) {
          router.push(`/verify/pending?email=${encodeURIComponent(email)}`);
          return;
        }
        setMessage(errorMessage);
        return;
      }
      await refresh();
      router.push("/library");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Sign in to continue reading.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextInput id="email" required name="email" type="email" autoComplete="email" />
        </div>
        <div className="grid gap-1">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <TextInput id="password" required name="password" type="password" autoComplete="current-password" />
        </div>
        <Button type="submit" loading={submitting}>
          {!submitting && <LogIn aria-hidden="true" className="h-4 w-4" />}
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      {message && <div className="mt-4"><Alert tone="error">{message}</Alert></div>}
      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
        <Link className="text-muted underline decoration-stone-300 underline-offset-4 hover:text-strong" href="/forgot-password">Forgot password?</Link>
        <Link className="text-muted underline decoration-stone-300 underline-offset-4 hover:text-strong" href="/signup">Create account</Link>
      </div>
    </AuthCard>
  );
}
