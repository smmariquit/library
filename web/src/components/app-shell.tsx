"use client";

import Link from "next/link";
import { BookOpen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";
import { Alert } from "@/components/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignOut() {
    setSigningOut(true);
    setMessage("");
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="page-canvas min-h-screen text-strong">
      <header className="app-header sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/library" className="brand-mark text-strong">
            <span className="brand-icon h-9 w-9">
              <BookOpen aria-hidden="true" className="h-5 w-5" />
            </span>
            Personal Library
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="user-chip hidden sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              type="button"
              className="btn-ghost px-2 py-1 font-medium"
              aria-label={signingOut ? "Signing out" : "Sign out"}
              disabled={signingOut}
              onClick={handleSignOut}
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
        </div>
      </header>
      {message && <div className="mx-auto max-w-5xl px-6 pt-4"><Alert tone="error">{message}</Alert></div>}
      <div className="page-enter">{children}</div>
    </div>
  );
}
