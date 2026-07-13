import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Create your library",
  description: "Create an account for a private shelf where you can upload, organize, and read PDFs.",
  path: "/signup",
});

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
