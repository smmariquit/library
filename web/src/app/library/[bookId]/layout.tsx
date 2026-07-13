import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: LayoutProps<"/library/[bookId]">): Promise<Metadata> {
  const { bookId } = await params;
  return createPageMetadata({
    title: "Book details",
    description: "Read a PDF, update its details, and track its progress in your personal library.",
    path: `/library/${encodeURIComponent(bookId)}`,
  });
}

export default function BookLayout({ children }: LayoutProps<"/library/[bookId]">) {
  return children;
}
