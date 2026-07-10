"use client";

import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function VerifyPage() {
  return (
    <AuthCard>
      <h1 className="mt-6 text-2xl font-semibold">Your email is verified</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">You can sign in and start building your library.</p>
      <Link className="mt-6 inline-block rounded-lg bg-stone-950 px-4 py-3 font-medium text-white" href="/login">Sign in</Link>
    </AuthCard>
  );
}
