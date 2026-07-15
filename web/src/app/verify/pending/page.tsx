"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth-card";
import { MailpitInstructions } from "@/components/mailpit-instructions";
import { Alert } from "@/components/ui";

const VERIFY_SUBJECT = "Verify your Library email";

function VerifyPendingContent() {
  const email = useSearchParams().get("email")?.trim() ?? "";

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Verify your email</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {email
          ? `We sent a verification link to ${email}.`
          : "We need your email address to finish verification."}
      </p>

      {email ? (
        <MailpitInstructions
          email={email}
          subject={VERIFY_SUBJECT}
          lead="Your verification email is waiting in the local Mailpit inbox."
        />
      ) : (
        <div className="mt-6">
          <Alert tone="error">This page is missing an email address. Return to sign up and try again.</Alert>
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        Already verified?{" "}
        <Link className="font-medium text-strong underline decoration-stone-300 underline-offset-4" href="/login">
          Sign in
        </Link>
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
