"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { QohiraLoadingOverlay } from "./QohiraLoading";

export default function RouteLoadingProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Show loading when route changes
    setIsLoading(true);

    // Hide loading after a short delay (to allow page to render)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return <QohiraLoadingOverlay message="Memuat halaman..." />;
}
