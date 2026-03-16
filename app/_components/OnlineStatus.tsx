"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function OnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Initialize with current status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't show anything if online and not just reconnected
  if (isOnline && !showStatus) {
    return null;
  }

  return (
    <div
      className={`fixed top-16 md:top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        showStatus ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full shadow-xl text-white text-sm md:text-base font-semibold ${
          isOnline
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : "bg-gradient-to-r from-red-500 to-rose-600"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 md:w-5 md:h-5" />
            <span>Kembali Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 md:w-5 md:h-5" />
            <span>Mode Offline</span>
          </>
        )}
      </div>
    </div>
  );
}
