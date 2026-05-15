import type { Metadata } from "next";
import { BRANDING } from "@/shared/config/branding";

export const SITE_NAME = "Samyoga Admin";
export const SITE_DESCRIPTION = "Samyoga platform administration";

const DEFAULT_SITE_URL = "http://localhost:3003";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function shareImageUrl(siteUrl: string): string {
  return new URL(BRANDING.openGraphImage, siteUrl).href;
}

export function createRootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const ogImage = shareImageUrl(siteUrl);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [{ url: ogImage, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [ogImage],
    },
    robots: { index: false, follow: false },
  };
}
