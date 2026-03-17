import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import CreateProductContent from "./CreateProductContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function CreateProductPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat formulir..." />}>
      <CreateProductContent />
    </Suspense>
  );
}
