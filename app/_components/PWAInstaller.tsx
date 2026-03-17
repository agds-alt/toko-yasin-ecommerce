"use client";

import { useEffect, useState } from "react";
import { X, Download } from "lucide-react";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("❌ Service Worker registration failed:", error);
        });
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt after 3 seconds
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      console.log("✅ PWA installed successfully");
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="text-white rounded-2xl shadow-2xl p-6 relative" style={{
        background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)'
      }}>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-all"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Download className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Install Qahira</h3>
            <p className="text-sm text-white/90 mb-4">
              Install aplikasi untuk akses lebih cepat dan pengalaman yang lebih baik!
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                style={{ color: '#FF5733' }}
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-4 py-2 border-2 border-white/30 rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
