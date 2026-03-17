"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Eye, CheckCircle, XCircle, Search, Truck } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAYMENT_UPLOADED: "bg-orange-100 text-orange-800",
  CONFIRMED: "bg-green-100 text-green-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
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
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [verifyNotes, setVerifyNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courier, setCourier] = useState("");

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

  const uploadTracking = trpc.admin.uploadTracking.useMutation({
    onSuccess: () => {
      alert("✅ Nomor resi berhasil diupload! Pesanan otomatis berubah status menjadi SHIPPED");
      setShowTrackingModal(false);
      setSelectedOrder(null);
      setTrackingNumber("");
      setCourier("");
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
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-xs md:text-base text-gray-600 mt-1">
          Kelola dan verifikasi pembayaran pesanan
        </p>
      </div>

      {/* Filter - Horizontal scroll on mobile */}
      <div className="bg-white rounded-xl shadow-md p-3 md:p-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => setSelectedStatus(undefined)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                !selectedStatus
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === status
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders - Table for desktop, Cards for mobile */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-16 text-center">
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
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
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
                            className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1"
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
                          {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowTrackingModal(true);
                              }}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                              title="Upload Resi"
                            >
                              <Truck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-gray-700 truncate">
                      {order.orderNumber}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(order.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus.mutate({
                        orderId: order.id,
                        status: e.target.value as any,
                      })
                    }
                    className={`px-2 py-1 rounded-full text-[10px] font-semibold cursor-pointer ${
                      statusColors[order.status]
                    }`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer */}
                <div className="mb-3 pb-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-900">
                    {order.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.user.email}
                  </p>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-600">Total:</span>
                  <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                    Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {order.payment?.proofImage ? (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowVerifyModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Lihat Bukti
                    </button>
                  ) : (
                    <div className="flex-1 px-3 py-2 bg-gray-50 text-gray-400 font-semibold text-xs rounded-lg text-center">
                      Belum upload
                    </div>
                  )}

                  {order.payment?.proofImage &&
                    order.payment?.status === "UPLOADED" && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowVerifyModal(true);
                        }}
                        className="px-3 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                        title="Verifikasi"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}

                  {(order.status === "CONFIRMED" || order.status === "PROCESSING") && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowTrackingModal(true);
                      }}
                      className="px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                      title="Upload Resi"
                    >
                      <Truck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Verify Payment Modal */}
      {showVerifyModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl p-4 md:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              Verifikasi Pembayaran
            </h3>

            {/* Order Info */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-semibold truncate">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-semibold truncate">{selectedOrder.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold text-orange-600">
                    Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}
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
            <div className="mb-4 md:mb-6">
              <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                Produk yang Dipesan
              </p>
              <div className="space-y-2 md:space-y-3 max-h-40 md:max-h-60 overflow-y-auto">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-2 md:p-3 flex gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">{item.product.name}</p>

                      {/* Variant Info */}
                      {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 mb-1">
                          {Object.entries(item.variant as Record<string, string>).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border font-medium bg-white text-gray-600 border-gray-300"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] md:text-sm text-gray-600">
                        {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-xs md:text-sm">
                        Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Proof */}
            {selectedOrder.payment?.proofImage && (
              <div className="mb-4 md:mb-6">
                <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">
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
            <div className="mb-3 md:mb-6">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                Catatan (opsional)
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                rows={2}
                className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                placeholder="Tambahkan catatan jika perlu..."
              />
            </div>

            {/* Reject Notes (if rejecting) */}
            <div className="mb-4 md:mb-6">
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                Alasan Penolakan (wajib jika tolak)
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={2}
                className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                placeholder="Alasan penolakan pembayaran..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setSelectedOrder(null);
                  setVerifyNotes("");
                  setRejectNotes("");
                }}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
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
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
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
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                {verifyPayment.isPending ? "Verifikasi..." : "Verifikasi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-2xl p-4 md:p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              Upload Nomor Resi
            </h3>

            {/* Order Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-semibold truncate">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-semibold truncate">{selectedOrder.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold text-blue-600">
                    Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Alamat Pengiriman</p>
                  <p className="font-semibold truncate">{selectedOrder.shippingAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4 md:mb-6">
              <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2 md:mb-3">
                Produk yang Dikirim
              </p>
              <div className="space-y-2 md:space-y-3 max-h-40 md:max-h-60 overflow-y-auto">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-2 md:p-3 flex gap-2 md:gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">{item.product.name}</p>

                      {/* Variant Info */}
                      {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 mb-1">
                          {Object.entries(item.variant as Record<string, string>).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full border font-medium bg-white text-gray-600 border-gray-300"
                            >
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-[10px] md:text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Form */}
            <div className="space-y-4 mb-4 md:mb-6">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Nama Kurir <span className="text-red-600">*</span>
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                >
                  <option value="">Pilih Kurir</option>
                  <option value="JNE">JNE</option>
                  <option value="J&T Express">J&T Express</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="Anteraja">Anteraja</option>
                  <option value="Ninja Express">Ninja Express</option>
                  <option value="ID Express">ID Express</option>
                  <option value="Pos Indonesia">Pos Indonesia</option>
                  <option value="Grab Express">Grab Express</option>
                  <option value="Gojek">Gojek</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                  Nomor Resi <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Masukkan nomor resi pengiriman"
                />
              </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
              <p className="text-xs md:text-sm text-blue-800">
                <strong>Info:</strong> Setelah upload resi, status pesanan akan otomatis berubah menjadi <strong>SHIPPED</strong> dan customer akan menerima notifikasi email berisi nomor resi.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => {
                  setShowTrackingModal(false);
                  setSelectedOrder(null);
                  setTrackingNumber("");
                  setCourier("");
                }}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!courier.trim()) {
                    alert("Pilih kurir terlebih dahulu");
                    return;
                  }
                  if (!trackingNumber.trim()) {
                    alert("Masukkan nomor resi");
                    return;
                  }
                  uploadTracking.mutate({
                    orderId: selectedOrder.id,
                    trackingNumber: trackingNumber.trim(),
                    courier: courier.trim(),
                  });
                }}
                disabled={uploadTracking.isPending}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all"
              >
                {uploadTracking.isPending ? "Uploading..." : "Upload Resi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
