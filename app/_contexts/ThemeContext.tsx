"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "default" | "basic";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isBasic: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "default",
  toggleTheme: () => {},
  isBasic: false,
});

const STORAGE_KEY = "qohira-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "basic") {
      setTheme("basic");
      document.documentElement.classList.add("theme-basic");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "default" ? "basic" : "default";
      localStorage.setItem(STORAGE_KEY, next);

      if (next === "basic") {
        document.documentElement.classList.add("theme-basic");
      } else {
        document.documentElement.classList.remove("theme-basic");
      }

      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isBasic: theme === "basic" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
