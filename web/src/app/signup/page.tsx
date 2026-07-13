"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth-card";
import { Alert, Button, FieldLabel, TextInput } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
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
      const result = await authClient.signUp.email({
        name: String(form.get("name")),
        email,
        password: String(form.get("password")),
        callbackURL: `${window.location.origin}/verify`,
      });
      if (result.error) {
        setMessage(result.error.message ?? "Could not create your account.");
        return;
      }
      router.push(`/verify/pending?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard>
      <h1 className="mt-6 text-3xl font-semibold text-strong">Create your library</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Keep your reading shelf in one quiet place.</p>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <div className="grid gap-1">
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <TextInput id="name" required name="name" autoComplete="name" />
        </div>
        <div className="grid gap-1">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <TextInput id="email" required name="email" type="email" autoComplete="email" />
        </div>
        <div className="grid gap-1">
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <TextInput id="password" required minLength={8} name="password" type="password" autoComplete="new-password" />
        </div>
        <Button type="submit" loading={submitting}>
          {!submitting && <UserPlus aria-hidden="true" className="h-4 w-4" />}
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      {message && <div className="mt-4"><Alert tone="error">{message}</Alert></div>}
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-strong underline decoration-stone-300 underline-offset-4" href="/login">Sign in</Link>
      </p>
    </AuthCard>
  );
}
