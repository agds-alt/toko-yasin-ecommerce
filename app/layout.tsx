import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./_components/Providers";
import PWAInstaller from "./_components/PWAInstaller";
import BottomNav from "./_components/BottomNav";
import SplashScreen from "./_components/SplashScreen";
import OnlineStatus from "./_components/OnlineStatus";
import WhatsAppFloat from "./_components/WhatsAppFloat";
import PushNotificationManager from "./_components/PushNotificationManager";

export const metadata: Metadata = {
  title: {
    default: "Toko Buku Abdul - Buku Yasin & Al-Qur'an",
    template: "%s | Toko Buku Abdul",
  },
  description: "Toko online terpercaya untuk Buku Yasin, Al-Qur'an berbagai ukuran, dan perlengkapan ibadah. Pembayaran manual transfer bank dengan konfirmasi cepat.",
  keywords: ["buku yasin", "al-quran", "mushaf", "quran", "yasin", "toko buku abdul", "beli yasin online"],
  authors: [{ name: "Toko Buku Abdul" }],
  creator: "Toko Buku Abdul",
  publisher: "Toko Buku Abdul",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://tokobukuabdul.com",
    siteName: "Toko Buku Abdul",
    title: "Toko Buku Abdul - Buku Yasin & Al-Qur'an",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Toko Buku Abdul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toko Buku Abdul - Buku Yasin & Al-Qur'an",
    description: "Toko online terpercaya untuk Buku Yasin dan Al-Qur'an berkualitas",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Toko Buku Abdul",
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
        <meta name="theme-color" content="#FF755B" />
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
