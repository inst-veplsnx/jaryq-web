import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full`}
    >
      <body className="min-h-full bg-jaryq-bg-main">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
