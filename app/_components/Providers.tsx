"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, getTRPCClient } from "@/lib/trpc";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../_contexts/CartContext";
import { SearchProvider } from "../_contexts/SearchContext";
import { RecentlyViewedProvider } from "../_contexts/RecentlyViewedContext";
import { ThemeProvider } from "../_contexts/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds default staleTime
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <CartProvider>
              <SearchProvider>
                <RecentlyViewedProvider>
                  {children}
                </RecentlyViewedProvider>
              </SearchProvider>
            </CartProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
