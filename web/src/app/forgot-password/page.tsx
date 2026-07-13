"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { Alert, Button, FieldLabel, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (result.error) {
        setMessage(result.error.message ?? "Could not send the reset email.");
        return;
      }
      router.push(`/reset-password/pending?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send the reset email. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Reset your password</h1>
      <p className="mt-2 text-sm leading-6 text-muted">We will send a reset link to your inbox.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextInput id="email" required name="email" type="email" autoComplete="email" />
        </div>
        <Button type="submit" loading={submitting}>
          {!submitting && <Mail aria-hidden="true" className="h-4 w-4" />}
          {submitting ? "Sending…" : "Send reset email"}
        </Button>
      </form>
      {message && <div className="mt-4"><Alert tone="error">{message}</Alert></div>}
      <Link className="mt-6 inline-block text-sm text-muted underline decoration-stone-300 underline-offset-4 hover:text-strong" href="/login">
        Back to sign in
      </Link>
    </AuthCard>
  );
}
