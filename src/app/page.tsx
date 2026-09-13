import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { WebsiteJsonLd } from "@/components/WebsiteJsonLd";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: DEFAULT_TITLE,
});

export default function Home() {
  return (
    <>
      <WebsiteJsonLd />
      <LandingPage />
    </>
  );
}
