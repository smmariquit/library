"use client";

import Link from "next/link";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { Alert, Button, FieldLabel, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

function ResetPasswordForm({ token }: { token: string }) {
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirmPassword"))) {
      setFeedback({ tone: "error", text: "The passwords do not match." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await authClient.resetPassword({ newPassword: password, token });
      if (result.error) {
        setFeedback({ tone: "error", text: result.error.message ?? "Could not update your password." });
        return;
      }
      setComplete(true);
      setFeedback({ tone: "success", text: "Password updated. You can now sign in." });
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Could not update your password. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Choose a new password</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Use at least eight characters that you do not use elsewhere.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <TextInput id="password" required minLength={8} name="password" type="password" autoComplete="new-password" />
        </div>
        <div className="grid gap-1">
          <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
          <TextInput id="confirmPassword" required minLength={8} name="confirmPassword" type="password" autoComplete="new-password" />
        </div>
        <Button type="submit" loading={submitting} disabled={complete}>
          {!submitting && <KeyRound aria-hidden="true" className="h-4 w-4" />}
          {submitting ? "Updating…" : complete ? "Password updated" : "Update password"}
        </Button>
      </form>
      {feedback && <div className="mt-4"><Alert tone={feedback.tone}>{feedback.text}</Alert></div>}
      <Link className="mt-6 inline-block text-sm text-muted underline decoration-stone-300 underline-offset-4 hover:text-strong" href="/login">
        Back to sign in
      </Link>
    </AuthCard>
  );
}

function ResetPasswordContent() {
  const token = useSearchParams().get("token");
  if (token) return <ResetPasswordForm token={token} />;

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Reset link required</h1>
      <div className="mt-4"><Alert tone="error">This password reset link is missing or invalid.</Alert></div>
      <Link className="btn-primary mt-6 inline-flex" href="/forgot-password">Request a new link</Link>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <LoaderCircle aria-hidden="true" className="mt-6 h-10 w-10 animate-spin text-amber-700" />
          <h1 className="mt-5 text-3xl font-semibold text-strong">Loading reset link</h1>
        </AuthCard>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
