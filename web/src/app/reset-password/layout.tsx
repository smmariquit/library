import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Choose a new password",
  description: "Set a new password and restore access to your Personal Library account.",
  path: "/reset-password",
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
