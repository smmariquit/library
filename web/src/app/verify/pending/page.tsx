"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { Alert, Button } from "@/components/ui";
import { useDevMailLink } from "@/lib/use-dev-mail-link";

function VerifyPendingContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const { retry, status, url: verificationUrl } = useDevMailLink("/api/dev/verification-link", email);

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Verify your email</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {email
          ? `We sent a verification link to ${email}. Open that link to finish creating your account.`
          : "We need your email address to finish verification."}
      </p>

      {status === "waiting" && (
        <div className="mt-6" role="status" aria-live="polite">
          <Alert tone="waiting">Waiting for your verification email…</Alert>
        </div>
      )}

      {status === "ready" && verificationUrl && (
        <div className="mt-6 grid gap-3">
          <Alert tone="ready">Your verification link is ready.</Alert>
          <a href={verificationUrl} className="btn-primary text-center">
            Open verification link
          </a>
          <p className="text-sm text-muted">This opens the link in the same tab and confirms your email.</p>
        </div>
      )}

      {status === "timeout" && (
        <div className="mt-6 grid gap-3">
          <Alert tone="neutral">We could not find your verification email yet.</Alert>
          <Button type="button" onClick={retry}>Check again</Button>
          {verificationUrl && (
            <a href={verificationUrl} className="text-center text-sm font-medium text-strong underline">
              Open verification link
            </a>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 grid gap-3">
          <Alert tone="error">
            {email
              ? "We could not reach the local email inbox. Make sure the stack is running, then try again."
              : "This page is missing an email address. Return to sign up and try again."}
          </Alert>
          {email && <Button type="button" onClick={retry}>Try again</Button>}
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Already verified? <Link className="font-medium text-strong underline decoration-stone-300 underline-offset-4" href="/login">Sign in</Link>
      </p>
    </AuthCard>
  );
}

export default function VerifyPendingPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <h1 className="mt-6 text-3xl font-semibold text-strong">Verify your email</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Loading…</p>
        </AuthCard>
      }
    >
      <VerifyPendingContent />
    </Suspense>
  );
}
