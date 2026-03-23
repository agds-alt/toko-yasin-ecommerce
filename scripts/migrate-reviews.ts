/**
 * Migration Script: Update Product Rating Statistics
 *
 * This script updates averageRating and reviewCount for all products
 * based on existing reviews in the database.
 *
 * Run with: npx tsx scripts/migrate-reviews.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateProductRatingStats(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: totalReviews,
    },
  });

  return { productId, averageRating, totalReviews };
}

async function main() {
  console.log("🔄 Starting migration: Update product rating statistics...\n");

  // Get all products
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  console.log(`📦 Found ${products.length} products\n`);

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    try {
      const result = await updateProductRatingStats(product.id);

      if (result.totalReviews > 0) {
        console.log(
          `✅ ${product.name}: ${result.averageRating.toFixed(1)} stars (${result.totalReviews} reviews)`
        );
        updated++;
      } else {
        console.log(`⏭️  ${product.name}: No reviews yet`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error updating ${product.name}:`, error);
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Updated: ${updated} products`);
  console.log(`   Skipped: ${skipped} products (no reviews)`);
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
