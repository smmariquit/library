"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthCard } from "@/components/auth-card";
import { Alert, Button } from "@/components/ui";
import { useDevMailLink } from "@/lib/use-dev-mail-link";

function ResetPendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const { retry, status, url: resetUrl } = useDevMailLink("/api/dev/reset-password-link", email);

  useEffect(() => {
    if (status === "ready" && resetUrl) window.location.assign(resetUrl);
  }, [resetUrl, status]);

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Check your reset email</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {email
          ? `We sent a password reset link to ${email}. This page will continue automatically once it arrives.`
          : "We need your email address to finish the reset."}
      </p>

      {status === "waiting" && (
        <div className="mt-6" role="status" aria-live="polite">
          <Alert tone="waiting">Waiting for your reset email…</Alert>
        </div>
      )}

      {status === "ready" && (
        <div className="mt-6" role="status" aria-live="polite">
          <Alert tone="ready">Reset email received. Continuing in this tab…</Alert>
        </div>
      )}

      {status === "timeout" && (
        <div className="mt-6 grid gap-3">
          <Alert tone="neutral">We could not find your reset email yet.</Alert>
          <Button type="button" onClick={retry}>Check again</Button>
          {resetUrl && (
            <a href={resetUrl} className="text-center text-sm font-medium text-stone-950 underline">
              Reset password now
            </a>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 grid gap-3">
          <Alert tone="error">
            {email
              ? "We could not reach the local email inbox. Make sure the stack is running, then try again."
              : "This page is missing an email address. Return to password reset and try again."}
          </Alert>
          {email && <Button type="button" onClick={retry}>Try again</Button>}
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Remembered it? <Link className="font-medium text-strong underline decoration-stone-300 underline-offset-4" href="/login">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export default function ResetPendingPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <h1 className="mt-6 text-3xl font-semibold text-stone-950">Check your reset email</h1>
          <p className="mt-2 text-sm leading-6 text-stone-700">Loading…</p>
        </AuthCard>
      }
    >
      <ResetPendingContent />
    </Suspense>
  );
}
