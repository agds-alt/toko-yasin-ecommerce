import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_components/Providers";
import BottomNav from "./_components/BottomNav";
import SplashScreen from "./_components/SplashScreen";
import {
  OnlineStatus,
  WhatsAppFloat,
  PWAInstaller,
  PushNotificationManager
} from "./_components/ClientOnlyComponents";

export const metadata: Metadata = {
  title: {
    default: "Qahira - Buku Yasin & Al-Qur'an Berkualitas",
    template: "%s | Qahira",
  },
  description: "Toko online terpercaya untuk Buku Yasin, Al-Qur'an berbagai ukuran, dan perlengkapan ibadah. Pembayaran manual transfer bank dengan konfirmasi cepat.",
  keywords: ["buku yasin", "al-quran", "mushaf", "quran", "yasin", "qahira", "toko buku islam", "beli yasin online"],
  authors: [{ name: "Qahira" }],
  creator: "Qahira",
  publisher: "Qahira",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://qahira.com",
    siteName: "Qahira",
    title: "Qahira - Buku Yasin & Al-Qur'an Berkualitas",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Qahira",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qahira - Buku Yasin & Al-Qur'an Berkualitas",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Qahira",
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
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#d4a574" />
      </head>
      <body className="antialiased">
        <Providers>
          <SplashScreen />
          <OnlineStatus />
          {children}
          <BottomNav />
          <WhatsAppFloat />
          <PWAInstaller />
          <PushNotificationManager />
        </Providers>
      </body>
    </html>
  );
}
