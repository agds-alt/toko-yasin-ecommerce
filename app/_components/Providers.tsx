"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, getTRPCClient } from "@/lib/trpc";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../_contexts/CartContext";
import { SearchProvider } from "../_contexts/SearchContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <SessionProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </CartProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </SessionProvider>
  );
}
