import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import NotificationsContent from "./NotificationsContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminNotificationsPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat data..." />}>
      <NotificationsContent />
    </Suspense>
  );
}
