import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Check your verification email",
  description: "Open your verification email to activate your Personal Library account.",
  path: "/verify/pending",
});

export default function VerifyPendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
