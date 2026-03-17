import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import OrdersContent from "./OrdersContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat data..." />}>
      <OrdersContent />
    </Suspense>
  );
}
