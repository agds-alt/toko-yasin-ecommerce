"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "@/app/_components/Navbar";
import { useSession } from "next-auth/react";
import { Package, Truck, CheckCircle, Clock, XCircle, Upload, Camera, Star } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-300",
  PAYMENT_UPLOADED: "bg-orange-100 text-orange-800 border-orange-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-300",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-300",
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

const statusSteps = [
  { key: "PENDING", label: "Menunggu", icon: Clock },
  { key: "PAYMENT_UPLOADED", label: "Upload Bukti", icon: CheckCircle },
  { key: "CONFIRMED", label: "Dikonfirmasi", icon: CheckCircle },
  { key: "PROCESSING", label: "Diproses", icon: Package },
  { key: "SHIPPED", label: "Dikirim", icon: Truck },
  { key: "DELIVERED", label: "Selesai", icon: CheckCircle },
];

const getStatusIndex = (status: string): number => {
  const index = statusSteps.findIndex(step => step.key === status);
  return index !== -1 ? index : 0;
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const orderId = params.id as string;

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Delivery confirmation states
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryProofFile, setDeliveryProofFile] = useState<File | null>(null);
  const [deliveryPreview, setDeliveryPreview] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryRating, setDeliveryRating] = useState(5); // Default 5 stars
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

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

  const confirmDelivery = trpc.order.confirmDelivery.useMutation({
    onSuccess: () => {
      alert("✅ Pesanan berhasil dikonfirmasi sebagai diterima!");
      setShowDeliveryModal(false);
      setDeliveryProofFile(null);
      setDeliveryPreview("");
      setDeliveryNotes("");
      setDeliveryRating(5);
      refetch();
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
      setIsConfirmingDelivery(false);
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

  const handleDeliveryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5MB");
        return;
      }
      setDeliveryProofFile(file);
      setDeliveryPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order) return;

    setIsConfirmingDelivery(true);

    try {
      let deliveryImageUrl: string | undefined = undefined;

      // Upload image to Cloudinary if provided
      if (deliveryProofFile) {
        const formData = new FormData();
        formData.append("file", deliveryProofFile);
        formData.append("upload_preset", "toko-yasin");
        formData.append("folder", "delivery-proofs");

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

        deliveryImageUrl = cloudinaryData.secure_url;
      }

      // Confirm delivery via tRPC
      confirmDelivery.mutate({
        orderId: order.id,
        deliveryProofImage: deliveryImageUrl,
        deliveryNotes: deliveryNotes.trim() || undefined,
        deliveryRating: deliveryRating,
      });
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsConfirmingDelivery(false);
    }
  };

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-32 md:pb-8 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Breadcrumb - Hidden on mobile */}
          <nav className="hidden md:block mb-6 text-sm px-2">
            <ol className="flex items-center gap-2 text-gray-500">
              <li>
                <button onClick={() => router.push("/")} className="hover:text-orange-600">
                  Beranda
                </button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push("/orders")} className="hover:text-orange-600">
                  Pesanan
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-semibold">{order.orderNumber}</li>
            </ol>
          </nav>

          {/* Header - Compact on mobile */}
          <div className="mb-3 md:mb-8 bg-white md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 md:gap-4">
              <div>
                <h1 className="text-lg md:text-3xl font-extrabold text-gray-900 mb-1 md:mb-2">{order.orderNumber}</h1>
                <p className="text-xs md:text-base text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <span className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-lg font-bold border-2 ${statusColors[order.status]}`}>
                  {statusText[order.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Order Progress Timeline - Shopee Style */}
          {!isCancelled && (
            <div className="mb-3 md:mb-8 bg-white md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-gray-100">
              <h2 className="text-sm md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Status Pesanan</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-4 md:top-5 left-0 right-0 h-0.5 md:h-1 bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {/* Status Steps */}
                <div className="relative flex justify-between">
                  {statusSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-500"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                        </div>
                        <p
                          className={`text-[10px] md:text-xs mt-2 text-center font-semibold ${
                            isActive ? "text-gray-900" : "text-gray-400"
                          } ${isCurrent ? "text-orange-600" : ""}`}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-8">
            {/* Left: Order Details */}
            <div className="lg:col-span-2 space-y-3 md:space-y-6">
              {/* Products */}
              <div className="bg-white md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-gray-100">
                <h2 className="text-base md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  📦 Produk Pesanan
                </h2>

                <div className="space-y-3 md:space-y-4">
                  {order.items.map((item) => {
                    const images = Array.isArray(item.product.images) ? item.product.images : [];
                    const imageUrl = images[0] || "/placeholder.png";

                    return (
                      <div key={item.id} className="flex gap-3 md:gap-4 pb-3 md:pb-4 border-b border-gray-200 last:border-0">
                        <img
                          src={imageUrl}
                          alt={item.product.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-contain bg-gray-100 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 text-sm md:text-base truncate">{item.product.name}</h3>

                          {/* Variant Info */}
                          {item.variant && typeof item.variant === 'object' && Object.keys(item.variant).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {Object.entries(item.variant as Record<string, string>).map(([key, value]) => (
                                <span
                                  key={key}
                                  className="text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full border font-medium bg-gray-50 text-gray-600 border-gray-300"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
                            {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                          </p>
                          <p className="font-bold text-orange-600 text-sm md:text-base">
                            Rp {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="text-base md:text-xl font-bold text-gray-900">Total</span>
                  <span className="text-xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                    Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-gray-100">
                <h2 className="text-base md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
                  🚚 Informasi Pengiriman
                </h2>

                {/* Tracking Info - Show when shipped */}
                {(order.status === "SHIPPED" || order.status === "DELIVERED") && order.trackingNumber && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 md:p-4 mb-4 md:mb-6 border-2 border-blue-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 text-sm md:text-lg mb-2 md:mb-3">📦 Paket Sedang Dikirim!</h4>
                        <div className="space-y-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-800">Kurir:</span>
                            <span className="text-blue-700 font-medium">{order.courier}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-semibold text-blue-800 flex-shrink-0">No. Resi:</span>
                            <span className="text-blue-700 font-mono font-semibold break-all select-all">{order.trackingNumber}</span>
                          </div>
                          {order.shippedAt && (
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-blue-800">Dikirim:</span>
                              <span className="text-blue-700">
                                {new Date(order.shippedAt).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 md:p-3 mt-3">
                      <p className="text-[10px] md:text-xs text-blue-800">
                        💡 <strong>Cara Lacak Paket:</strong> Salin nomor resi di atas dan kunjungi website resmi kurir <strong>{order.courier}</strong> untuk melacak posisi paket Anda.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-gray-700 text-sm md:text-base">
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

              {/* Delivery Confirmation Section - Show when SHIPPED */}
              {order.status === "SHIPPED" && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-green-200">
                  <h2 className="text-base md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    Paket Sudah Sampai?
                  </h2>

                  <p className="text-xs md:text-sm text-gray-700 mb-4">
                    Jika paket sudah Anda terima, silakan konfirmasi penerimaan paket. Upload foto bukti penerimaan bersifat opsional.
                  </p>

                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Konfirmasi Penerimaan Paket
                  </button>
                </div>
              )}

              {/* Show Delivery Info when DELIVERED */}
              {order.status === "DELIVERED" && order.deliveredAt && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 md:rounded-2xl md:shadow-xl p-4 md:p-6 md:border-2 md:border-green-200">
                  <h2 className="text-base md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                    ✅ Pesanan Selesai
                  </h2>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs md:text-sm font-semibold text-gray-700">Dikonfirmasi pada:</span>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {new Date(order.deliveredAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {order.deliveryRating && (
                      <div>
                        <span className="text-xs md:text-sm font-semibold text-gray-700">Rating Pengalaman:</span>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= order.deliveryRating!
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="text-xs md:text-sm text-gray-600 ml-2">
                            ({order.deliveryRating}/5)
                          </span>
                        </div>
                      </div>
                    )}

                    {order.deliveryProofImage && (
                      <div>
                        <span className="text-xs md:text-sm font-semibold text-gray-700">Bukti Penerimaan:</span>
                        <img
                          src={order.deliveryProofImage}
                          alt="Bukti Penerimaan"
                          className="w-full rounded-xl border-2 border-gray-300 mt-2"
                        />
                      </div>
                    )}

                    {order.deliveryNotes && (
                      <div>
                        <span className="text-xs md:text-sm font-semibold text-gray-700">Catatan:</span>
                        <p className="text-xs md:text-sm text-gray-600 mt-1 whitespace-pre-wrap">{order.deliveryNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Payment Info - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4 border-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  💰 Pembayaran
                </h2>

                {order.payment && (
                  <div className="space-y-4">
                    {/* Bank Info */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border-2 border-orange-200">
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
                          <span className="font-bold text-orange-600">
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
                        order.payment.status === "UPLOADED" ? "bg-orange-100 text-orange-800 border-orange-300" :
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
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl shadow-xl disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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

            {/* Payment Info - Mobile */}
            <div className="lg:hidden">
              <div className="bg-white md:rounded-2xl md:shadow-xl p-4 md:border-2 md:border-gray-100">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  💰 Pembayaran
                </h2>

                {order.payment && (
                  <div className="space-y-3">
                    {/* Bank Info */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border-2 border-orange-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Transfer ke:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                          <span className="text-gray-600">Bank:</span>
                          <span className="font-bold text-gray-900">{order.payment.bankName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                          <span className="text-gray-600">No. Rek:</span>
                          <span className="font-bold text-gray-900">{order.payment.accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                          <span className="text-gray-600">A/N:</span>
                          <span className="font-bold text-gray-900">{order.payment.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg text-xs">
                          <span className="text-gray-600">Jumlah:</span>
                          <span className="font-bold text-orange-600">
                            Rp {Number(order.payment.amount).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2">Status Pembayaran:</p>
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                        order.payment.status === "VERIFIED" ? "bg-green-100 text-green-800 border-green-300" :
                        order.payment.status === "UPLOADED" ? "bg-orange-100 text-orange-800 border-orange-300" :
                        order.payment.status === "REJECTED" ? "bg-red-100 text-red-800 border-red-300" :
                        "bg-yellow-100 text-yellow-800 border-yellow-300"
                      }`}>
                        {order.payment.status === "VERIFIED" && "✅ Terverifikasi"}
                        {order.payment.status === "UPLOADED" && "📤 Menunggu Verifikasi"}
                        {order.payment.status === "REJECTED" && "❌ Ditolak"}
                        {order.payment.status === "PENDING" && "⏳ Menunggu Upload"}
                      </span>
                    </div>

                    {/* Proof Image */}
                    {order.payment.proofImage && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Bukti Transfer:</p>
                        <img
                          src={order.payment.proofImage}
                          alt="Bukti Transfer"
                          className="w-full rounded-xl border-2 border-gray-300"
                        />
                      </div>
                    )}

                    {/* Admin Notes */}
                    {order.payment.notes && (
                      <div className="mt-3 bg-red-50 border-2 border-red-200 p-3 rounded-xl">
                        <p className="text-xs font-semibold text-red-900 mb-1">Catatan Admin:</p>
                        <p className="text-xs text-red-800">{order.payment.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Upload Button - Mobile Only */}
          {order.payment?.status === "PENDING" && (
            <div
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40"
              style={{paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'}}
            >
              {previewUrl && (
                <div className="mb-3 relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-xl border-2 border-gray-300" />
                  <button
                    onClick={() => {
                      setPreviewUrl("");
                      setProofFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="proof-upload-mobile"
                />

                <label
                  htmlFor="proof-upload-mobile"
                  className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl cursor-pointer hover:bg-gray-200 transition-all"
                >
                  📷
                </label>

                <button
                  onClick={handleUploadProof}
                  disabled={!proofFile || isUploading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Mengupload...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm">📤 Upload Bukti Transfer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  Konfirmasi Penerimaan Paket
                </h3>
                <button
                  onClick={() => {
                    setShowDeliveryModal(false);
                    setDeliveryProofFile(null);
                    setDeliveryPreview("");
                    setDeliveryNotes("");
                    setDeliveryRating(5);
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900">
                  <strong>Pesanan #{order?.orderNumber}</strong>
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Dengan mengklik tombol konfirmasi, Anda menyatakan bahwa paket telah diterima dengan baik.
                </p>
              </div>

              {/* Optional: Upload Photo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📷 Upload Foto Penerimaan <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Bantu kami dengan upload foto paket yang Anda terima
                </p>

                {deliveryPreview ? (
                  <div className="relative">
                    <img
                      src={deliveryPreview}
                      alt="Preview"
                      className="w-full rounded-xl border-2 border-gray-300"
                    />
                    <button
                      onClick={() => {
                        setDeliveryProofFile(null);
                        setDeliveryPreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDeliveryImageChange}
                      className="hidden"
                      id="delivery-proof-upload"
                    />
                    <label
                      htmlFor="delivery-proof-upload"
                      className="block w-full text-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer transition-all"
                    >
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm">Klik untuk pilih foto</span>
                      <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                    </label>
                  </>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  ⭐ Beri Rating Pengalaman Belanja
                </label>
                <div className="flex items-center justify-center gap-2 bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDeliveryRating(star)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= deliveryRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  {deliveryRating === 5 && "Sangat Puas! ⭐⭐⭐⭐⭐"}
                  {deliveryRating === 4 && "Puas ⭐⭐⭐⭐"}
                  {deliveryRating === 3 && "Cukup Baik ⭐⭐⭐"}
                  {deliveryRating === 2 && "Kurang Memuaskan ⭐⭐"}
                  {deliveryRating === 1 && "Tidak Puas ⭐"}
                </p>
              </div>

              {/* Optional: Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💬 Catatan <span className="text-gray-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Contoh: Paket dalam kondisi baik, terima kasih!"
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none resize-none text-sm"
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmDelivery}
                disabled={isConfirmingDelivery}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isConfirmingDelivery ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Konfirmasi Paket Diterima
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Upload foto dan catatan bersifat opsional. Anda dapat langsung konfirmasi tanpa upload foto.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
