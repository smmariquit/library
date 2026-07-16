"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { MailpitInstructions } from "@/components/mailpit-instructions";
import { Alert } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const VERIFY_SUBJECT = "Verify your Library email";

function VerifyPendingContent() {
  const email = useSearchParams().get("email")?.trim() ?? "";
  const router = useRouter();
  const { refresh } = useAuth();
  const [verified, setVerified] = useState(false);

  // Verifying happens in the tab that opens the emailed link. Auth is configured
  // with autoSignInAfterVerification, so a session only appears once this email
  // is verified. Poll for it and advance this tab automatically when it lands.
  useEffect(() => {
    if (!email) return;
    let active = true;

    async function check() {
      const session = await authClient.getSession().catch(() => null);
      if (!active || !session?.data?.user?.emailVerified) return;
      setVerified(true);
      await refresh();
      router.replace("/library");
    }

    const interval = setInterval(check, 2500);
    void check();
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [email, refresh, router]);

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Verify your email</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        {email
          ? `We sent a verification link to ${email}.`
          : "We need your email address to finish verification."}
      </p>

      {email ? (
        verified ? (
          <div className="mt-6">
            <Alert tone="success">Email verified. Taking you to your library…</Alert>
          </div>
        ) : (
          <>
            <MailpitInstructions
              email={email}
              subject={VERIFY_SUBJECT}
              lead="Your verification email is waiting in the local Mailpit inbox."
            />
            <div className="mt-6">
              <Alert tone="waiting">Waiting for verification. This page updates automatically once you click the link.</Alert>
            </div>
          </>
        )
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
