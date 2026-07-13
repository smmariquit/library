import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Your library",
  description: "Browse your private PDF shelf, track reading progress, and open your books.",
  path: "/library",
});

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
