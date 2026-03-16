"use client";

import Navbar from "@/app/_components/Navbar";
import { useCart } from "@/app/_contexts/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, MapPin, Phone, MessageSquare, CreditCard } from "lucide-react";

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

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold mb-2"
              style={{
                color: "var(--gray-900)",
                fontFamily: "Urbanist",
              }}
            >
              Checkout
            </h1>
            <p className="text-base" style={{ color: "var(--gray-60)" }}>
              Lengkapi data pengiriman Anda
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--gray-900)", fontFamily: "Urbanist" }}
                    >
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
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    style={{ borderColor: "var(--gray-30)" }}
                  />
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--gray-900)", fontFamily: "Urbanist" }}
                    >
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
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    style={{ borderColor: "var(--gray-30)" }}
                  />
                </div>

                {/* Notes (Optional) */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--gray-900)", fontFamily: "Urbanist" }}
                    >
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
                    className="w-full px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    style={{ borderColor: "var(--gray-30)" }}
                  />
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--gray-900)", fontFamily: "Urbanist" }}
                    >
                      Metode Pembayaran
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm" style={{ color: "var(--gray-60)" }}>
                      Transfer Bank Manual
                    </p>

                    {/* Bank Selection */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {["BCA", "BNI", "Mandiri", "BRI"].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setFormData({ ...formData, bankName: bank })}
                          className="px-4 py-3 border-2 rounded-lg font-semibold transition-all hover:border-primary"
                          style={{
                            borderColor:
                              formData.bankName === bank ? "var(--primary)" : "var(--gray-30)",
                            backgroundColor:
                              formData.bankName === bank ? "var(--primary-light)" : "white",
                            color:
                              formData.bankName === bank ? "var(--primary)" : "var(--gray-900)",
                          }}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">
                        Informasi Transfer:
                      </p>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>Bank: {formData.bankName}</p>
                        <p>No. Rekening: 1234567890</p>
                        <p>Atas Nama: Toko Yasin</p>
                      </div>
                    </div>

                    <p className="text-sm mt-3" style={{ color: "var(--gray-60)" }}>
                      Anda akan diarahkan ke halaman upload bukti pembayaran setelah order dibuat
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div
                  className="bg-white rounded-lg p-6 shadow-sm sticky top-24"
                  style={{ borderColor: "var(--gray-30)" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    <h2
                      className="text-xl font-bold"
                      style={{ color: "var(--gray-900)", fontFamily: "Urbanist" }}
                    >
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
                            <p
                              className="font-medium truncate"
                              style={{ color: "var(--gray-900)" }}
                            >
                              {item.name}
                            </p>
                            <p style={{ color: "var(--gray-60)" }}>
                              {item.quantity}x Rp {item.price.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t" style={{ borderColor: "var(--gray-30)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: "var(--gray-60)" }}>
                          Subtotal ({items.length} item)
                        </span>
                        <span className="font-semibold" style={{ color: "var(--gray-900)" }}>
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold" style={{ color: "var(--gray-900)" }}>
                          Total
                        </span>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "var(--primary)", fontFamily: "Urbanist" }}
                        >
                          Rp {totalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 text-white font-semibold rounded-full transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {isSubmitting ? "Memproses..." : "Buat Pesanan"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="w-full mt-3 py-3 border-2 font-semibold rounded-full transition-all hover:bg-gray-50"
                    style={{ borderColor: "var(--gray-30)", color: "var(--gray-900)" }}
                  >
                    Kembali ke Keranjang
                  </button>

                  <p className="text-xs text-center mt-3" style={{ color: "var(--gray-60)" }}>
                    Dengan melanjutkan, Anda menyetujui syarat & ketentuan
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
