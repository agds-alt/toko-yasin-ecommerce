import { Suspense } from "react";
import { QohiraLoadingInline } from "@/app/_components/QohiraLoading";
import SettingsContent from "./SettingsContent";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<QohiraLoadingInline message="Memuat data..." />}>
      <SettingsContent />
    </Suspense>
  );
}
