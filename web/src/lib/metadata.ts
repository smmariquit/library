import type { Metadata } from "next";

export const siteName = "Personal Library";
export const siteURL = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? process.env.WEB_URL ?? "http://localhost:3000");

export function createPageMetadata({
  title,
  description,
  path,
  index = false,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  const socialTitle = title === siteName ? siteName : `${title} | ${siteName}`;

  return {
    title: { absolute: socialTitle },
    description,
    alternates: { canonical: path },
    robots: { index, follow: index },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName,
      locale: "en_US",
      type: "website",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
