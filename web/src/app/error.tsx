"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { PageBackground } from "@/components/page-background";
import { Button } from "@/components/ui";

export default function ErrorPage({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <section className="panel w-full p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-800">
            <CircleAlert aria-hidden="true" className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-strong">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-muted">The page could not finish loading. Your library data has not been changed.</p>
          <Button className="mt-6" onClick={unstable_retry}>
            <RotateCcw aria-hidden="true" className="h-4 w-4" />Try again
          </Button>
        </section>
      </main>
    </PageBackground>
  );
}
