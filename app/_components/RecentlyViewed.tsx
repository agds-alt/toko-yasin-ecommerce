"use client";

import { useRecentlyViewed } from "../_contexts/RecentlyViewedContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock } from "lucide-react";

export default function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();
  const router = useRouter();

  // Don't show if no recently viewed products
  if (recentlyViewed.length === 0) {
    return null;
  }

  // Show only first 10 products
  const displayProducts = recentlyViewed.slice(0, 10);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl shadow-xl p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Baru Dilihat
          </h2>
          <p className="text-sm text-gray-600">
            {recentlyViewed.length} produk yang baru kamu lihat
          </p>
        </div>
      </div>

      {/* Horizontal scrollable on mobile, grid on desktop */}
      <div className="overflow-x-auto -mx-2 px-2 md:overflow-visible">
        <div className="flex md:grid md:grid-cols-5 gap-4 pb-2">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-40 md:w-auto group cursor-pointer"
              onClick={() => router.push(`/products/${product.slug}`)}
            >
              <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-3 shadow-md relative">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-3xl">📦</span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
                  {product.name}
                </h4>
                {product.categoryName && (
                  <p className="text-xs text-gray-500 mb-1">
                    {product.categoryName}
                  </p>
                )}
                <p className="text-base md:text-lg font-bold text-purple-600">
                  Rp {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View count badge */}
      {recentlyViewed.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            dan {recentlyViewed.length - 10} produk lainnya
          </p>
        </div>
      )}
    </div>
  );
}
