"use client";

import Image from "next/image";

interface QohiraLoadingProps {
  message?: string;
  size?: "small" | "medium" | "large";
}

export default function QohiraLoading({
  message = "Memuat...",
  size = "medium",
}: QohiraLoadingProps) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Logo with pulse animation */}
      <div className={`relative ${sizeClasses[size]} animate-pulse`}>
        <Image
          src="/icons/icon-512x512.png"
          alt="Qohira"
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>

      {/* Brand Name */}
      <h2
        className={`${
          size === "large" ? "text-3xl" : size === "medium" ? "text-2xl" : "text-xl"
        } font-black`}
        style={{
          background: "linear-gradient(135deg, #d4a574 0%, #f4c794 50%, #d4a574 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: "Urbanist",
          letterSpacing: "-0.02em",
        }}
      >
        QOHIRA
      </h2>

      {/* Loading spinner */}
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
        <div
          className="absolute inset-0 border-4 border-transparent rounded-full animate-spin"
          style={{
            borderTopColor: "#d4a574",
            borderRightColor: "#d4a574",
          }}
        />
      </div>

      {/* Message */}
      <p className={`text-gray-600 font-medium ${textSizes[size]} animate-pulse`}>
        {message}
      </p>
    </div>
  );
}

// Full screen loading overlay
export function QohiraLoadingOverlay({
  message = "Memuat...",
}: {
  message?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center backdrop-blur-sm"
      style={{
        background: "linear-gradient(135deg, rgba(26, 43, 74, 0.95) 0%, rgba(42, 59, 90, 0.95) 100%)",
      }}
    >
      <QohiraLoading message={message} size="large" />
    </div>
  );
}

// Inline loading for page sections
export function QohiraLoadingInline({
  message = "Memuat...",
  minHeight = "400px",
}: {
  message?: string;
  minHeight?: string;
}) {
  return (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <QohiraLoading message={message} size="medium" />
    </div>
  );
}
