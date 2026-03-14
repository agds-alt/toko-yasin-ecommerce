"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data: cart, isLoading, refetch } = trpc.cart.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const updateQuantity = trpc.cart.updateQuantity.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => refetch(),
  });

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Diperlukan</h1>
            <p className="text-gray-600 mb-6">
              Silakan login terlebih dahulu untuk melihat keranjang belanja Anda.
            </p>
            <button
              onClick={() => router.push("/auth/login")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Login Sekarang
            </button>
          </div>
        </div>
      </>
    );
  }

  if (isLoading || status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat keranjang...</p>
          </div>
        </div>
      </>
    );
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity.mutate({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    if (confirm("Hapus produk dari keranjang?")) {
      removeItem.mutate({ itemId });
    }
  };

  const handleClearCart = () => {
    if (confirm("Kosongkan seluruh keranjang belanja?")) {
      clearCart.mutate();
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">🛒 Keranjang Belanja</h1>
            <p className="text-gray-600">
              {items.length > 0 ? `${totalItems} produk dalam keranjang` : "Keranjang kosong"}
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart */
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">🛒</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Keranjang Kosong</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Belum ada produk di keranjang. Yuk mulai belanja!
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            /* Cart Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {/* Clear Cart Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleClearCart}
                    disabled={clearCart.isPending}
                    className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-2 hover:underline"
                  >
                    🗑️ Kosongkan Keranjang
                  </button>
                </div>

                {/* Cart Items List */}
                {items.map((item) => {
                  const images = Array.isArray(item.product.images) ? item.product.images : [];
                  const imageUrl = images[0] || "/placeholder.png";

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-100"
                    >
                      <div className="flex gap-6">
                        {/* Product Image */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                                {item.product.name}
                              </h3>
                              {item.product.category && (
                                <p className="text-sm text-gray-500 mb-2">
                                  {item.product.category.name}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={removeItem.isPending}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all ml-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {/* Price & Quantity */}
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* Quantity Control */}
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-semibold text-gray-700">Jumlah:</label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || updateQuantity.isPending}
                                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-8 h-8 rounded-lg transition-all"
                                >
                                  -
                                </button>
                                <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || updateQuantity.isPending}
                                  className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-8 h-8 rounded-lg transition-all"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm text-gray-500 mb-1">
                                Rp {Number(item.product.price).toLocaleString("id-ID")} x {item.quantity}
                              </p>
                              <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                Rp {(Number(item.product.price) * item.quantity).toLocaleString("id-ID")}
                              </p>
                            </div>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity > item.product.stock && (
                            <p className="text-sm text-red-600 font-semibold mt-2">
                              ⚠️ Stok tidak mencukupi (tersisa {item.product.stock})
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Belanja</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Produk</span>
                      <span className="font-semibold">{totalItems} item</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold">Rp {totalAmount.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <span>💳 Checkout</span>
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full mt-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 transition-all"
                  >
                    ← Lanjut Belanja
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
