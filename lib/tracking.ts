/**
 * Tracking URL Helper Functions
 * Generate tracking URLs for various courier services in Indonesia
 */

export type CourierType =
  | "JNE"
  | "J&T Express"
  | "SiCepat"
  | "Anteraja"
  | "Ninja Express"
  | "ID Express"
  | "Pos Indonesia"
  | "Grab Express"
  | "Gojek"
  | "Lainnya";

/**
 * Generate tracking URL based on courier name and tracking number
 */
export function getTrackingUrl(courier: string, trackingNumber: string): string {
  const normalizedCourier = courier.trim().toLowerCase();
  const awb = encodeURIComponent(trackingNumber.trim());

  // JNE
  if (normalizedCourier.includes("jne")) {
    return `https://www.jne.co.id/id/tracking/trace/${awb}`;
  }

  // J&T Express
  if (normalizedCourier.includes("j&t") || normalizedCourier.includes("jnt")) {
    return `https://www.jet.co.id/track/${awb}`;
  }

  // SiCepat
  if (normalizedCourier.includes("sicepat")) {
    return `https://www.sicepat.com/checkAwb/${awb}`;
  }

  // Anteraja
  if (normalizedCourier.includes("anteraja")) {
    return `https://www.anteraja.id/tracking?no_resi=${awb}`;
  }

  // Ninja Express / Ninja Van
  if (normalizedCourier.includes("ninja")) {
    return `https://www.ninjaxpress.co.id/id-id/tracking/${awb}`;
  }

  // ID Express
  if (normalizedCourier.includes("id express") || normalizedCourier.includes("ide")) {
    return `https://www.ide.co.id/tracking/?resi=${awb}`;
  }

  // Pos Indonesia
  if (normalizedCourier.includes("pos")) {
    return `https://www.posindonesia.co.id/id/tracking/${awb}`;
  }

  // Grab Express - Usually internal tracking, no public URL
  if (normalizedCourier.includes("grab")) {
    return "#"; // No public tracking URL for Grab
  }

  // Gojek - Usually internal tracking, no public URL
  if (normalizedCourier.includes("gojek") || normalizedCourier.includes("gosend")) {
    return "#"; // No public tracking URL for Gojek
  }

  // Default: return empty string for unknown couriers
  return "#";
}

/**
 * Check if courier has public tracking URL
 */
export function hasPublicTracking(courier: string): boolean {
  const normalizedCourier = courier.trim().toLowerCase();

  // Couriers with public tracking
  const publicTrackingCouriers = [
    "jne",
    "j&t",
    "jnt",
    "sicepat",
    "anteraja",
    "ninja",
    "id express",
    "ide",
    "pos"
  ];

  return publicTrackingCouriers.some(c => normalizedCourier.includes(c));
}

/**
 * Get courier display name (normalized)
 */
export function getCourierDisplayName(courier: string): string {
  const normalizedCourier = courier.trim().toLowerCase();

  if (normalizedCourier.includes("jne")) return "JNE";
  if (normalizedCourier.includes("j&t") || normalizedCourier.includes("jnt")) return "J&T Express";
  if (normalizedCourier.includes("sicepat")) return "SiCepat";
  if (normalizedCourier.includes("anteraja")) return "Anteraja";
  if (normalizedCourier.includes("ninja")) return "Ninja Express";
  if (normalizedCourier.includes("id express") || normalizedCourier.includes("ide")) return "ID Express";
  if (normalizedCourier.includes("pos")) return "Pos Indonesia";
  if (normalizedCourier.includes("grab")) return "Grab Express";
  if (normalizedCourier.includes("gojek") || normalizedCourier.includes("gosend")) return "Gojek/GoSend";

  return courier; // Return original if not recognized
}

/**
 * Get instructions for manual tracking (for couriers without public URL)
 */
export function getTrackingInstructions(courier: string): string {
  const normalizedCourier = courier.trim().toLowerCase();

  if (normalizedCourier.includes("grab")) {
    return "Lacak paket Anda melalui aplikasi Grab atau hubungi driver langsung.";
  }

  if (normalizedCourier.includes("gojek") || normalizedCourier.includes("gosend")) {
    return "Lacak paket Anda melalui aplikasi Gojek atau hubungi driver langsung.";
  }

  return `Hubungi ${courier} untuk informasi tracking lebih lanjut.`;
}
