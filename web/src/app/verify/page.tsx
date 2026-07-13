"use client";

import Link from "next/link";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { useAuth } from "@/components/auth-provider";
import { Alert, Button } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

const errorMessages: Record<string, string> = {
  TOKEN_EXPIRED: "This verification link has expired. Sign in to request a new one.",
  INVALID_TOKEN: "This verification link is invalid. Sign in to request a new one.",
};

function VerifyAttempt({ token }: { token: string }) {
  const router = useRouter();
  const { refresh } = useAuth();
  const [result, setResult] = useState<{ status: "verifying" | "success" | "error"; message?: string }>({
    status: "verifying",
  });

  useEffect(() => {
    let cancelled = false;

    void authClient
      .verifyEmail({ query: { token } })
      .then(async (response) => {
        if (cancelled) return;
        if (response.error) {
          setResult({ status: "error", message: response.error.message ?? "We could not verify your email." });
          return;
        }
        await refresh();
        if (!cancelled) setResult({ status: "success" });
      })
      .catch(() => {
        if (!cancelled) setResult({ status: "error", message: "We could not verify your email." });
      });

    return () => {
      cancelled = true;
    };
  }, [refresh, token]);

  if (result.status === "verifying") {
    return (
      <AuthCard>
        <LoaderCircle aria-hidden="true" className="mt-6 h-10 w-10 animate-spin text-amber-700" />
        <h1 className="mt-5 text-3xl font-semibold text-strong">Verifying your email</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Confirming your verification link…</p>
        <div className="mt-6"><Alert tone="waiting">This only takes a moment.</Alert></div>
      </AuthCard>
    );
  }

  if (result.status === "error") {
    return (
      <AuthCard>
        <h1 className="mt-6 text-3xl font-semibold text-strong">Verification failed</h1>
        <div className="mt-4"><Alert tone="error">{result.message}</Alert></div>
        <Link className="btn-primary mt-6 inline-flex" href="/login">Go to sign in</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">
        <CircleCheckBig aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-3xl font-semibold text-strong">Your email is verified</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Your account is ready. You can start building your library.</p>
      <Button className="mt-6" onClick={() => router.push("/library")}>Open your library</Button>
    </AuthCard>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  if (error) {
    return (
      <AuthCard>
        <h1 className="mt-6 text-3xl font-semibold text-strong">Verification failed</h1>
        <div className="mt-4">
          <Alert tone="error">{errorMessages[error] ?? "We could not verify your email."}</Alert>
        </div>
        <Link className="btn-primary mt-6 inline-flex" href="/login">Go to sign in</Link>
      </AuthCard>
    );
  }

  if (!token) {
    return (
      <AuthCard>
        <h1 className="mt-6 text-3xl font-semibold text-strong">Check your email</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Open the verification link we sent to your inbox. It will bring you back here and confirm your account automatically.
        </p>
        <Link className="btn-primary mt-6 inline-flex" href="/login">Back to sign in</Link>
      </AuthCard>
    );
  }

  return <VerifyAttempt key={token} token={token} />;
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthCard>
          <LoaderCircle aria-hidden="true" className="mt-6 h-10 w-10 animate-spin text-amber-700" />
          <h1 className="mt-5 text-3xl font-semibold text-strong">Verifying your email</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Loading your verification link…</p>
        </AuthCard>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
