"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/app/_components/Navbar";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    shippingAddress: "",
    shippingPhone: "",
    notes: "",
    bankName: "BCA",
    accountNumber: "1234567890",
    accountName: "Toko Yasin",
  });

  const { data: cart, isLoading: cartLoading } = trpc.cart.get.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      alert(`✅ Pesanan berhasil dibuat!\nOrder Number: ${data.orderNumber}`);
      router.push(`/orders/${data.id}`);
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
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
              Silakan login terlebih dahulu untuk checkout.
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

  if (cartLoading || status === "loading") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </>
    );
  }

  const items = cart?.items || [];
  const totalAmount = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  // Redirect if cart empty
  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.shippingAddress || !formData.shippingPhone) {
      alert("⚠️ Mohon lengkapi alamat dan nomor telepon");
      return;
    }

    createOrder.mutate(formData);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">💳 Checkout</h1>
            <p className="text-gray-600">Lengkapi data pengiriman dan pembayaran</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    📦 Informasi Pengiriman
                  </h2>

                  <div className="space-y-4">
                    {/* Alamat */}
                    <div>
                      <label htmlFor="shippingAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        placeholder="Jl. Contoh No. 123, RT/RW 01/02, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="shippingPhone" className="block text-sm font-semibold text-gray-700 mb-2">
                        No. Telepon *
                      </label>
                      <input
                        id="shippingPhone"
                        name="shippingPhone"
                        type="tel"
                        value={formData.shippingPhone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        placeholder="08123456789"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                        Catatan (opsional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                        placeholder="Catatan untuk penjual (warna, ukuran, dll)"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    💰 Informasi Pembayaran
                  </h2>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Cara Pembayaran:</p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Klik tombol "Buat Pesanan"</li>
                      <li>Transfer ke rekening yang tertera di bawah</li>
                      <li>Upload bukti transfer di halaman order</li>
                      <li>Tunggu konfirmasi admin (max 1x24 jam)</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    {/* Bank Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bank Tujuan Transfer
                      </label>
                      <select
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                      >
                        <option value="BCA">BCA</option>
                        <option value="BNI">BNI</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BRI">BRI</option>
                      </select>
                    </div>

                    {/* Account Info - Read Only */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-gray-700 mb-3 font-semibold">Transfer ke rekening:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">Bank:</span>
                          <span className="font-bold text-gray-900">{formData.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">No. Rekening:</span>
                          <span className="font-bold text-gray-900">{formData.accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-gray-600 text-sm">Atas Nama:</span>
                          <span className="font-bold text-gray-900">{formData.accountName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan Pesanan</h2>

                  {/* Products List */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => {
                      const images = Array.isArray(item.product.images) ? item.product.images : [];
                      const imageUrl = images[0] || "/placeholder.png";

                      return (
                        <div key={item.id} className="flex gap-3 pb-3 border-b border-gray-200">
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-16 h-16 object-contain bg-gray-100 rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x Rp {Number(item.product.price).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="border-t-2 border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Rp {totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Biaya pengiriman akan ditentukan kemudian</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={createOrder.isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {createOrder.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Memproses...
                      </>
                    ) : (
                      <>✓ Buat Pesanan</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/cart")}
                    className="w-full mt-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 transition-all"
                  >
                    ← Kembali ke Keranjang
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
