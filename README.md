# 🛒 Toko Yasin E-Commerce

Aplikasi e-commerce modern untuk Toko Yasin yang menjual Buku Yasin, Al-Qur'an berbagai ukuran, dan perlengkapan ibadah. Dibangun dengan Next.js 15, TypeScript, dan Prisma ORM.

## ✨ Fitur Utama

### 🛍️ Customer Features
- **Browse & Search** - Jelajahi produk dengan search dan filter kategori
- **Shopping Cart** - Keranjang belanja yang mudah digunakan
- **Secure Checkout** - Proses checkout yang aman dan mudah
- **Order Tracking** - Lacak status pesanan secara real-time dengan progress bar
- **Payment Proof Upload** - Upload bukti pembayaran langsung ke Cloudinary
- **Order History** - Riwayat pesanan lengkap dengan filter status

### 👨‍💼 Admin Features
- **Dashboard** - Statistik penjualan dan overview bisnis
- **Product Management** - CRUD produk lengkap dengan upload gambar
- **Order Management** - Kelola pesanan dan update status
- **Payment Verification** - Verifikasi/reject bukti pembayaran customer
- **Real-time Status Update** - Update status pesanan (Pending → Delivered)

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **API**: tRPC (Type-safe API)
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Image Storage**: Cloudinary
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) atau npm
- PostgreSQL database (Supabase)
- Cloudinary account (untuk image upload)

## 🛠️ Installation

1. Clone repository:
```bash
git clone <your-repo-url>
cd ecommerce-manual
```

2. Install dependencies:
```bash
pnpm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` dengan credentials Anda:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

4. Push database schema:
```bash
pnpm prisma db push
```

5. Seed database (opsional):
```bash
pnpm prisma db seed
```

6. Run development server:
```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📦 Database Schema

- **User** - Data customer dan admin
- **Product** - Katalog produk
- **Category** - Kategori produk
- **Cart & CartItem** - Shopping cart
- **Order & OrderItem** - Transaksi pesanan
- **Payment** - Manual bank transfer dengan bukti upload

## 🔐 Default Accounts

Setelah seed database:

**Admin:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

**Customer:**
- Email: `customer@example.com`
- Password: `customer123`

## 🎨 Features Highlights

### Order Status Flow
```
PENDING → PAYMENT_UPLOADED → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

### Payment Methods
- Manual Bank Transfer (BCA, BNI, Mandiri, BRI)
- Upload bukti transfer ke Cloudinary
- Admin verification system

## 📱 Responsive Design

- Mobile-first approach
- Tablet & desktop optimized
- Touch-friendly UI

## 🔧 Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run Prisma Studio
pnpm prisma studio

# Format code
pnpm format
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project ke Vercel
3. Add environment variables
4. Deploy

### Environment Variables untuk Production

```env
DATABASE_URL="your-supabase-pooler-url"
DIRECT_URL="your-supabase-direct-url"
NEXTAUTH_SECRET="generate-new-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your-preset"
```

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

Untuk support dan pertanyaan, hubungi: [your-email@example.com]

---

Built with ❤️ by Toko Yasin Team
