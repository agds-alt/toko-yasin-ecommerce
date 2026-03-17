"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/_components/Navbar";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Star, Upload, X, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";

// Lazy load ProductImageGallery for better performance
const ProductImageGallery = dynamic(
  () => import("@/app/_components/ProductImageGallery"),
  {
    loading: () => (
      <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading images...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug });
  const { data: reviewStats } = trpc.review.getProductStats.useQuery(
    { productId: product?.id || "" },
    { enabled: !!product?.id }
  );
  const { data: reviewsData } = trpc.review.getByProduct.useQuery(
    { productId: product?.id || "", limit: 10 },
    { enabled: !!product?.id }
  );
  const { data: userReview } = trpc.review.getUserReview.useQuery(
    { productId: product?.id || "" },
    { enabled: !!product?.id && !!session }
  );
  const { data: canReviewData } = trpc.review.canReview.useQuery(
    { productId: product?.id || "" },
    { enabled: !!product?.id && !!session }
  );

  const addToCart = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      alert("Produk berhasil ditambahkan ke keranjang!");
      router.push("/cart");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      alert("Review berhasil ditambahkan!");
      setShowReviewForm(false);
      setRating(5);
      setComment("");
      setReviewImages([]);
      window.location.reload();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Produk Tidak Ditemukan</h1>
            <button
              onClick={() => router.push("/")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];
  const currentImage = images[selectedImageIndex] || "/placeholder.png";

  const handleAddToCart = () => {
    if (!product) return;

    // Check if all variants are selected (if product has variants)
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const allVariantsSelected = product.variants.every(
        (variant) => selectedVariants[variant.name]
      );

      if (!allVariantsSelected) {
        alert("Silakan pilih semua varian produk terlebih dahulu!");
        return;
      }
    }

    addToCart.mutate({
      productId: product.id,
      quantity,
      variant: product.hasVariants ? selectedVariants : undefined,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "toko-yasin");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setReviewImages([...reviewImages, data.secure_url]);
    } catch (error) {
      alert("Gagal mengupload gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeReviewImage = (index: number) => {
    setReviewImages(reviewImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = () => {
    if (!product) return;

    if (comment.trim().length < 10) {
      alert("Komentar minimal 10 karakter");
      return;
    }

    createReview.mutate({
      productId: product.id,
      rating,
      comment: comment.trim(),
      images: reviewImages,
    });
  };

  const renderStars = (count: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= count
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb - Hidden on mobile */}
          <nav className="hidden md:block px-4 sm:px-6 lg:px-8 py-4 text-sm">
            <ol className="flex items-center gap-2 text-gray-500">
              <li>
                <button onClick={() => router.push("/")} className="hover:text-blue-600">
                  Beranda
                </button>
              </li>
              <li>/</li>
              <li>
                <button onClick={() => router.push("/products")} className="hover:text-blue-600">
                  Produk
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-semibold truncate max-w-xs">{product.name}</li>
            </ol>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 bg-white md:rounded-3xl md:shadow-xl md:mx-4 lg:mx-8 md:p-6 lg:p-10">
            {/* Left: Images with Zoom Gallery */}
            <div className="p-4 md:p-0">
              <ProductImageGallery images={images} productName={product.name} />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col space-y-3 md:space-y-6 p-4 md:p-0">
              {/* Category Badge + Stock - Mobile */}
              <div className="flex items-center justify-between md:block">
                {product.category && (
                  <div className="md:mb-0">
                    <span className="inline-block bg-orange-100 text-orange-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                      📦 {product.category.name}
                    </span>
                  </div>
                )}
                {/* Stock Status - Mobile inline */}
                <div className="flex md:hidden items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock > 10 ? "bg-green-500" :
                    product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                  }`}></div>
                  <p className={`text-xs font-semibold ${
                    product.stock > 10 ? "text-green-700" :
                    product.stock > 0 ? "text-orange-700" : "text-red-700"
                  }`}>
                    {product.stock > 10 ? `Stok ${product.stock}` :
                     product.stock > 0 ? `Sisa ${product.stock}` : "Habis"}
                  </p>
                </div>
              </div>

              {/* Product Name */}
              <h1 className="text-lg md:text-3xl lg:text-4xl font-bold md:font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-orange-200">
                <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Harga</p>
                <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Stock Status - Desktop only */}
              <div className="hidden md:flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  product.stock > 10 ? "bg-green-500" :
                  product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                }`}></div>
                <p className={`text-lg font-semibold ${
                  product.stock > 10 ? "text-green-700" :
                  product.stock > 0 ? "text-orange-700" : "text-red-700"
                }`}>
                  {product.stock > 10 ? `Stok Tersedia (${product.stock})` :
                   product.stock > 0 ? `Stok Terbatas (${product.stock})` : "Stok Habis"}
                </p>
              </div>

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <h2 className="text-base md:text-xl font-bold text-gray-800">Deskripsi Produk</h2>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Variant Selection */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <div className="space-y-3 md:space-y-4 border-2 border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5">
                  <h2 className="text-sm md:text-lg font-bold text-gray-800">Pilih Varian</h2>
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="space-y-2">
                      <label className="text-xs md:text-sm font-semibold text-gray-700">
                        {variant.name}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map((value) => (
                          <button
                            key={value}
                            onClick={() =>
                              setSelectedVariants({
                                ...selectedVariants,
                                [variant.name]: value,
                              })
                            }
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                              selectedVariants[variant.name] === value
                                ? "border-orange-500 bg-orange-50 text-orange-700"
                                : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-2 md:space-y-3">
                  <label className="text-sm md:text-lg font-semibold text-gray-800">Jumlah</label>
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl transition-all"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.min(product.stock, Math.max(1, val)));
                      }}
                      className="w-16 md:w-20 text-center text-lg md:text-xl font-bold border-2 border-gray-300 rounded-lg md:rounded-xl py-2 md:py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button - Desktop */}
              <div className="hidden md:block pt-4 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addToCart.isPending}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                >
                  {addToCart.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      🛒 Tambah ke Keranjang
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl border-2 border-gray-300 transition-all"
                >
                  ← Kembali Belanja
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar - Mobile Only */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-2xl z-40" style={{paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'}}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center w-12 h-12 border-2 border-gray-300 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg active:shadow-md transition-all flex items-center justify-center gap-2"
              >
                {addToCart.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-4 md:mt-8 space-y-4 md:space-y-6 md:mx-4 lg:mx-8">
            {/* Review Statistics */}
            {reviewStats && reviewStats.totalReviews > 0 && (
              <div className="bg-white md:rounded-3xl md:shadow-xl p-4 md:p-6 lg:p-10">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Rating & Ulasan</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* Average Rating */}
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl md:rounded-2xl p-6 md:p-8">
                    <div className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-2">
                      {reviewStats.averageRating.toFixed(1)}
                    </div>
                    {renderStars(Math.round(reviewStats.averageRating), "lg")}
                    <p className="text-sm md:text-base text-gray-600 mt-2 md:mt-3">
                      dari {reviewStats.totalReviews} ulasan
                    </p>
                  </div>

                  {/* Rating Breakdown */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewStats.ratingCounts[star as keyof typeof reviewStats.ratingCounts] || 0;
                      const percentage = reviewStats.totalReviews > 0
                        ? (count / reviewStats.totalReviews) * 100
                        : 0;

                      return (
                        <div key={star} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-24">
                            <span className="text-sm font-semibold text-gray-700">{star}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-yellow-400 h-full rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Info: Can't review if not purchased */}
            {session && canReviewData && !canReviewData.canReview && canReviewData.reason === "not_purchased" && (
              <div className="bg-blue-50 md:rounded-3xl md:shadow-lg p-4 md:p-6 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Review Hanya Untuk Pembeli</h4>
                    <p className="text-sm text-gray-600">
                      {canReviewData.message || "Anda harus membeli dan menerima produk ini terlebih dahulu untuk dapat memberikan review."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Form */}
            {session && canReviewData?.canReview && (
              <div className="bg-white md:rounded-3xl md:shadow-xl p-4 md:p-6 lg:p-10">
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 active:from-orange-800 active:to-red-800 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg active:shadow-md transition-all"
                  >
                    ✍️ Tulis Ulasan
                  </button>
                ) : (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Tulis Ulasan</h3>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Star Rating Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-10 h-10 ${
                                star <= rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Ulasan Anda</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan pengalaman Anda dengan produk ini... (minimal 10 karakter)"
                        className="w-full border-2 border-gray-300 rounded-xl p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                        rows={5}
                      />
                      <p className="text-sm text-gray-500">{comment.length} karakter</p>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Foto Produk (Opsional)</label>

                      <div className="grid grid-cols-4 gap-3">
                        {reviewImages.map((img, index) => (
                          <div key={index} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                            <img src={img} alt={`Review ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeReviewImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {reviewImages.length < 4 && (
                          <label className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-xs text-gray-500">Upload</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Maksimal 4 foto, masing-masing maksimal 5MB</p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={createReview.isPending || comment.trim().length < 10}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                      >
                        {createReview.isPending ? "Mengirim..." : "Kirim Ulasan"}
                      </button>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User's Existing Review */}
            {session && userReview && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 md:rounded-3xl md:shadow-xl p-4 md:p-6 lg:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">Ulasan Anda</h3>
                </div>
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(userReview.rating, "md")}
                    {userReview.isVerified && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        ✓ Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{userReview.comment}</p>
                  {userReview.images && userReview.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {userReview.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Review ${index + 1}`}
                          className="aspect-square object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    {new Date(userReview.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviewsData && reviewsData.reviews.length > 0 && (
              <div className="bg-white md:rounded-3xl md:shadow-xl p-4 md:p-6 lg:p-10">
                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Semua Ulasan</h3>

                <div className="space-y-6">
                  {reviewsData.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                      {/* User Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {review.user.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{review.user.name || "User"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating, "sm")}
                              {review.isVerified && (
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Review Content */}
                      <p className="text-gray-700 whitespace-pre-wrap mb-3">{review.comment}</p>

                      {/* Review Images */}
                      {review.images && review.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {review.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Review image ${index + 1}`}
                              className="aspect-square object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(img, "_blank")}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Reviews Yet */}
            {reviewStats && reviewStats.totalReviews === 0 && (
              <div className="bg-white md:rounded-3xl md:shadow-xl p-8 md:p-10 text-center">
                <div className="text-5xl md:text-6xl mb-3 md:mb-4">⭐</div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                  Belum Ada Ulasan
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Jadilah yang pertama memberikan ulasan untuk produk ini!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
