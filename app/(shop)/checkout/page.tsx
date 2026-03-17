"use client";

import Navbar from "@/app/_components/Navbar";
import { useCart } from "@/app/_contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, MapPin, Phone, MessageSquare, CreditCard, ChevronDown, ChevronUp } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingPhone: session?.user?.phone || "",
    notes: "",
    bankName: "BCA", // Default bank
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const createOrder = trpc.order.createFromCart.useMutation({
    onSuccess: (data) => {
      clearCart();
      router.push(`/orders/${data.id}`);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shippingAddress || !formData.shippingPhone) {
      alert("Mohon lengkapi alamat dan nomor telepon");
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice,
        shippingAddress: formData.shippingAddress,
        shippingPhone: formData.shippingPhone,
        notes: formData.notes,
        bankName: formData.bankName,
      });
    } catch (error) {
      // Error handled by onError
    }
  };

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-32 md:pb-12 md:py-12">
        <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Header - Compact on mobile */}
          <div className="mb-4 md:mb-8 px-2 md:px-0 pt-2 md:pt-0">
            <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2 text-gray-900">
              Checkout
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Lengkapi data pengiriman Anda
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-3 md:space-y-6">
                {/* Shipping Address */}
                <div className="bg-white md:rounded-lg p-4 md:p-6 md:shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                      Alamat Pengiriman
                    </h2>
                  </div>

                  <textarea
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                    placeholder="Masukkan alamat lengkap (Jalan, RT/RW, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos)"
                    rows={4}
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Contact Info */}
                <div className="bg-white md:rounded-lg p-4 md:p-6 md:shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Phone className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                      Nomor Telepon
                    </h2>
                  </div>

                  <input
                    type="tel"
                    value={formData.shippingPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingPhone: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                    required
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Notes (Optional) */}
                <div className="bg-white md:rounded-lg p-4 md:p-6 md:shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                      Catatan (Opsional)
                    </h2>
                  </div>

                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Tambahkan catatan untuk penjual (opsional)"
                    rows={3}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white md:rounded-lg p-4 md:p-6 md:shadow-sm">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                    <h2 className="text-base md:text-xl font-bold text-gray-900">
                      Metode Pembayaran
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs md:text-sm text-gray-600">
                      Transfer Bank Manual
                    </p>

                    {/* Bank Selection */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      {["BCA", "BNI", "Mandiri", "BRI"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setFormData({ ...formData, bankName: bank })}
                          className={`px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 rounded-lg font-semibold transition-all ${
                            formData.bankName === bank
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-gray-300 bg-white text-gray-900 hover:border-orange-500"
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4 mt-3">
                      <p className="text-xs md:text-sm font-semibold text-orange-900 mb-2">
                        Informasi Transfer:
                      </p>
                      <div className="text-xs md:text-sm text-orange-800 space-y-1">
                        <p>Bank: {formData.bankName}</p>
                        <p>No. Rekening: {
                          formData.bankName === "BCA" ? "2831373298" :
                          formData.bankName === "Mandiri" ? "1270010509626" :
                          formData.bankName === "BRI" ? "059801057922509" :
                          formData.bankName === "BNI" ? "2831373298" : "2831373298"
                        }</p>
                        <p>Atas Nama: ACHMAD MUSLIM</p>
                      </div>
                    </div>

                    <p className="text-xs md:text-sm mt-3 text-gray-600">
                      Anda akan diarahkan ke halaman upload bukti pembayaran setelah order dibuat
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary - Desktop */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Ringkasan Pesanan
                    </h2>
                  </div>

                  <div className="space-y-3 mb-6">
                    {/* Products List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-2 text-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-contain bg-gray-50 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-gray-600">
                              {item.quantity}x Rp {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">
                          Subtotal ({items.length} item)
                        </span>
                        <span className="font-semibold text-gray-900">
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-white font-semibold rounded-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="w-full mt-3 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-all"
                  >
                    Kembali ke Keranjang
                  </button>

                  <p className="text-xs text-center mt-3 text-gray-600">
                    Dengan melanjutkan, Anda menyetujui syarat & ketentuan
                  </p>
                </div>
              </div>

              {/* Order Summary - Mobile Collapsible */}
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full bg-white p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-bold text-gray-900">
                      Ringkasan Pesanan ({items.length} item)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-orange-600">
                      Rp {totalPrice.toLocaleString("id-ID")}
                    </span>
                    {showOrderSummary ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                </button>

                {showOrderSummary && (
                  <div className="bg-white p-4 border-t border-gray-200">
                    {/* Products List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-2 text-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-contain bg-gray-50 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-gray-900 text-xs">
                              {item.name}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {item.quantity}x Rp {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Subtotal</span>
                        <span className="text-sm font-semibold text-gray-900">
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Sticky Bottom Action Bar - Mobile Only */}
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40"
            style={{paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'}}
          >
            <div className="flex items-center gap-3">
              {/* Total Price */}
              <div className="flex-1">
                <p className="text-xs text-gray-600">Total Pembayaran</p>
                <p className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <span className="text-sm">Buat Pesanan</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
