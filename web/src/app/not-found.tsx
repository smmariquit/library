import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { PageBackground } from "@/components/page-background";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Page not found",
  description: "The page you requested is not available in Personal Library.",
  path: "/404",
});

export default function NotFound() {
  return (
    <PageBackground>
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <section className="panel w-full p-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
            <SearchX aria-hidden="true" className="h-6 w-6" />
          </div>
          <p className="eyebrow mt-5">404</p>
          <h1 className="mt-2 text-3xl font-semibold text-strong">This page is not on the shelf</h1>
          <p className="mt-2 text-sm leading-6 text-muted">The address may be out of date, or the page may have moved.</p>
          <Link className="btn-primary mt-6 inline-flex" href="/">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />Back home
          </Link>
        </section>
      </main>
    </PageBackground>
  );
}
