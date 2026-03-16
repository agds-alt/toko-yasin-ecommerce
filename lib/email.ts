/**
 * Email Service using Resend
 * Handles sending transactional emails
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Toko Yasin <onboarding@resend.dev>"; // Default Resend email
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ecommerce.com";

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

interface PaymentEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "verified" | "rejected";
  notes?: string;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const itemsList = data.items
      .map(
        (item) =>
          `<li>${item.name} - ${item.quantity}x @ Rp ${item.price.toLocaleString("id-ID")}</li>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Pesanan Berhasil Dibuat!</h1>
              <p>Terima kasih telah berbelanja di Toko Yasin</p>
            </div>
            <div class="content">
              <p>Halo <strong>${data.customerName}</strong>,</p>
              <p>Pesanan Anda telah berhasil dibuat dengan detail sebagai berikut:</p>

              <div class="order-info">
                <h3>📋 Detail Pesanan</h3>
                <p><strong>Nomor Pesanan:</strong> ${data.orderNumber}</p>
                <p><strong>Total Pembayaran:</strong> <span class="total">Rp ${data.totalAmount.toLocaleString("id-ID")}</span></p>

                <h4>Produk yang Dipesan:</h4>
                <ul>
                  ${itemsList}
                </ul>

                <h4>📍 Alamat Pengiriman:</h4>
                <p>${data.shippingAddress}</p>
                <p>📞 ${data.shippingPhone}</p>
              </div>

              <div class="order-info">
                <h3>💳 Langkah Selanjutnya</h3>
                <ol>
                  <li>Silakan lakukan pembayaran sebesar <strong>Rp ${data.totalAmount.toLocaleString("id-ID")}</strong></li>
                  <li>Upload bukti transfer melalui halaman detail pesanan</li>
                  <li>Tunggu konfirmasi dari admin kami</li>
                  <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                </ol>
              </div>

              <p>Jika ada pertanyaan, jangan ragu untuk menghubungi kami.</p>
            </div>
            <div class="footer">
              <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
              <p>&copy; 2024 Toko Yasin. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Pesanan ${data.orderNumber} Berhasil Dibuat - Toko Yasin`,
      html,
    });

    console.log("✅ Order confirmation email sent:", result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send payment status email to customer
 */
export async function sendPaymentStatusEmail(data: PaymentEmailData) {
  try {
    const isVerified = data.status === "verified";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isVerified ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isVerified ? "#10B981" : "#EF4444"}; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isVerified ? "✅ Pembayaran Dikonfirmasi!" : "❌ Pembayaran Ditolak"}</h1>
              <p>Update status pembayaran pesanan Anda</p>
            </div>
            <div class="content">
              <p>Halo <strong>${data.customerName}</strong>,</p>

              <div class="status-box">
                <h3>Status Pembayaran</h3>
                <p><strong>Nomor Pesanan:</strong> ${data.orderNumber}</p>
                <p><strong>Total Pembayaran:</strong> Rp ${data.totalAmount.toLocaleString("id-ID")}</p>
                <p><strong>Status:</strong> <span style="color: ${isVerified ? "#10B981" : "#EF4444"}; font-weight: bold;">${isVerified ? "DIKONFIRMASI" : "DITOLAK"}</span></p>
                ${data.notes ? `<p><strong>Catatan Admin:</strong> ${data.notes}</p>` : ""}
              </div>

              ${
                isVerified
                  ? `
                <p>Pembayaran Anda telah dikonfirmasi oleh admin kami. Pesanan Anda akan segera diproses dan dikirim.</p>
                <p>Anda akan menerima notifikasi lebih lanjut mengenai status pengiriman.</p>
              `
                  : `
                <p>Maaf, pembayaran Anda tidak dapat dikonfirmasi. Silakan upload ulang bukti pembayaran yang valid atau hubungi admin untuk informasi lebih lanjut.</p>
              `
              }

              <p>Terima kasih telah berbelanja di Toko Yasin!</p>
            </div>
            <div class="footer">
              <p>Email ini dikirim otomatis, mohon tidak membalas email ini.</p>
              <p>&copy; 2024 Toko Yasin. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `${isVerified ? "Pembayaran Dikonfirmasi" : "Pembayaran Ditolak"} - Pesanan ${data.orderNumber}`,
      html,
    });

    console.log(`✅ Payment ${data.status} email sent:`, result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("❌ Failed to send payment status email:", error);
    return { success: false, error };
  }
}

/**
 * Send order notification to admin
 */
export async function sendNewOrderNotificationToAdmin(data: OrderEmailData) {
  try {
    const itemsList = data.items
      .map(
        (item) =>
          `<li>${item.name} - ${item.quantity}x @ Rp ${item.price.toLocaleString("id-ID")}</li>`
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Pesanan Baru Masuk!</h1>
            </div>
            <div class="content">
              <div class="order-info">
                <h3>Detail Pesanan</h3>
                <p><strong>Nomor Pesanan:</strong> ${data.orderNumber}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                <p><strong>Email:</strong> ${data.customerEmail}</p>
                <p><strong>Total:</strong> Rp ${data.totalAmount.toLocaleString("id-ID")}</p>

                <h4>Produk:</h4>
                <ul>${itemsList}</ul>

                <h4>Alamat Pengiriman:</h4>
                <p>${data.shippingAddress}</p>
                <p>📞 ${data.shippingPhone}</p>
              </div>

              <p>Silakan cek dashboard admin untuk informasi lebih lanjut.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[NEW ORDER] ${data.orderNumber} - Rp ${data.totalAmount.toLocaleString("id-ID")}`,
      html,
    });

    console.log("✅ Admin notification email sent:", result.id);
    return { success: true, id: result.id };
  } catch (error) {
    console.error("❌ Failed to send admin notification email:", error);
    return { success: false, error };
  }
}
