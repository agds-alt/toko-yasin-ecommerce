"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryName?: string;
  viewedAt: number; // Timestamp
}

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Omit<Product, "viewedAt">) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const STORAGE_KEY = "recently-viewed-products";
const MAX_ITEMS = 20; // Keep last 20 viewed products

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount (only on client-side)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setRecentlyViewed(parsed);
        }
      } catch (error) {
        console.error("Failed to load recently viewed products:", error);
      }
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes (only on client-side)
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
      } catch (error) {
        console.error("Failed to save recently viewed products:", error);
      }
    }
  }, [recentlyViewed, mounted]);

  const addToRecentlyViewed = (product: Omit<Product, "viewedAt">) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);

      // Add to beginning with current timestamp
      const updated = [
        { ...product, viewedAt: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS); // Keep only MAX_ITEMS

      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear recently viewed products:", error);
      }
    }
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error("useRecentlyViewed must be used within a RecentlyViewedProvider");
  }
  return context;
}
