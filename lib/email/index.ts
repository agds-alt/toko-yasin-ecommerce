/**
 * Email Service Entry Point
 * Exports all email-related functions
 */

import { sendEmail, isEmailConfigured } from "./resend";
import {
  getOrderConfirmationEmail,
  getPaymentVerificationEmail,
  getShippingNotificationEmail,
} from "./templates";

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  shippingPhone: string;
}

interface PaymentVerificationData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: "verified" | "rejected";
  bankName: string;
  amount: number;
  notes?: string;
}

interface ShippingNotificationData {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured, skipping order confirmation email");
    return { success: false, skipped: true };
  }

  const html = getOrderConfirmationEmail({
    customerName: data.customerName,
    orderNumber: data.orderNumber,
    orderDate: new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    items: data.items,
    totalAmount: data.totalAmount,
    shippingAddress: data.shippingAddress,
    shippingPhone: data.shippingPhone,
  });

  return await sendEmail({
    to: data.customerEmail,
    subject: `Konfirmasi Pesanan #${data.orderNumber} - Toko Yasin`,
    html,
  });
}

/**
 * Send new order notification to admin
 * @param adminEmail - Admin email from database (optional, fallback to env)
 */
export async function sendNewOrderNotificationToAdmin(
  data: OrderEmailData,
  adminEmail?: string
) {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured, skipping admin notification");
    return { success: false, skipped: true };
  }

  // Use provided admin email, fallback to env, then default
  const targetEmail = adminEmail || process.env.ADMIN_EMAIL || "admin@tokoyasin.com";

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pesanan Baru - Toko Yasin Admin</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background-color: #FF755B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">🔔 Pesanan Baru!</h1>
    </div>
    <div style="background-color: white; padding: 20px; border-radius: 0 0 8px 8px;">
      <h2 style="color: #FF755B;">Detail Pesanan</h2>
      <p><strong>Nomor Pesanan:</strong> ${data.orderNumber}</p>
      <p><strong>Customer:</strong> ${data.customerName} (${data.customerEmail})</p>
      <p><strong>Total:</strong> Rp ${data.totalAmount.toLocaleString("id-ID")}</p>

      <h3>Produk:</h3>
      <ul>
        ${data.items.map((item) => `<li>${item.name} - ${item.quantity}x @ Rp ${item.price.toLocaleString("id-ID")}</li>`).join("")}
      </ul>

      <h3>Pengiriman:</h3>
      <p><strong>Alamat:</strong> ${data.shippingAddress}</p>
      <p><strong>Telepon:</strong> ${data.shippingPhone}</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders"
           style="display: inline-block; background-color: #FF755B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Lihat di Admin Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return await sendEmail({
    to: targetEmail,
    subject: `🛒 Pesanan Baru #${data.orderNumber}`,
    html,
  });
}

/**
 * Send payment verification email (approved or rejected)
 */
export async function sendPaymentVerificationEmail(data: PaymentVerificationData) {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured, skipping payment verification email");
    return { success: false, skipped: true };
  }

  const html = getPaymentVerificationEmail(data);

  const subject =
    data.status === "verified"
      ? `✅ Pembayaran Diverifikasi #${data.orderNumber}`
      : `❌ Pembayaran Ditolak #${data.orderNumber}`;

  return await sendEmail({
    to: data.customerEmail,
    subject: `${subject} - Toko Yasin`,
    html,
  });
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotificationEmail(data: ShippingNotificationData) {
  if (!isEmailConfigured()) {
    console.warn("Email service not configured, skipping shipping notification");
    return { success: false, skipped: true };
  }

  const html = getShippingNotificationEmail(data);

  return await sendEmail({
    to: data.customerEmail,
    subject: `📦 Pesanan Dikirim #${data.orderNumber} - Toko Yasin`,
    html,
  });
}

/**
 * Alias for payment verification email (backward compatibility)
 */
export async function sendPaymentStatusEmail(data: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "verified" | "rejected";
  notes?: string;
}) {
  return await sendPaymentVerificationEmail({
    ...data,
    bankName: "Transfer Bank", // Default
    amount: data.totalAmount,
  });
}

// Export email check utility
export { isEmailConfigured };
