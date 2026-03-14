import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_components/Providers";
import PWAInstaller from "./_components/PWAInstaller";

export const metadata: Metadata = {
  title: {
    default: "Toko Yasin - Buku Yasin & Al-Qur'an",
    template: "%s | Toko Yasin",
  },
  description: "Toko online terpercaya untuk Buku Yasin, Al-Qur'an berbagai ukuran, dan perlengkapan ibadah. Pembayaran manual transfer bank dengan konfirmasi cepat.",
  keywords: ["buku yasin", "al-quran", "mushaf", "quran", "yasin", "toko yasin", "beli yasin online"],
  authors: [{ name: "Toko Yasin" }],
  creator: "Toko Yasin",
  publisher: "Toko Yasin",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://tokoyasin.com",
    siteName: "Toko Yasin",
    title: "Toko Yasin - Buku Yasin & Al-Qur'an",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Toko Yasin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toko Yasin - Buku Yasin & Al-Qur'an",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toko Yasin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
          <PWAInstaller />
        </Providers>
      </body>
    </html>
  );
}
