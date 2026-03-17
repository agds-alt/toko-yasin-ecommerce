"use client";

import { Star, ThumbsUp, User } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Fetch reviews
  const { data: reviewsData, isLoading, refetch } = trpc.review.getByProduct.useQuery({
    productId,
  });

  // Submit review mutation
  const submitReview = trpc.review.create.useMutation({
    onSuccess: () => {
      setComment("");
      setRating(5);
      setShowReviewForm(false);
      refetch();
      alert("✅ Review berhasil ditambahkan!");
    },
    onError: (error) => {
      alert(`❌ ${error.message}`);
    },
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Review minimal 10 karakter");
      return;
    }

    await submitReview.mutateAsync({
      productId,
      rating,
      comment: comment.trim(),
    });
  };

  const renderStars = (count: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div className="flex gap-0.5">
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

  const averageRating = reviewsData?.averageRating || 0;
  const totalReviews = reviewsData?.totalReviews || 0;
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rating & Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Average Rating */}
        {totalReviews > 0 && (
          <div className="text-center">
            <div className="flex items-end gap-1 mb-1">
              <span className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-500 text-sm mb-2">/5</span>
            </div>
            {renderStars(Math.round(averageRating), "md")}
          </div>
        )}
      </div>

      {/* Write Review Button */}
      {session && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-full hover:opacity-90 transition-all"
            >
              ✍️ Tulis Review
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6">
                {/* Rating Selector */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating Anda
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Review Anda (minimal 10 karakter)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Bagikan pengalaman Anda dengan produk ini..."
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={submitReview.isPending || comment.trim().length < 10}
                    className="flex-1 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitReview.isPending ? "Mengirim..." : "Kirim Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setComment("");
                      setRating(5);
                    }}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Login CTA if not logged in */}
      {!session && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-800 mb-2">
            Login untuk menulis review
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline"
          >
            Login Sekarang →
          </button>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Memuat reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum Ada Review
          </h3>
          <p className="text-sm text-gray-600">
            Jadilah yang pertama memberikan review untuk produk ini!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-50 rounded-xl p-4 md:p-6 border-2 border-gray-100 hover:border-orange-200 transition-colors"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {review.user.name ? review.user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {review.user.name || "Customer"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {renderStars(review.rating, "sm")}
              </div>

              {/* Review Comment */}
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                {review.comment}
              </p>

              {/* Verified Badge */}
              {review.isVerified && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  ✓ Pembeli Terverifikasi
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
