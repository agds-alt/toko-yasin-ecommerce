"use client";

import { trpc } from "@/lib/trpc";
import { useRouter } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Package, Clock, CheckCircle, Truck, ShoppingBag } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PAYMENT_UPLOADED: "bg-blue-100 text-blue-800 border-blue-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-300",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  CANCELLED: "bg-red-100 text-red-800 border-red-300",
};

const statusText: Record<string, string> = {
  PENDING: "⏳ Menunggu Pembayaran",
  PAYMENT_UPLOADED: "📤 Bukti Transfer Diupload",
  CONFIRMED: "✅ Dikonfirmasi",
  PROCESSING: "📦 Diproses",
  SHIPPED: "🚚 Dikirim",
  DELIVERED: "✓ Selesai",
  CANCELLED: "❌ Dibatalkan",
};

const statusOrder = ["PENDING", "PAYMENT_UPLOADED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const { data: ordersData, isLoading } = trpc.order.getMyOrders.useQuery(undefined, {
    enabled: status === "authenticated",
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
              Silakan login terlebih dahulu untuk melihat riwayat pesanan.
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
            <p className="text-gray-600">Memuat pesanan...</p>
          </div>
        </div>
      </>
    );
  }

  const ordersList = ordersData?.orders || [];

  // Filter orders by status
  const filteredOrders = filterStatus
    ? ordersList.filter(order => order.status === filterStatus)
    : ordersList;

  // Get status progress
  const getStatusProgress = (currentStatus: string) => {
    if (currentStatus === "CANCELLED") return 0;
    const index = statusOrder.indexOf(currentStatus);
    return ((index + 1) / statusOrder.length) * 100;
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">📋 Riwayat Pesanan</h1>
            <p className="text-gray-600">
              {ordersList.length > 0
                ? `${ordersList.length} pesanan`
                : "Belum ada pesanan"}
            </p>
          </div>

          {/* Status Filter */}
          {ordersList.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    !filterStatus
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semua ({ordersList.length})
                </button>
                {["PENDING", "PAYMENT_UPLOADED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"].map((status) => {
                  const count = ordersList.filter(o => o.status === status).length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        filterStatus === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {statusText[status]} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ordersList.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">📦</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Belum Ada Pesanan</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Mulai belanja sekarang dan buat pesanan pertama Anda!
              </p>
              <button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Belanja Sekarang
              </button>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const progress = getStatusProgress(order.status);
                const firstItem = order.items[0];
                const productImage = firstItem?.product?.images?.[0] || "/placeholder.png";

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all border-2 border-gray-100"
                  >
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-100">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${statusColors[order.status]}`}>
                          {statusText[order.status]}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {order.status !== "CANCELLED" && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-2">
                          <span>Progress Pesanan</span>
                          <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs">
                          <div className={`flex items-center gap-1 ${statusOrder.indexOf(order.status) >= 0 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                            <Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </div>
                          <div className={`flex items-center gap-1 ${statusOrder.indexOf(order.status) >= 2 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>Dikonfirmasi</span>
                          </div>
                          <div className={`flex items-center gap-1 ${statusOrder.indexOf(order.status) >= 3 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                            <Package className="w-3 h-3" />
                            <span>Diproses</span>
                          </div>
                          <div className={`flex items-center gap-1 ${statusOrder.indexOf(order.status) >= 4 ? "text-blue-600 font-semibold" : "text-gray-400"}`}>
                            <Truck className="w-3 h-3" />
                            <span>Dikirim</span>
                          </div>
                          <div className={`flex items-center gap-1 ${statusOrder.indexOf(order.status) >= 5 ? "text-green-600 font-semibold" : "text-gray-400"}`}>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Selesai</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Content */}
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Product Preview */}
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={productImage}
                          alt="Product"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.items.length} Produk
                          </p>
                          <p className="text-sm text-gray-600">
                            {firstItem?.product?.name}
                            {order.items.length > 1 && ` +${order.items.length - 1} lainnya`}
                          </p>
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            Total: Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-gray-700 min-w-[80px]">📍 Alamat:</span>
                          <span className="text-gray-600">{order.shippingAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700 min-w-[80px]">📞 Telepon:</span>
                          <span className="text-gray-600">{order.shippingPhone}</span>
                        </div>
                        {order.notes && (
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-gray-700 min-w-[80px]">📝 Catatan:</span>
                            <span className="text-gray-600">{order.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                          Lihat Detail
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
