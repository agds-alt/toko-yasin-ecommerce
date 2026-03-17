import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import CustomersContent from "./CustomersContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat data pelanggan..." />}>
      <CustomersContent />
    </Suspense>
  );
}
