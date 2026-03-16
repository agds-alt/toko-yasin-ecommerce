"use client";

import Navbar from "../_components/Navbar";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "../_contexts/CartContext";
import { useState } from "react";

export default function WishlistPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Fetch wishlist items
  const { data: wishlistItems, isLoading, refetch } = trpc.wishlist.getAll.useQuery(
    undefined,
    {
      enabled: status === "authenticated",
    }
  );

  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      refetch();
      setRemovingId(null);
    },
  });

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    await removeFromWishlist.mutateAsync({ productId });
  };

  const handleAddToCart = (product: any) => {
    setAddingToCartId(product.id);
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0] || "/placeholder.png",
      quantity: 1,
    });
    setToastMessage(`${product.name} ditambahkan ke keranjang!`);
    setShowToast(true);

    setTimeout(() => {
      setAddingToCartId(null);
      setShowToast(false);
    }, 2000);
  };

  if (isLoading || status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-3 md:py-12 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-3 md:px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-4 md:mb-8">
            {/* Mobile Back Button */}
            <button
              onClick={() => router.back()}
              className="md:hidden flex items-center gap-2 text-gray-700 mb-3 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Kembali</span>
            </button>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 text-gray-900">
              ❤️ Wishlist Saya
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {wishlistItems?.length || 0} produk dalam wishlist
            </p>
          </div>

          {/* Empty State */}
          {!wishlistItems || wishlistItems.length === 0 ? (
            <div className="bg-white rounded-xl md:rounded-2xl shadow-md p-8 md:p-12 text-center">
              <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
                Wishlist Kosong
              </h2>
              <p className="mb-6 text-sm md:text-base text-gray-600">
                Anda belum menambahkan produk ke wishlist
              </p>
              <Link
                href="/"
                className="inline-block px-6 md:px-8 py-2.5 md:py-3 text-white text-sm md:text-base font-semibold rounded-full transition-all hover:opacity-90 bg-gradient-to-r from-orange-600 to-red-600"
              >
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            // Wishlist Grid
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className={`group bg-white rounded-xl md:rounded-2xl border-2 border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    removingId === item.product.id
                      ? "opacity-0 scale-95 pointer-events-none"
                      : "opacity-100 scale-100"
                  }`}
                >
                  {/* Product Image */}
                  <Link href={`/products/${item.product.slug}`}>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={item.product.images[0] || "/placeholder.png"}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Stock Badge */}
                      {item.product.stock > 0 ? (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full">
                          Stok: {item.product.stock}
                        </div>
                      ) : (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] md:text-xs font-bold px-2 py-1 rounded-full">
                          Habis
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-3 md:p-4">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="font-semibold text-xs md:text-base mb-1 hover:text-orange-600 transition-colors line-clamp-2 text-gray-900">
                        {item.product.name}
                      </h3>
                    </Link>

                    {item.product.category && (
                      <p className="text-[10px] md:text-xs mb-2 text-gray-500">
                        {item.product.category.name}
                      </p>
                    )}

                    <p className="font-bold text-sm md:text-lg mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                      Rp {Number(item.product.price).toLocaleString("id-ID")}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        disabled={
                          item.product.stock === 0 ||
                          addingToCartId === item.product.id
                        }
                        className={`flex-1 px-2 md:px-3 py-1.5 md:py-2 text-white text-[11px] md:text-sm font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${
                          item.product.stock === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : addingToCartId === item.product.id
                            ? "bg-green-500 scale-95"
                            : "bg-gradient-to-r from-orange-600 to-red-600 hover:opacity-90 hover:scale-105"
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Keranjang</span>
                        <span className="md:hidden">+</span>
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removingId === item.product.id}
                        className="px-2 md:px-3 py-1.5 md:py-2 border-2 border-gray-200 text-[11px] md:text-sm font-semibold rounded-full transition-all hover:bg-red-50 hover:border-red-300 disabled:opacity-50 text-gray-700 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-2xl flex items-center gap-2 text-sm md:text-base font-semibold">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            <span className="max-w-[200px] md:max-w-none truncate">
              {toastMessage}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
