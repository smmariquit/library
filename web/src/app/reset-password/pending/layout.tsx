import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Check your reset email",
  description: "Open your password reset email to continue restoring access to your library.",
  path: "/reset-password/pending",
});

export default function ResetPendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
