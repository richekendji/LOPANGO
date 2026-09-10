import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "LOPANGO - Location de maisons au Congo",
    template: "%s | LOPANGO",
  },
  description:
    "Trouvez ou louez votre maison au Congo-Brazzaville. Les propriétaires publient leurs maisons, les locataires trouvent leur bonheur.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
