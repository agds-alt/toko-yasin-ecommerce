"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/app/_components/Navbar";
import { useSession } from "next-auth/react";

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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const orderId = params.id as string;

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: order, isLoading, refetch } = trpc.order.getById.useQuery(
    { orderId: orderId },
    { enabled: status === "authenticated" && !!orderId }
  );

  const uploadPayment = trpc.order.uploadPaymentProof.useMutation({
    onSuccess: () => {
      alert("✅ Bukti transfer berhasil diupload!");
      refetch();
      setProofFile(null);
      setPreviewUrl("");
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
      setIsUploading(false);
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
            <p className="text-gray-600">Memuat detail pesanan...</p>
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Pesanan Tidak Ditemukan</h1>
            <button
              onClick={() => router.push("/orders")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Riwayat Pesanan
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile || !order.payment) return;

    setIsUploading(true);

    try {
      // Upload ke Cloudinary via API endpoint
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      formData.append("folder", "payments");

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const cloudinaryData = await cloudinaryRes.json();

      if (!cloudinaryRes.ok) {
        throw new Error("Upload ke Cloudinary gagal");
      }

      // Save URL ke database via tRPC
      uploadPayment.mutate({
        orderId: order.id,
        proofImageUrl: cloudinaryData.secure_url,
      });
    } catch (error) {
      alert(`❌ Error upload: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsUploading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm">
            <ol className="flex items-center gap-2 text-gray-500">
              <li>
                <button onClick={() => router.push("/")} className="hover:text-blue-600">
                  Beranda
                </button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push("/orders")} className="hover:text-blue-600">
                  Pesanan
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-semibold">{order.orderNumber}</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8 bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{order.orderNumber}</h1>
                <p className="text-gray-600">
                  Dibuat pada {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <span className={`px-6 py-3 rounded-xl text-lg font-bold border-2 ${statusColors[order.status]}`}>
                  {statusText[order.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Products */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📦 Produk Pesanan
                </h2>

                <div className="space-y-4">
                  {order.items.map((item) => {
                    const images = Array.isArray(item.product.images) ? item.product.images : [];
                    const imageUrl = images[0] || "/placeholder.png";

                    return (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-contain bg-gray-100 rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{item.product.name}</h3>

                          {/* Variant Info */}
                          {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.entries(item.variant as Record<string, string>).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-xs px-2 py-1 rounded-full border font-medium bg-gray-50 text-gray-600 border-gray-300"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-sm text-gray-600 mb-2">
                            {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                          </p>
                          <p className="font-bold text-blue-600">
                            Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  🚚 Informasi Pengiriman
                </h2>

                <div className="space-y-3 text-gray-700">
                  <div>
                    <span className="font-semibold">Alamat:</span>
                    <p className="mt-1 text-gray-600 whitespace-pre-wrap">{order.shippingAddress}</p>
                  </div>
                  <div>
                    <span className="font-semibold">No. Telepon:</span>
                    <p className="mt-1 text-gray-600">{order.shippingPhone}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <span className="font-semibold">Catatan:</span>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Payment Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  💰 Pembayaran
                </h2>

                {order.payment && (
                  <div className="space-y-4">
                    {/* Bank Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Transfer ke:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-sm text-gray-600">Bank:</span>
                          <span className="font-bold text-gray-900">{order.payment.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-sm text-gray-600">No. Rek:</span>
                          <span className="font-bold text-gray-900">{order.payment.accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-sm text-gray-600">A/N:</span>
                          <span className="font-bold text-gray-900">{order.payment.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                          <span className="text-sm text-gray-600">Jumlah:</span>
                          <span className="font-bold text-blue-600">
                            Rp {Number(order.payment.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Status Pembayaran:</p>
                      <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold border-2 ${
                        order.payment.status === "VERIFIED" ? "bg-green-100 text-green-800 border-green-300" :
                        order.payment.status === "UPLOADED" ? "bg-blue-100 text-blue-800 border-blue-300" :
                        order.payment.status === "REJECTED" ? "bg-red-100 text-red-800 border-red-300" :
                        "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }`}>
                        {order.payment.status === "VERIFIED" && "✅ Terverifikasi"}
                        {order.payment.status === "UPLOADED" && "📤 Menunggu Verifikasi"}
                        {order.payment.status === "REJECTED" && "❌ Ditolak"}
                        {order.payment.status === "PENDING" && "⏳ Menunggu Upload"}
                      </span>
                    </div>

                    {/* Upload Proof */}
                    {order.payment.status === "PENDING" && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Upload Bukti Transfer:</p>

                        {previewUrl && (
                          <div className="mb-4">
                            <img src={previewUrl} alt="Preview" className="w-full rounded-xl border-2 border-gray-300" />
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="proof-upload"
                        />

                        <label
                          htmlFor="proof-upload"
                          className="block w-full text-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 cursor-pointer transition-all mb-3"
                        >
                          📷 Pilih Foto
                        </label>

                        <button
                          onClick={handleUploadProof}
                          disabled={!proofFile || isUploading}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl shadow-xl disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Mengupload...
                            </>
                          ) : (
                            <>📤 Upload Bukti</>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Proof Image */}
                    {order.payment.proofImage && (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Bukti Transfer:</p>
                        <img
                          src={order.payment.proofImage}
                          alt="Bukti Transfer"
                          className="w-full rounded-xl border-2 border-gray-300"
                        />
                      </div>
                    )}

                    {/* Admin Notes */}
                    {order.payment.notes && (
                      <div className="mt-4 bg-red-50 border-2 border-red-200 p-4 rounded-xl">
                        <p className="text-sm font-semibold text-red-900 mb-2">Catatan Admin:</p>
                        <p className="text-sm text-red-800">{order.payment.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => router.push("/orders")}
                  className="w-full mt-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border-2 border-gray-300 transition-all"
                >
                  ← Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
