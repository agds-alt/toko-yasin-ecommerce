import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import AnalyticsContent from "./AnalyticsContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";


export default function AnalyticsPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat analytics data..." minHeight="600px" />}>
      <AnalyticsContent />
    </Suspense>
  );
}
