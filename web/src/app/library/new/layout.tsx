import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Add a book",
  description: "Upload a PDF and add it to your private Personal Library shelf.",
  path: "/library/new",
});

export default function NewBookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
