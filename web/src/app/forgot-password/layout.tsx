import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Reset your password",
  description: "Request a secure password reset link for your Personal Library account.",
  path: "/forgot-password",
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
