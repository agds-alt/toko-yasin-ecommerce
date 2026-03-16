"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/Navbar";
import { useState, useEffect, Suspense } from "react";
import { ChevronLeft, ChevronRight, Heart, Eye, Star, Minus, Plus, ShoppingCart, Search, Filter, X, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "./_contexts/CartContext";
import { useSearch } from "./_contexts/SearchContext";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();

  // Use shared search context from Navbar
  const { searchQuery, selectedCategory: contextCategory, setSelectedCategory } = useSearch();

  // Filter States
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc">("newest");
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading } = trpc.product.getAll.useQuery({
    search: searchQuery || undefined,
    categoryId: contextCategory,
    minPrice,
    maxPrice,
    sortBy,
  });

  // Fetch categories for filter
  const { data: categoriesData } = trpc.product.getCategories.useQuery();
  const categories = categoriesData || [];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  // Flying animation states
  const [flyingItems, setFlyingItems] = useState<Array<{
    id: string;
    type: 'cart' | 'wishlist';
    startX: number;
    startY: number;
    image: string;
  }>>([]);

  // Image modal state
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    productName: string;
  }>({
    isOpen: false,
    imageUrl: '',
    productName: ''
  });

  // Trigger flying animation
  const triggerFlyingAnimation = (
    buttonElement: HTMLElement,
    type: 'cart' | 'wishlist',
    imageUrl: string
  ) => {
    const rect = buttonElement.getBoundingClientRect();
    const itemId = Date.now().toString();

    setFlyingItems(prev => [...prev, {
      id: itemId,
      type,
      startX: rect.left + rect.width / 2,
      startY: rect.top + rect.height / 2,
      image: imageUrl
    }]);

    // Remove after animation completes
    setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== itemId));
    }, 1000);
  };

  // Fetch wishlist items if logged in
  const { data: wishlistData } = trpc.wishlist.getAll.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (wishlistData) {
      setWishlistItems(new Set(wishlistData.map((item) => item.productId)));
    }
  }, [wishlistData]);

  // Wishlist toggle mutation
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: (data, variables) => {
      if (data.inWishlist) {
        setWishlistItems((prev) => new Set([...prev, variables.productId]));
      } else {
        setWishlistItems((prev) => {
          const next = new Set(prev);
          next.delete(variables.productId);
          return next;
        });
      }
    },
  });

  // Hero slides data - using HD Al-Quran and Islamic book images
  const heroSlides = [
    {
      id: 1,
      image: "/images/quran-slide-1.jpg",
      title: "AL-QUR'AN BERKUALITAS",
      subtitle: "Koleksi Al-Qur'an Pilihan",
      buttonText: "Lihat Koleksi",
      buttonLink: "#products"
    },
    {
      id: 2,
      image: "/images/quran-slide-2.jpg",
      title: "BUKU YASIN & TAHLIL",
      subtitle: "Harga Terbaik Untuk Anda",
      buttonText: "Belanja Sekarang",
      buttonLink: "#products"
    },
    {
      id: 3,
      image: "/images/quran-slide-3.jpg",
      title: "KUALITAS TERJAMIN",
      subtitle: "Produk Islami Original & Bergaransi",
      buttonText: "Jelajahi",
      buttonLink: "#products"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

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

      {/* Hero Slider - Journal Theme Style */}
      <section className="relative overflow-hidden bg-gray-100">
        <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
          {/* Slides */}
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: currentSlide === index ? 1 : 0,
                pointerEvents: currentSlide === index ? 'auto' : 'none'
              }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/30"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Badge */}
                  <div className="inline-block mb-6 animate-fade-in">
                    <span className="text-xs font-bold uppercase tracking-widest px-6 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full" style={{
                      letterSpacing: '2px'
                    }}>
                      TOKO YASIN
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 text-white" style={{
                    fontFamily: 'Urbanist',
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    lineHeight: '1.1'
                  }}>
                    {slide.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 font-medium text-white/95" style={{
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    letterSpacing: '-0.01em'
                  }}>
                    {slide.subtitle}
                  </p>

                  {/* CTA Button */}
                  <a
                    href={slide.buttonLink}
                    className="inline-flex items-center gap-3 text-white font-bold text-base sm:text-lg transition-all shadow-2xl hover:shadow-2xl"
                    style={{
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-full)',
                      padding: '1em 2.5em',
                      textDecoration: 'none',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 117, 91, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                    }}
                  >
                    <span>{slide.buttonText}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Bold Gradient Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 group z-20"
            aria-label="Previous slide"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center text-white transition-all duration-300 shadow-[0_8px_30px_rgba(255,87,51,0.5)] group-hover:shadow-[0_12px_40px_rgba(255,87,51,0.7)] group-hover:scale-110 group-active:scale-95 backdrop-blur-sm border-2 border-white/30">
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </div>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 group z-20"
            aria-label="Next slide"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center text-white transition-all duration-300 shadow-[0_8px_30px_rgba(255,87,51,0.5)] group-hover:shadow-[0_12px_40px_rgba(255,87,51,0.7)] group-hover:scale-110 group-active:scale-95 backdrop-blur-sm border-2 border-white/30">
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3]" />
            </div>
          </button>

          {/* Bold Pills Navigation */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-3 rounded-full border border-white/20 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group relative transition-all duration-300"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div className={`transition-all duration-500 ${
                  currentSlide === index
                    ? 'w-10 h-2.5 rounded-full bg-gradient-to-r from-orange-400 to-red-500 shadow-[0_0_12px_rgba(255,117,91,0.8)]'
                    : 'w-2.5 h-2.5 rounded-full bg-white/60 group-hover:bg-white group-hover:w-6'
                }`} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="bg-white pt-2 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          {/* Category Pills - Shopee Style */}
          <div className="mb-2 space-y-2">
            {/* Horizontal Scrollable Categories */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    !contextCategory
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      contextCategory === cat.id
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Compact Filter Row */}
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none bg-white"
                style={{borderColor: 'var(--gray-30)'}}
              >
                <option value="newest">🆕 Terbaru</option>
                <option value="price_asc">💰 Termurah</option>
                <option value="price_desc">💎 Termahal</option>
                <option value="name_asc">🔤 A-Z</option>
                <option value="name_desc">🔤 Z-A</option>
              </select>

              {/* Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all bg-gray-100 hover:bg-gray-200"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Advanced Filter Panel (Collapsible) */}
            {showMobileFilter && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Rentang Harga:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice || ""}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none"
                      style={{borderColor: 'var(--gray-30)'}}
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice || ""}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg outline-none"
                      style={{borderColor: 'var(--gray-30)'}}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                {(contextCategory || minPrice || maxPrice || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setMinPrice(undefined);
                      setMaxPrice(undefined);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Products Grid/List */}
          <div className={viewMode === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-5"
            : "space-y-4"
          }>
            {/* Product Cards */}
            {products.map((product) => {
              const images = typeof product.images === "string"
                ? JSON.parse(product.images)
                : product.images;
              const imageUrl = images && images[0] ? images[0] : "/placeholder.png";
              const quantity = quantities[product.id] || 1;

              const updateQuantity = (newQty: number) => {
                setQuantities(prev => ({
                  ...prev,
                  [product.id]: Math.max(1, newQty)
                }));
              };

              // Grid View Card
              if (viewMode === "grid") {
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 relative group"
                    style={{
                      border: '2px solid rgba(255,117,91,0.08)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      background: 'linear-gradient(to bottom, rgba(255,117,91,0.02) 0%, white 100%)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,117,91,0.15), 0 0 0 2px rgba(255,117,91,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,117,91,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255,117,91,0.08)';
                    }}
                  >
                  {/* Wishlist Icon - Top Right */}
                  <button
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: wishlistItems.has(product.id)
                        ? 'linear-gradient(135deg, rgba(255,117,91,0.2), rgba(255,87,51,0.2))'
                        : 'rgba(255,255,255,0.9)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: wishlistItems.has(product.id) ? '2px solid rgba(255,117,91,0.3)' : '2px solid rgba(0,0,0,0.05)'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!session) {
                        router.push('/auth/login');
                        return;
                      }

                      const isAdding = !wishlistItems.has(product.id);

                      if (isAdding) {
                        triggerFlyingAnimation(e.currentTarget, 'wishlist', imageUrl);
                      }

                      toggleWishlist.mutate({ productId: product.id });
                    }}
                    disabled={toggleWishlist.isPending}
                  >
                    <Heart
                      className="w-5 h-5 transition-all"
                      style={{
                        color: wishlistItems.has(product.id) ? '#FF5733' : '#94a3b8',
                        fill: wishlistItems.has(product.id) ? '#FF5733' : 'none',
                        strokeWidth: 2
                      }}
                    />
                  </button>

                  {/* Product Image with Quick View */}
                  <Link href={`/products/${product.slug}`} className="block relative bg-gray-50 h-40 sm:h-56 lg:h-72">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-3 sm:p-4 transition-transform group-hover:scale-105"
                    />

                    {/* Quick View - Shows on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageModal({
                            isOpen: true,
                            imageUrl: imageUrl,
                            productName: product.name
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110"
                      >
                        <Eye className="w-5 h-5" style={{color: 'var(--gray-900)'}} />
                      </button>
                    </div>

                    {/* Stock Badge */}
                    {product.stock > 0 && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 text-white text-xs font-bold rounded-full backdrop-blur-md" style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}>
                        Stok Tersedia
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-2 sm:p-4">
                    <Link href={`/products/${product.slug}`}>
                      {/* Product Name */}
                      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 mb-1 sm:mb-2 hover:text-primary transition-colors" style={{
                        color: 'var(--gray-900)',
                        minHeight: '2em'
                      }}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-[10px] sm:text-xs ml-1" style={{color: 'var(--gray-60)'}}>
                        (0)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-2 sm:mb-4">
                      <p className="text-base sm:text-xl font-black" style={{color: 'var(--primary)', fontFamily: 'Urbanist'}}>
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(quantity - 1);
                        }}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{borderColor: 'var(--gray-30)'}}
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                        className="w-10 h-6 sm:w-12 sm:h-8 text-center border rounded text-xs sm:text-sm font-semibold outline-none"
                        style={{borderColor: 'var(--gray-30)'}}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          updateQuantity(quantity + 1);
                        }}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                        style={{borderColor: 'var(--gray-30)'}}
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();

                        if (!session) {
                          router.push('/auth/login');
                          return;
                        }

                        // Add to cart
                        const images = typeof product.images === "string"
                          ? JSON.parse(product.images)
                          : product.images;
                        const imageUrl = images && images[0] ? images[0] : "/placeholder.png";

                        // Trigger flying animation
                        triggerFlyingAnimation(e.currentTarget, 'cart', imageUrl);

                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: Number(product.price),
                          quantity: quantity,
                          image: imageUrl,
                          slug: product.slug
                        });
                      }}
                      className="w-full py-2 sm:py-3 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 group"
                      style={{
                        background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)',
                        boxShadow: '0 6px 20px rgba(255, 117, 91, 0.3)'
                      }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                      <span className="hidden sm:inline">Tambah ke Keranjang</span>
                      <span className="sm:hidden">Tambah</span>
                    </button>

                    {/* Action Links */}
                    <div className="flex items-center justify-between mt-2 sm:mt-3 text-[10px] sm:text-xs">
                      <button className="flex items-center gap-0.5 sm:gap-1 transition-colors hover:text-primary" style={{color: 'var(--gray-60)'}} onClick={(e) => {
                        e.preventDefault();

                        if (!session) {
                          router.push('/auth/login');
                          return;
                        }

                        // Add to cart and redirect to checkout
                        const images = typeof product.images === "string"
                          ? JSON.parse(product.images)
                          : product.images;
                        const imageUrl = images && images[0] ? images[0] : "/placeholder.png";

                        addToCart({
                          productId: product.id,
                          name: product.name,
                          price: Number(product.price),
                          quantity: quantity,
                          image: imageUrl,
                          slug: product.slug
                        });

                        // Redirect to checkout page
                        router.push('/checkout');
                      }}>
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="hidden sm:inline">Beli Sekarang</span>
                        <span className="sm:hidden">Beli</span>
                      </button>
                      <button className="flex items-center gap-0.5 sm:gap-1 transition-colors hover:text-primary" style={{color: 'var(--gray-60)'}} onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement WhatsApp or contact functionality
                        window.open(`https://wa.me/6281234567890?text=Halo, saya ingin bertanya tentang produk ${encodeURIComponent(product.name)}`, '_blank');
                      }}>
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tanya?
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

              // List View Card
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-1 relative"
                  style={{
                    border: '2px solid rgba(255,117,91,0.08)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    background: 'linear-gradient(to right, rgba(255,117,91,0.02) 0%, white 100%)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(255,117,91,0.15), 0 0 0 2px rgba(255,117,91,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,117,91,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(255,117,91,0.08)';
                  }}
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4">
                    {/* Left: Image */}
                    <Link href={`/products/${product.slug}`} className="relative bg-gray-50 rounded-lg overflow-hidden sm:w-48 sm:h-48 flex-shrink-0 group">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                      />

                      {/* Quick View Button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setImageModal({
                              isOpen: true,
                              imageUrl: imageUrl,
                              productName: product.name
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110"
                        >
                          <Eye className="w-5 h-5" style={{color: 'var(--gray-900)'}} />
                        </button>
                      </div>

                      {/* Stock Badge */}
                      {product.stock > 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1.5 text-white text-xs font-bold rounded-full backdrop-blur-md" style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                          border: '2px solid rgba(255,255,255,0.3)'
                        }}>
                          Stok Tersedia
                        </div>
                      )}
                    </Link>

                    {/* Right: Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Wishlist Button */}
                        <button
                          className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110"
                          style={{
                            background: wishlistItems.has(product.id)
                              ? 'linear-gradient(135deg, rgba(255,117,91,0.2), rgba(255,87,51,0.2))'
                              : 'rgba(255,255,255,0.9)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: wishlistItems.has(product.id) ? '2px solid rgba(255,117,91,0.3)' : '2px solid rgba(0,0,0,0.05)'
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            if (!session) {
                              router.push('/auth/login');
                              return;
                            }

                            const isAdding = !wishlistItems.has(product.id);

                            if (isAdding) {
                              triggerFlyingAnimation(e.currentTarget, 'wishlist', imageUrl);
                            }

                            toggleWishlist.mutate({ productId: product.id });
                          }}
                          disabled={toggleWishlist.isPending}
                        >
                          <Heart
                            className="w-5 h-5 transition-all"
                            style={{
                              color: wishlistItems.has(product.id) ? '#FF5733' : '#94a3b8',
                              fill: wishlistItems.has(product.id) ? '#FF5733' : 'none',
                              strokeWidth: 2
                            }}
                          />
                        </button>

                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-lg font-bold mb-2 hover:text-primary transition-colors line-clamp-2" style={{color: 'var(--gray-900)'}}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm ml-1" style={{color: 'var(--gray-60)'}}>
                            (0)
                          </span>
                        </div>

                        {/* Price */}
                        <p className="text-2xl font-black mb-4" style={{color: 'var(--primary)', fontFamily: 'Urbanist'}}>
                          Rp {Number(product.price).toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(quantity - 1);
                            }}
                            className="w-8 h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                            style={{borderColor: 'var(--gray-30)'}}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
                            className="w-12 h-8 text-center border rounded text-sm font-semibold outline-none"
                            style={{borderColor: 'var(--gray-30)'}}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              updateQuantity(quantity + 1);
                            }}
                            className="w-8 h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                            style={{borderColor: 'var(--gray-30)'}}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();

                            if (!session) {
                              router.push('/auth/login');
                              return;
                            }

                            const images = typeof product.images === "string"
                              ? JSON.parse(product.images)
                              : product.images;
                            const imageUrl = images && images[0] ? images[0] : "/placeholder.png";

                            // Trigger flying animation
                            triggerFlyingAnimation(e.currentTarget, 'cart', imageUrl);

                            addToCart({
                              productId: product.id,
                              name: product.name,
                              price: Number(product.price),
                              quantity: quantity,
                              image: imageUrl,
                              slug: product.slug
                            });
                          }}
                          className="flex-1 sm:flex-initial px-6 py-3 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 group"
                          style={{
                            background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)',
                            boxShadow: '0 6px 20px rgba(255, 117, 91, 0.3)'
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 transition-transform group-hover:scale-110" />
                          Tambah ke Keranjang
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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

      {/* Footer - Modern & Professional */}
      <footer className="relative overflow-hidden" style={{backgroundColor: 'var(--gray-900)'}}>
        {/* Accent Background */}
        <div className="absolute inset-0 opacity-5" style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)'
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand Column */}
            <div>
              <h3 className="text-2xl font-bold mb-4" style={{
                fontFamily: 'Urbanist',
                background: 'linear-gradient(135deg, white 0%, var(--primary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Toko Yasin
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Belanja mudah, pembayaran fleksibel via transfer bank. Produk berkualitas dengan layanan terpercaya.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="text-lg font-bold mb-5 text-white" style={{fontFamily: 'Urbanist'}}>
                Hubungi Kami
              </h4>
              <div className="space-y-3">
                <a href="https://wa.me/6281234567890" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <span>0812-3456-7890</span>
                </a>
                <a href="mailto:tokoyasin@example.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.1)'}}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span>tokoyasin@example.com</span>
                </a>
              </div>
            </div>

            {/* Payment Column */}
            <div>
              <h4 className="text-lg font-bold mb-5 text-white" style={{fontFamily: 'Urbanist'}}>
                Rekening Pembayaran
              </h4>
              <div className="space-y-3">
                <div className="p-4 rounded-lg" style={{backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>
                  <p className="text-sm font-semibold text-white mb-1">Bank BCA</p>
                  <p className="text-lg font-bold text-white mb-1" style={{fontFamily: 'monospace'}}>1234567890</p>
                  <p className="text-sm text-gray-400">a.n. Toko Yasin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t" style={{borderColor: 'rgba(255,255,255,0.1)'}}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                &copy; 2026 Toko Yasin. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Flying Items Animation */}
      {flyingItems.map((item) => {
        // Get target position (cart or wishlist icon in navbar)
        const targetElement = document.querySelector(
          item.type === 'cart'
            ? 'a[href="/cart"]'
            : 'a[href="/wishlist"]'
        );

        let endX = window.innerWidth / 2;
        let endY = 50;

        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          endX = rect.left + rect.width / 2;
          endY = rect.top + rect.height / 2;
        }

        return (
          <div
            key={item.id}
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: `${item.startX}px`,
              top: `${item.startY}px`,
              animation: `flyToTarget 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
              '--end-x': `${endX - item.startX}px`,
              '--end-y': `${endY - item.startY}px`,
            } as React.CSSProperties}
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-2xl animate-pulse" style={{
              border: '3px solid',
              borderColor: item.type === 'cart' ? '#FF755B' : '#FF5733',
              background: 'white'
            }}>
              <img
                src={item.image}
                alt="Flying item"
                className="w-full h-full object-contain p-1"
              />
            </div>
          </div>
        );
      })}

      {/* Keyframes for flying animation */}
      <style jsx>{`
        @keyframes flyToTarget {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--end-x) * 0.5), calc(var(--end-y) * 0.5)) scale(0.8);
            opacity: 0.9;
          }
          100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0.3);
            opacity: 0;
          }
        }
      `}</style>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fadeIn"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)'
          }}
          onClick={() => setImageModal({ isOpen: false, imageUrl: '', productName: '' })}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setImageModal({ isOpen: false, imageUrl: '', productName: '' })}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>

            {/* Product Name Header */}
            <div className="px-6 py-4 border-b-2 border-gray-100" style={{
              background: 'linear-gradient(135deg, rgba(255,117,91,0.05) 0%, rgba(255,87,51,0.05) 100%)'
            }}>
              <h3 className="text-xl font-bold text-gray-900">{imageModal.productName}</h3>
            </div>

            {/* Image Container */}
            <div className="relative w-full" style={{ maxHeight: '70vh' }}>
              <img
                src={imageModal.imageUrl}
                alt={imageModal.productName}
                className="w-full h-full object-contain"
                style={{ maxHeight: '70vh' }}
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t-2 border-gray-100 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                Klik di luar gambar atau tombol X untuk menutup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat...</p>
          </div>
        </div>
      </>
    }>
      <HomeContent />
    </Suspense>
  );
}
