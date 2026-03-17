/**
 * Email Templates
 * HTML email templates for various notifications
 */

interface OrderEmailData {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: string;
  shippingPhone: string;
}

interface PaymentEmailData {
  customerName: string;
  orderNumber: string;
  status: "verified" | "rejected";
  bankName: string;
  amount: number;
  notes?: string;
}

interface ShippingEmailData {
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery?: string;
}

export function getOrderConfirmationEmail(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rp ${item.price.toLocaleString("id-ID")}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">Rp ${(item.quantity * item.price).toLocaleString("id-ID")}</td>
    </tr>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Konfirmasi Pesanan - Toko Yasin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Toko Yasin</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Terima kasih atas pesanan Anda!</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Halo <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Pesanan Anda telah kami terima dan sedang diproses. Berikut adalah detail pesanan Anda:
      </p>

      <!-- Order Info Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #FF755B; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #666;">Nomor Pesanan</p>
        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #333;">${data.orderNumber}</p>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Tanggal: ${data.orderDate}</p>
      </div>

      <!-- Items Table -->
      <h2 style="font-size: 18px; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #FF755B;">
        📦 Detail Pesanan
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 10px; text-align: left; font-size: 12px; color: #666;">Produk</th>
            <th style="padding: 10px; text-align: center; font-size: 12px; color: #666;">Qty</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; color: #666;">Harga</th>
            <th style="padding: 10px; text-align: right; font-size: 12px; color: #666;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="3" style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 16px;">Total:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #FF755B;">
              Rp ${data.totalAmount.toLocaleString("id-ID")}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Shipping Info -->
      <h2 style="font-size: 18px; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #FF755B;">
        🚚 Informasi Pengiriman
      </h2>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;"><strong>Alamat:</strong></p>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">${data.shippingAddress}</p>
        <p style="margin: 0; font-size: 14px; color: #666;"><strong>Telepon:</strong> ${data.shippingPhone}</p>
      </div>

      <!-- Next Steps -->
      <h2 style="font-size: 18px; color: #333; margin: 30px 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #FF755B;">
        📋 Langkah Selanjutnya
      </h2>
      <ol style="font-size: 14px; color: #666; line-height: 1.8;">
        <li>Upload bukti pembayaran melalui halaman detail pesanan</li>
        <li>Admin akan memverifikasi pembayaran Anda (1-2 jam kerja)</li>
        <li>Pesanan akan diproses dan dikirim</li>
        <li>Anda akan menerima notifikasi saat pesanan dikirim</li>
      </ol>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${data.orderNumber}"
           style="display: inline-block; background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
          Lihat Detail Pesanan
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        Email ini dikirim otomatis, mohon tidak membalas email ini.
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        © 2026 Toko Yasin. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getPaymentVerificationEmail(data: PaymentEmailData): string {
  const isVerified = data.status === "verified";
  const statusColor = isVerified ? "#10B981" : "#EF4444";
  const statusIcon = isVerified ? "✅" : "❌";
  const statusText = isVerified
    ? "Pembayaran Anda telah diverifikasi!"
    : "Pembayaran Anda ditolak";
  const statusMessage = isVerified
    ? "Pembayaran Anda telah dikonfirmasi oleh admin. Pesanan Anda akan segera diproses."
    : "Maaf, bukti pembayaran yang Anda upload tidak dapat diverifikasi. Silakan upload ulang bukti pembayaran yang valid.";

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Pembayaran - Toko Yasin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Toko Yasin</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Update Status Pembayaran</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Halo <strong>${data.customerName}</strong>,</p>

      <!-- Status Box -->
      <div style="background-color: ${statusColor}15; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">${statusIcon}</div>
        <h2 style="margin: 0 0 10px 0; font-size: 20px; color: ${statusColor};">${statusText}</h2>
        <p style="margin: 0; font-size: 14px; color: #666;">${statusMessage}</p>
      </div>

      <!-- Order Details -->
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Nomor Pesanan</p>
        <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #333;">${data.orderNumber}</p>
        <p style="margin: 0 0 5px 0; font-size: 14px; color: #666;">Bank: <strong>${data.bankName}</strong></p>
        <p style="margin: 0; font-size: 14px; color: #666;">Jumlah: <strong>Rp ${data.amount.toLocaleString("id-ID")}</strong></p>
      </div>

      ${
        data.notes
          ? `
      <!-- Admin Notes -->
      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 5px 0; font-size: 12px; font-weight: bold; color: #92400E;">Catatan Admin:</p>
        <p style="margin: 0; font-size: 14px; color: #78350F;">${data.notes}</p>
      </div>
      `
          : ""
      }

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
           style="display: inline-block; background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
          Lihat Pesanan Saya
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        Butuh bantuan? Hubungi kami di WhatsApp atau email support@tokoyasin.com
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        © 2026 Toko Yasin. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export function getShippingNotificationEmail(data: ShippingEmailData): string {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pesanan Dikirim - Toko Yasin</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">📦 Pesanan Dikirim!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Paket Anda sedang dalam perjalanan</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px 20px;">
      <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">Halo <strong>${data.customerName}</strong>,</p>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Kabar baik! Pesanan Anda telah dikirim dan sedang dalam perjalanan ke alamat tujuan.
      </p>

      <!-- Shipping Box -->
      <div style="background: linear-gradient(135deg, #10B98115 0%, #05966915 100%); border-left: 4px solid #10B981; padding: 20px; margin: 20px 0; border-radius: 4px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">🚚</div>
        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Nomor Pesanan</p>
        <p style="margin: 0; font-size: 20px; font-weight: bold; color: #333;">${data.orderNumber}</p>
        ${
          data.courier
            ? `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #10B98130;">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Kurir Pengiriman</p>
          <p style="margin: 0 0 15px 0; font-size: 18px; font-weight: bold; color: #10B981;">${data.courier}</p>
        </div>
        `
            : ""
        }
        ${
          data.trackingNumber
            ? `
        <div style="margin-top: ${data.courier ? "0" : "15px"}; padding-top: ${data.courier ? "0" : "15px"}; border-top: ${data.courier ? "none" : "1px solid #10B98130"};">
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">Nomor Resi</p>
          <p style="margin: 0; font-size: 16px; font-weight: bold; font-family: 'Courier New', monospace; color: #10B981; background-color: #10B98110; padding: 10px; border-radius: 4px;">${data.trackingNumber}</p>
          <p style="margin: 10px 0 0 0; font-size: 11px; color: #059669;">📋 Salin nomor resi di atas untuk melacak paket Anda</p>
        </div>
        `
            : ""
        }
      </div>

      ${
        data.estimatedDelivery
          ? `
      <!-- Estimated Delivery -->
      <div style="background-color: #FEF3C7; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
        <p style="margin: 0 0 5px 0; font-size: 12px; color: #92400E;">Estimasi Tiba</p>
        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #78350F;">${data.estimatedDelivery}</p>
      </div>
      `
          : ""
      }

      <!-- Tips -->
      <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; color: #1E40AF;">💡 Tips:</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1E3A8A; line-height: 1.6;">
          <li>Pastikan ada yang menerima paket di alamat tujuan</li>
          <li>Simpan nomor resi untuk tracking pengiriman</li>
          <li>Cek kondisi paket sebelum menerima dari kurir</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders"
           style="display: inline-block; background: linear-gradient(135deg, #FF755B 0%, #FF5733 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
          Lacak Pesanan
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        Terima kasih telah berbelanja di Toko Yasin! 🙏
      </p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
        © 2026 Toko Yasin. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
