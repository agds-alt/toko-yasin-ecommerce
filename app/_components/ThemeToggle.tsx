"use client";

import { useTheme } from "../_contexts/ThemeContext";
import { Palette, Minus } from "lucide-react";

export default function ThemeToggle() {
  const { isBasic, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-105"
      style={{
        backgroundColor: isBasic ? "#171717" : "transparent",
        border: isBasic ? "none" : "1.5px solid var(--gray-30)",
      }}
      title={isBasic ? "Switch to default theme" : "Switch to Basic theme"}
    >
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isBasic ? 0 : 1,
          transform: isBasic ? "rotate(90deg) scale(0.5)" : "rotate(0deg) scale(1)",
          color: "var(--primary)",
        }}
      >
        <Palette className="w-4 h-4" />
      </span>
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isBasic ? 1 : 0,
          transform: isBasic ? "rotate(0deg) scale(1)" : "rotate(-90deg) scale(0.5)",
          color: "#ffffff",
        }}
      >
        <Minus className="w-4 h-4" strokeWidth={3} />
      </span>
    </button>
  );
}
