import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import ProductsContent from "./ProductsContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat data..." />}>
      <ProductsContent />
    </Suspense>
  );
}
