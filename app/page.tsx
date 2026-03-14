"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./_components/Navbar";
import { useState, useEffect, Suspense } from "react";
import { ChevronLeft, ChevronRight, Heart, Eye, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "./_contexts/CartContext";

function HomeContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || undefined;
  const categoryFilter = searchParams.get('category') || undefined;

  const { data, isLoading } = trpc.product.getAll.useQuery({
    search: searchQuery,
    categoryId: categoryFilter
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:bg-white/30 hover:scale-110 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all hover:bg-white/30 hover:scale-110 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="transition-all"
                style={{
                  width: currentSlide === index ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="bg-white" style={{paddingTop: 'var(--spacing-88)', paddingBottom: 'var(--spacing-88)'}}>
        <div style={{maxWidth: 'var(--content-max-width)', margin: '0 auto', padding: '0 var(--content-gutter)'}}>
          <div className="text-center" style={{marginBottom: 'var(--spacing-64)'}}>
            {/* Section Badge */}
            <div className="inline-block mb-4">
              <span className="text-xs font-bold uppercase tracking-widest px-4 py-2" style={{
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '2px'
              }}>
                Koleksi Terbaru
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{
              color: 'var(--gray-900)',
              fontFamily: 'Urbanist',
              marginBottom: 'var(--spacing-16)',
              lineHeight: '1.2',
              letterSpacing: '-0.02em'
            }}>
              Katalog Produk
            </h2>
            <p className="text-base sm:text-lg max-w-2xl mx-auto font-medium" style={{color: 'var(--gray-60)', lineHeight: '1.7'}}>
              {products.length} Produk Berkualitas Pilihan
            </p>
          </div>

          {/* Products Grid with Category Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" style={{gap: 'var(--grid-gap)'}}>
            {/* Category Banner - Left Side */}
            <div className="lg:col-span-1 rounded-lg overflow-hidden relative" style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              minHeight: '400px'
            }}>
              <div className="p-8 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-3" style={{fontFamily: 'Urbanist'}}>
                    Produk Pilihan
                  </h3>
                  <p className="text-white/90 text-sm mb-6">
                    Jelajahi koleksi terbaru kami
                  </p>
                </div>
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-semibold py-3 px-6 rounded-full transition-all hover:shadow-lg hover:scale-105"
                >
                  <span>Shop now</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10"></div>
            </div>

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

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg overflow-hidden transition-all hover:shadow-xl relative group"
                  style={{
                    border: '1px solid var(--gray-30)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Wishlist Icon - Top Right */}
                  <button
                    className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:bg-red-50 hover:scale-110"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!session) {
                        router.push('/auth/login');
                        return;
                      }

                      // TODO: Add to wishlist
                      router.push('/wishlist');
                    }}
                  >
                    <Heart className="w-4 h-4" style={{color: 'var(--gray-60)'}} />
                  </button>

                  {/* Product Image with Quick View */}
                  <Link href={`/products/${product.slug}`} className="block relative bg-gray-50" style={{height: '280px'}}>
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                    />

                    {/* Quick View - Shows on Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-all w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110">
                        <Eye className="w-5 h-5" style={{color: 'var(--gray-900)'}} />
                      </button>
                    </div>

                    {/* Stock Badge */}
                    {product.stock > 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        Stok Tersedia
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      {/* Product Name */}
                      <h3 className="text-sm font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors" style={{
                        color: 'var(--gray-900)',
                        minHeight: '2.5em'
                      }}>
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs ml-1" style={{color: 'var(--gray-60)'}}>
                        (0)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-xl font-black" style={{color: 'var(--primary)', fontFamily: 'Urbanist'}}>
                        Rp {Number(product.price).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mb-3">
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

                        // Add to cart
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

                        // Show success feedback
                        alert(`✓ ${quantity}x ${product.name} ditambahkan ke keranjang!`);
                      }}
                      className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full transition-all hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Tambah ke Keranjang
                    </button>

                    {/* Action Links */}
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <button className="flex items-center gap-1 transition-colors hover:text-primary" style={{color: 'var(--gray-60)'}} onClick={(e) => {
                        e.preventDefault();

                        if (!session) {
                          router.push('/auth/login');
                          return;
                        }

                        // TODO: Implement checkout functionality
                        alert(`Beli sekarang: ${product.name}`);
                      }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Beli Sekarang
                      </button>
                      <button className="flex items-center gap-1 transition-colors hover:text-primary" style={{color: 'var(--gray-60)'}} onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement WhatsApp or contact functionality
                        window.open(`https://wa.me/6281234567890?text=Halo, saya ingin bertanya tentang produk ${encodeURIComponent(product.name)}`, '_blank');
                      }}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Tanya?
                      </button>
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
