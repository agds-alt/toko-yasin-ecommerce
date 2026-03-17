"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if splash was already shown in this session
    const splashShown = sessionStorage.getItem("splashShown");

    if (splashShown) {
      setShowSplash(false);
      return;
    }

    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Hide splash completely after fade animation (3 seconds total)
    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("splashShown", "true");
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!showSplash) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "linear-gradient(135deg, #1a2b4a 0%, #2a3b5a 100%)",
      }}
    >
      {/* Logo/Brand Name */}
      <div className="text-center px-8 animate-fade-in">
        <h1
          className="text-7xl sm:text-8xl md:text-9xl font-black mb-4"
          style={{
            background: "linear-gradient(135deg, #d4a574 0%, #f4c794 50%, #d4a574 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "Urbanist",
            letterSpacing: "-0.02em",
            textShadow: "0 4px 20px rgba(212, 165, 116, 0.3)",
          }}
        >
          QOHIRA
        </h1>

        {/* Tagline */}
        <p
          className="text-white/90 text-lg sm:text-xl font-medium mt-6"
          style={{
            textShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}
        >
          Buku Yasin & Al-Qur'an Berkualitas
        </p>
      </div>

      {/* Loading Animation */}
      <div className="absolute bottom-20 flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 border-4 border-white/30 rounded-full"
            style={{ borderTopColor: "white" }}
          />
          <div
            className="absolute inset-0 border-4 border-transparent rounded-full animate-spin"
            style={{
              borderTopColor: "white",
              borderRightColor: "white",
            }}
          />
        </div>

        {/* Loading Text */}
        <p className="text-white/80 text-sm font-medium animate-pulse">
          Memuat...
        </p>
      </div>
    </div>
  );
}
