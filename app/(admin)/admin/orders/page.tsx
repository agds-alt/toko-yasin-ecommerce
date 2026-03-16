"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Eye, CheckCircle, XCircle, Search } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_UPLOADED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusOptions = [
  "PENDING",
  "PAYMENT_UPLOADED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export default function AdminOrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");

  const { data: ordersData, isLoading, refetch } = trpc.order.getAll.useQuery({
    status: selectedStatus as any,
    limit: 50,
  });

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const verifyPayment = trpc.order.verifyPayment.useMutation({
    onSuccess: () => {
      alert("✅ Pembayaran berhasil diverifikasi!");
      setShowVerifyModal(false);
      setSelectedOrder(null);
      setVerifyNotes("");
      refetch();
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-gray-600 mt-1">
          Kelola dan verifikasi pembayaran pesanan
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus(undefined)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              !selectedStatus
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tidak ada pesanan
            </h3>
            <p className="text-gray-600">
              {selectedStatus
                ? `Tidak ada pesanan dengan status ${selectedStatus}`
                : "Belum ada pesanan masuk"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                    Bukti Transfer
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-700">
                        {order.orderNumber}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.user.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">
                        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus.mutate({
                            orderId: order.id,
                            status: e.target.value as any,
                          })
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      {order.payment?.proofImage ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowVerifyModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Belum upload
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        {order.payment?.proofImage &&
                          order.payment?.status === "UPLOADED" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowVerifyModal(true);
                                }}
                                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-all"
                                title="Verifikasi"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Payment Modal */}
      {showVerifyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Verifikasi Pembayaran
            </h3>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold">
                    Rp{" "}
                    {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Bank</p>
                  <p className="font-semibold">
                    {selectedOrder.payment?.bankName}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Produk yang Dipesan
              </p>
              <div className="space-y-3">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3 flex gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product.name}</p>

                      {/* Variant Info */}
                      {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 mb-2">
                          {Object.entries(item.variant as Record<string, string>).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs px-2 py-0.5 rounded-full border font-medium bg-white text-gray-600 border-gray-300"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-gray-600">
                        {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Proof */}
            {selectedOrder.payment?.proofImage && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Bukti Transfer
                </p>
                <img
                  src={selectedOrder.payment.proofImage}
                  alt="Bukti Transfer"
                  className="w-full rounded-xl border-2 border-gray-200"
                />
              </div>
            )}

            {/* Verify Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan (opsional)
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Tambahkan catatan jika perlu..."
              />
            </div>

            {/* Reject Notes (if rejecting) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alasan Penolakan (wajib jika tolak)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                placeholder="Alasan penolakan pembayaran..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedOrder(null);
                  setVerifyNotes("");
                  setRejectNotes("");
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!rejectNotes.trim()) {
                    alert("Masukkan alasan penolakan");
                    return;
                  }
                  verifyPayment.mutate({
                    orderId: selectedOrder.id,
                    approve: false,
                    notes: rejectNotes,
                  });
                }}
                disabled={verifyPayment.isPending}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                {verifyPayment.isPending ? "Menolak..." : "Tolak"}
              </button>
              <button
                onClick={() => {
                  verifyPayment.mutate({
                    orderId: selectedOrder.id,
                    approve: true,
                    notes: verifyNotes,
                  });
                }}
                disabled={verifyPayment.isPending}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                {verifyPayment.isPending ? "Verifikasi..." : "Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
