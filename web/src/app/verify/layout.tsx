import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Verify your email",
  description: "Confirm your email address to finish creating your Personal Library account.",
  path: "/verify",
});

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
