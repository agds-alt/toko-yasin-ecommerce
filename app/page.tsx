"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/Navbar";

export default function Home() {
  const { data, isLoading } = trpc.product.getAll.useQuery({});

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat produk...</p>
          </div>
        </div>
      </>
    );
  }

  const products = data?.products || [];

  return (
    <>
      <Navbar />

      {/* Hero Section - Image Background */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&q=80"
            alt="Shopping"
            className="w-full h-full object-cover opacity-30"
          />
          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-gray-900/90"></div>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-block mb-6 animate-fade-in">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl">
                ✨ Terpercaya & Berkualitas
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
              <span className="block text-white drop-shadow-2xl">
                Selamat Datang di
              </span>
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                Toko Yasin
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto font-light leading-relaxed animate-fade-in-up drop-shadow-lg">
              Belanja Mudah, Pembayaran Fleksibel
              <br className="hidden sm:block" />
              <span className="font-semibold text-blue-300">Transfer Bank - Aman & Cepat</span>
            </p>

            {/* CTA Button */}
            <a
              href="#products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-2xl shadow-xl animate-fade-in-up"
            >
              <span>Lihat {products.length} Produk</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 sm:h-16 fill-gray-50" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              📦 {products.length} Produk Tersedia
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
              Katalog Produk
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih produk favorit Anda dan nikmati kemudahan berbelanja
            </p>
          </div>

          {/* Products Grid - Modern Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {products.map((product) => {
              const images = typeof product.images === "string"
                ? JSON.parse(product.images)
                : product.images;
              const imageUrl = images && images[0] ? images[0] : "/placeholder.png";

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Product Image - Modern with gradient overlay */}
                  <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                        🔥 Terbatas
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl">
                          ❌ Habis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info - Modern Styling */}
                  <div className="p-3 sm:p-4 space-y-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] group-hover:text-blue-700 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-lg sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Rp {(Number(product.price) / 1000).toFixed(0)}rb
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[10px] sm:text-xs text-gray-500 truncate bg-gray-100 px-2 py-1 rounded-md">
                        {product.category?.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-bold ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                          {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Belum ada produk tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Toko Yasin</h3>
              <p className="text-gray-400">
                Belanja mudah, pembayaran fleksibel via transfer bank.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Kontak</h3>
              <p className="text-gray-400 mb-2">
                WhatsApp: 0812-3456-7890
              </p>
              <p className="text-gray-400">
                Email: tokoyasin@example.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Rekening</h3>
              <p className="text-gray-400 mb-2">
                BCA: 1234567890
              </p>
              <p className="text-gray-400">
                a.n. Toko Yasin
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Toko Yasin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
