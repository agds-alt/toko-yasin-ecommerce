"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/_components/Navbar";
import { trpc } from "@/lib/trpc";
import { Star, Filter, X, Grid3x3, Rows3 } from "lucide-react";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";
type ViewMode = "grid" | "list";

export default function ProductsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { data: categories } = trpc.product.getCategories.useQuery();

  // Fetch products with filters
  const { data: productsData, isLoading } = trpc.product.getAll.useQuery({
    categoryId: selectedCategory,
    limit: 100,
  });

  // Sort products
  const sortedProducts = productsData?.products
    ? [...productsData.products].sort((a, b) => {
        switch (sortBy) {
          case "price-asc":
            return Number(a.price) - Number(b.price);
          case "price-desc":
            return Number(b.price) - Number(a.price);
          case "name":
            return a.name.localeCompare(b.name);
          case "newest":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      })
    : [];

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--gray-900)" }}>
              Semua Produk
            </h1>
            <p className="text-sm md:text-base" style={{ color: "var(--gray-60)" }}>
              {sortedProducts.length} produk tersedia
            </p>
          </div>

          {/* Filters & Sort Bar */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6" style={{ borderColor: "var(--gray-30)" }}>
            <div className="flex flex-wrap items-center gap-3 justify-between">
              {/* Left: Filter & Category */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: showFilters ? "var(--primary)" : "var(--gray-30)",
                    color: showFilters ? "var(--primary)" : "var(--gray-60)",
                    backgroundColor: showFilters ? "var(--primary-light)" : "white",
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-semibold">Filter</span>
                </button>

                {/* Category Filters - Desktop always visible */}
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory(undefined)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !selectedCategory
                        ? "text-white"
                        : "border-2 hover:border-orange-300"
                    }`}
                    style={
                      !selectedCategory
                        ? { backgroundColor: "var(--primary)" }
                        : { borderColor: "var(--gray-30)", color: "var(--gray-60)" }
                    }
                  >
                    Semua
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedCategory === category.id
                          ? "text-white"
                          : "border-2 hover:border-orange-300"
                      }`}
                      style={
                        selectedCategory === category.id
                          ? { backgroundColor: "var(--primary)" }
                          : { borderColor: "var(--gray-30)", color: "var(--gray-60)" }
                      }
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Sort & View Mode */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none focus:border-orange-500"
                  style={{ borderColor: "var(--gray-30)", color: "var(--gray-900)" }}
                >
                  <option value="newest">Terbaru</option>
                  <option value="name">Nama A-Z</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                </select>

                {/* View Mode Toggle - Desktop only */}
                <div className="hidden md:flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-all ${
                      viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                    style={{ color: viewMode === "grid" ? "var(--primary)" : "var(--gray-60)" }}
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-all ${
                      viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    }`}
                    style={{ color: viewMode === "list" ? "var(--primary)" : "var(--gray-60)" }}
                  >
                    <Rows3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Category Filters */}
            {showFilters && (
              <div className="md:hidden mt-4 pt-4 border-t" style={{ borderColor: "var(--gray-30)" }}>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setShowFilters(false);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      !selectedCategory ? "text-white" : "border-2"
                    }`}
                    style={
                      !selectedCategory
                        ? { backgroundColor: "var(--primary)" }
                        : { borderColor: "var(--gray-30)", color: "var(--gray-60)" }
                    }
                  >
                    Semua
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowFilters(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedCategory === category.id ? "text-white" : "border-2"
                      }`}
                      style={
                        selectedCategory === category.id
                          ? { backgroundColor: "var(--primary)" }
                          : { borderColor: "var(--gray-30)", color: "var(--gray-60)" }
                      }
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div
                  className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                  style={{ borderColor: "var(--primary)" }}
                ></div>
                <p style={{ color: "var(--gray-60)" }}>Memuat produk...</p>
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          {!isLoading && sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--gray-900)" }}>
                Tidak ada produk
              </h3>
              <p style={{ color: "var(--gray-60)" }}>
                Produk untuk kategori ini belum tersedia
              </p>
            </div>
          )}

          {!isLoading && sortedProducts.length > 0 && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
                  : "flex flex-col gap-4"
              }
            >
              {sortedProducts.map((product) => {
                const images = Array.isArray(product.images) ? product.images : [];
                const imageUrl = images[0] || "/placeholder.png";

                if (viewMode === "list") {
                  // List View
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] flex"
                      style={{ borderColor: "var(--gray-30)" }}
                    >
                      <div className="w-32 md:w-48 h-32 md:h-48 bg-gray-50 flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-3"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          {product.category && (
                            <span
                              className="inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2"
                              style={{
                                backgroundColor: "var(--primary-light)",
                                color: "var(--primary)",
                              }}
                            >
                              {product.category.name}
                            </span>
                          )}
                          <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2" style={{ color: "var(--gray-900)" }}>
                            {product.name}
                          </h3>
                          <p className="text-xs md:text-sm line-clamp-2 mb-3" style={{ color: "var(--gray-60)" }}>
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg md:text-xl font-black" style={{ color: "var(--primary)" }}>
                              Rp {Number(product.price).toLocaleString("id-ID")}
                            </p>
                            <p className="text-xs" style={{ color: product.stock > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                              {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Grid View
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="bg-white rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:scale-105 group"
                    style={{ borderColor: "var(--gray-30)" }}
                  >
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 md:p-4 transition-transform group-hover:scale-110"
                      />
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 md:p-4">
                      {product.category && (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2"
                          style={{
                            backgroundColor: "var(--primary-light)",
                            color: "var(--primary)",
                          }}
                        >
                          {product.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-sm md:text-base mb-2 line-clamp-2 min-h-[40px]" style={{ color: "var(--gray-900)" }}>
                        {product.name}
                      </h3>
                      <p className="text-base md:text-xl font-black mb-2" style={{ color: "var(--primary)" }}>
                        Rp {Number(product.price).toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs" style={{ color: product.stock > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {product.stock > 0 ? `Stok: ${product.stock}` : "Stok Habis"}
                      </p>
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
