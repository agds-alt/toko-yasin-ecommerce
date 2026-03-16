"use client";

import Navbar from "../_components/Navbar";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
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
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0] || "/placeholder.png",
      quantity: 1,
    });
    alert(`${product.name} ditambahkan ke keranjang!`);
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

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{
                color: "var(--gray-900)",
                fontFamily: "Urbanist",
              }}
            >
              Wishlist Saya
            </h1>
            <p className="text-base" style={{ color: "var(--gray-60)" }}>
              {wishlistItems?.length || 0} produk dalam wishlist
            </p>
          </div>

          {/* Empty State */}
          {!wishlistItems || wishlistItems.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Heart
                className="w-16 h-16 mx-auto mb-4 opacity-20"
                style={{ color: "var(--gray-900)" }}
              />
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--gray-900)" }}
              >
                Wishlist Kosong
              </h2>
              <p className="mb-6" style={{ color: "var(--gray-60)" }}>
                Anda belum menambahkan produk ke wishlist
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 text-white font-semibold rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--primary)" }}
              >
                Belanja Sekarang
              </Link>
            </div>
          ) : (
            // Wishlist Grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <Link href={`/product/${item.product.slug}`}>
                    <div className="relative aspect-square">
                      <img
                        src={item.product.images[0] || "/placeholder.png"}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3
                        className="font-semibold text-base mb-1 hover:underline line-clamp-2"
                        style={{ color: "var(--gray-900)" }}
                      >
                        {item.product.name}
                      </h3>
                    </Link>

                    {item.product.category && (
                      <p
                        className="text-xs mb-2"
                        style={{ color: "var(--gray-60)" }}
                      >
                        {item.product.category.name}
                      </p>
                    )}

                    <p
                      className="font-bold text-lg mb-3"
                      style={{ color: "var(--primary)" }}
                    >
                      Rp {Number(item.product.price).toLocaleString("id-ID")}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="flex-1 px-3 py-2 text-white text-sm font-semibold rounded-full transition-all hover:opacity-90 flex items-center justify-center gap-1"
                        style={{ backgroundColor: "var(--primary)" }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Keranjang
                      </button>
                      <button
                        onClick={() => handleRemove(item.product.id)}
                        disabled={removingId === item.product.id}
                        className="px-3 py-2 border border-gray-300 text-sm font-semibold rounded-full transition-all hover:bg-gray-50 disabled:opacity-50"
                        style={{ color: "var(--gray-900)" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
