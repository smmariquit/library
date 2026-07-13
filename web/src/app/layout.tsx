import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { createPageMetadata, siteName, siteURL } from "@/lib/metadata";
import { Providers } from "./providers";

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const themeScript = `try{const stored=localStorage.getItem("library-theme");document.documentElement.dataset.theme=stored==="light"||stored==="dark"?stored:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{}`;

const description = "Upload, organize, and read your PDF books in one quiet shelf.";

export const metadata: Metadata = {
  ...createPageMetadata({ title: siteName, description, path: "/", index: true }),
  metadataBase: siteURL,
  title: { default: siteName, template: `%s | ${siteName}` },
  applicationName: siteName,
  category: "books",
  keywords: ["personal library", "PDF reader", "reading tracker", "book organizer"],
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
