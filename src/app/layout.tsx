import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LOPANGO - Location de maisons au Congo",
    template: "%s | LOPANGO",
  },
  description:
    "Trouvez ou louez votre maison au Congo. Contact direct propriétaire ↔ locataire, sans démarcheur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
