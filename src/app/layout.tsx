import type { Metadata, Viewport } from "next";
import { Manrope, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ToasterClient } from "@/components/ui/ToasterClient";

// JARYQ ships in Kazakh (Cyrillic). Geist has no Cyrillic glyphs, so the UI
// font must self-host the cyrillic + cyrillic-ext subsets or every screen
// falls back to a system serif. The variable is named --font-sans so the
// `--font-sans` theme token in globals.css resolves to it at runtime.
const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["900"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

import { requireEnvValue } from "@/lib/env";
const siteUrl = requireEnvValue("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "JARYQ — Аудиокітаптар платформасы",
  description:
    "JARYQ — Қазақстандағы ең үлкен аудиокітаптар платформасы. Мыңдаған кітаптарды тыңдаңыз.",
  icons: { icon: "/logo.webp", apple: "/logo.webp" },
  openGraph: {
    title: "JARYQ — Аудиокітаптар платформасы",
    description: "Қазақ тіліндегі аудиокітаптар платформасы",
    locale: "kk_KZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="kk"
      className={`${sans.variable} ${geistMono.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full bg-jaryq-bg-main">
        <AuthProvider>
          {children}
          <ToasterClient />
        </AuthProvider>
      </body>
    </html>
  );
}
