import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Cleaning database...");
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin User
  console.log("👤 Creating admin user...");
  const adminPassword = await hash("admin123", 10);
  const admin = await prisma.user.create({
    data: {
      email: "Achmadmoeslem@gmail.com",
      password: adminPassword,
      name: "ACHMAD MUSLIM",
      role: "ADMIN",
      phone: "085620061990",
      address: "Penerbit Zara Bandung",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create Test Customer
  console.log("👤 Creating test customer...");
  const customerPassword = await hash("customer123", 10);
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      password: customerPassword,
      name: "John Doe",
      role: "CUSTOMER",
      phone: "082345678901",
      address: "Jl. Customer No. 2, Bandung",
    },
  });
  console.log("✅ Customer created:", customer.email);

  // Create Categories for Toko Yasin
  console.log("📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Buku Yasin", slug: "buku-yasin" },
    }),
    prisma.category.create({
      data: { name: "Al-Qur'an", slug: "al-quran" },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // Create 17 Products for Toko Yasin - Placeholder (nanti diganti dengan data asli)
  console.log("📦 Creating products...");
  const products = [
    // Buku Yasin (10 products)
    {
      name: "Buku Yasin Hardcover Premium",
      slug: "yasin-hardcover-premium-001",
      description: "Buku yasin hardcover berkualitas untuk tahlilan 40 hari",
      price: 25000,
      stock: 50,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Softcover Standar",
      slug: "yasin-softcover-standar-001",
      description: "Buku yasin softcover ekonomis isi lengkap",
      price: 15000,
      stock: 100,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Cover Batik",
      slug: "yasin-batik-001",
      description: "Buku yasin dengan cover batik elegan",
      price: 30000,
      stock: 60,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Mini Saku",
      slug: "yasin-mini-saku-001",
      description: "Buku yasin ukuran saku praktis",
      price: 12000,
      stock: 80,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Jumbo",
      slug: "yasin-jumbo-001",
      description: "Buku yasin ukuran besar tulisan jelas",
      price: 35000,
      stock: 45,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Kaligrafi",
      slug: "yasin-kaligrafi-001",
      description: "Buku yasin cover kaligrafi indah",
      price: 28000,
      stock: 55,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1585842378054-ee55e993549f?w=800&q=80",
      ],
    },
    {
      name: "Paket Yasin 50 Buku",
      slug: "paket-yasin-50",
      description: "Paket hemat 50 buku yasin untuk acara tahlilan",
      price: 600000,
      stock: 10,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Cover Hijau",
      slug: "yasin-hijau-001",
      description: "Buku yasin cover hijau simple",
      price: 20000,
      stock: 70,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
      ],
    },
    {
      name: "Buku Yasin Eksklusif",
      slug: "yasin-eksklusif-001",
      description: "Buku yasin eksklusif kualitas terbaik",
      price: 45000,
      stock: 30,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Paket Yasin 100 Buku",
      slug: "paket-yasin-100",
      description: "Paket hemat 100 buku yasin harga grosir",
      price: 1100000,
      stock: 5,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80",
      ],
    },

    // Al-Qur'an (7 products)
    {
      name: "Al-Qur'an Tajwid Sedang",
      slug: "quran-tajwid-sedang-001",
      description: "Al-Qur'an ukuran sedang dengan tajwid warna",
      price: 75000,
      stock: 40,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Terjemah",
      slug: "quran-terjemah-001",
      description: "Al-Qur'an dengan terjemah bahasa Indonesia",
      price: 85000,
      stock: 35,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Jumbo",
      slug: "quran-jumbo-001",
      description: "Al-Qur'an ukuran besar mudah dibaca",
      price: 120000,
      stock: 25,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Mini",
      slug: "quran-mini-001",
      description: "Al-Qur'an ukuran mini praktis dibawa",
      price: 45000,
      stock: 50,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Rainbow",
      slug: "quran-rainbow-001",
      description: "Al-Qur'an dengan tajwid warna rainbow",
      price: 95000,
      stock: 30,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Premium Hardcover",
      slug: "quran-premium-hardcover-001",
      description: "Al-Qur'an hardcover eksklusif berkualitas",
      price: 150000,
      stock: 20,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
    {
      name: "Al-Qur'an Per Juz",
      slug: "quran-per-juz-001",
      description: "Al-Qur'an dibagi per juz lengkap 30 juz",
      price: 200000,
      stock: 15,
      categoryId: categories[1].id,
      images: [
        "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&q=80",
      ],
    },
  ];

  for (const productData of products) {
    await prisma.product.create({ data: productData });
  }
  console.log(`✅ Created ${products.length} products`);

  // Create a sample order for test customer
  console.log("🛒 Creating sample order...");

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}-SAMPLE`,
      userId: customer.id,
      totalAmount: 125000, // (25000 x 2) + 75000
      status: "PENDING",
      shippingAddress: customer.address!,
      shippingPhone: customer.phone!,
      notes: "Pesanan buku yasin untuk tahlilan 40 hari ayah",
      items: {
        create: [
          {
            productId: (await prisma.product.findFirst({ where: { slug: "yasin-hardcover-premium-001" } }))!.id,
            quantity: 2,
            price: 25000,
          },
          {
            productId: (await prisma.product.findFirst({ where: { slug: "quran-tajwid-sedang-001" } }))!.id,
            quantity: 1,
            price: 75000,
          },
        ],
      },
    },
  });

  // Create payment for sample order
  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      bankName: "BCA",
      accountNumber: "2831373298",
      accountName: "ACHMAD MUSLIM",
      amount: 125000,
      status: "PENDING",
    },
  });

  console.log("✅ Sample order created");

  console.log("\n✨ Database seed completed!");
  console.log("\n📊 Summary:");
  console.log(`   - Admin user: admin@ecommerce.com / admin123`);
  console.log(`   - Test customer: customer@example.com / customer123`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Sample orders: 1`);
  console.log("\n🚀 Ready to test!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
