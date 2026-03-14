"use client";

import { trpc } from "@/lib/trpc";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/_components/Navbar";
import { useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug });
  const addToCart = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      alert("Produk berhasil ditambahkan ke keranjang!");
      router.push("/cart");
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

    addToCart.mutate({
      productId: product.id,
      quantity,
    });
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
                <button onClick={() => router.push("/products")} className="hover:text-blue-600">
                  Produk
                </button>
              </li>
              <li>/</li>
              <li className="text-gray-800 font-semibold">{product.name}</li>
            </ol>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl shadow-xl p-6 lg:p-10">
            {/* Left: Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />

                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-red-600 text-white text-xl font-bold px-6 py-3 rounded-full shadow-xl">
                      ❌ Stok Habis
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square relative bg-gray-100 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-2"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col space-y-6">
              {/* Category Badge */}
              {product.category && (
                <div>
                  <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    📦 {product.category.name}
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Harga</p>
                <p className="text-4xl lg:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </p>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
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
                  <h2 className="text-xl font-bold text-gray-800">Deskripsi Produk</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-3">
                  <label className="text-lg font-semibold text-gray-800">Jumlah</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-12 h-12 rounded-xl transition-all"
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
                      className="w-20 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-bold w-12 h-12 rounded-xl transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || addToCart.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
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
        </div>
      </div>
    </>
  );
}
