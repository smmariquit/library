"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/library" className="font-semibold tracking-tight">
            Personal Library
          </Link>
          <div className="flex items-center gap-4 text-sm text-stone-600">
            <span className="hidden sm:inline">{user?.email}</span>
            <button type="button" className="font-medium text-stone-950 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-950 rounded-sm px-1" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
