"use client";

import Link from "next/link";
import { ShoppingCart, LogOut, User, Menu, X, Search, Heart, Clock, Trash2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useCart } from "../_contexts/CartContext";
import { useSearch } from "../_contexts/SearchContext";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems, totalPrice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Use shared search context
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, searchHistory, addToSearchHistory, clearSearchHistory } = useSearch();

  // Get categories for dropdown
  const { data: categories } = trpc.product.getCategories.useQuery();
  const [localSelectedCategory, setLocalSelectedCategory] = useState("all");

  // Get user profile for avatar
  const { data: profileData } = trpc.auth.getProfile.useQuery(undefined, {
    enabled: !!session,
  });

  // Get wishlist count
  const { data: wishlistData } = trpc.wishlist.getAll.useQuery(undefined, {
    enabled: !!session,
  });
  const wishlistCount = wishlistData?.length || 0;

  // Search functionality for desktop dropdown (local state)
  const { data: searchData } = trpc.product.getAll.useQuery(
    {
      search: localSearchQuery,
      categoryId: localSelectedCategory !== "all" ? localSelectedCategory : undefined
    },
    { enabled: localSearchQuery.length > 0 }
  );

  const cartCount = totalItems;

  // Desktop search - navigate with params
  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      addToSearchHistory(localSearchQuery);
      const params = new URLSearchParams();
      params.set('search', localSearchQuery);
      if (localSelectedCategory !== 'all') {
        params.set('category', localSelectedCategory);
      }
      router.push(`/?${params.toString()}`);
      setLocalSearchQuery("");
    }
  };

  // Mobile search - live filter on homepage
  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Just update the shared search context, no navigation
    // The homepage will automatically update
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b shadow-sm transition-all duration-300" style={{borderColor: 'rgba(255,117,91,0.1)'}}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between h-20 gap-3">
          {/* Logo - Bold & Prominent with Blue Navy */}
          <Link href="/" className="flex items-center group shrink-0 -ml-4">
            <span className="text-2xl sm:text-3xl font-black transition-all duration-300 group-hover:scale-105" style={{
              color: '#1a2b4a',
              fontFamily: 'Urbanist',
              letterSpacing: '-0.02em'
            }}>
              Qohira
            </span>
          </Link>

          {/* Search Bar - Prominent Center (Desktop Only) */}
          <div className="flex flex-1 max-w-4xl mx-2">
            <form onSubmit={handleDesktopSearch} className="w-full relative">
              <div className="flex items-center border-2 rounded-2xl overflow-hidden transition-all duration-300 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur-sm" style={{
                borderColor: searchFocused ? 'var(--primary)' : 'rgba(0,0,0,0.08)',
                boxShadow: searchFocused ? '0 8px 24px rgba(255, 117, 91, 0.15), 0 0 0 3px rgba(255, 117, 91, 0.1)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={localSelectedCategory}
                    onChange={(e) => setLocalSelectedCategory(e.target.value)}
                    className="h-10 pl-4 pr-8 text-sm font-medium border-r outline-none bg-white cursor-pointer appearance-none"
                    style={{borderColor: 'var(--gray-30)', color: 'var(--gray-900)'}}
                  >
                    <option value="all">All</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Search Input */}
<input
                  type="text"
                  placeholder="Cari produk di toko..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 h-10 px-4 text-sm outline-none"
                  style={{color: 'var(--gray-900)'}}
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="h-10 px-6 text-white transition-all hover:opacity-90"
                  style={{backgroundColor: 'var(--primary)'}}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border max-h-96 overflow-y-auto z-50" style={{borderColor: 'var(--gray-30)'}}>
                  {localSearchQuery.length > 0 ? (
                    // Show search results
                    searchData && searchData.products.length > 0 ? (
                      <div className="divide-y" style={{borderColor: 'var(--gray-30)'}}>
                        {searchData.products.slice(0, 5).map((product) => {
                          const images = product.images || [];
                          const imageUrl = images[0] || "/placeholder.png";

                          return (
                            <Link
                              key={product.id}
                              href={`/products/${product.slug}`}
                              onClick={() => {
                                setLocalSearchQuery("");
                                setSearchFocused(false);
                              }}
                              className="flex items-center gap-4 p-4 hover:bg-orange-50 transition-colors"
                            >
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-16 h-16 object-contain bg-gray-100 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {product.category?.name}
                                </p>
                                <p className="text-sm font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                                  Rp {Number(product.price).toLocaleString('id-ID')}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-600">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Produk tidak ditemukan</p>
                      </div>
                    )
                  ) : (
                    // Show search history
                    searchHistory.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between p-3 border-b" style={{borderColor: 'var(--gray-30)'}}>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Clock className="w-4 h-4" />
                            <span>Pencarian Terakhir</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearSearchHistory();
                            }}
                            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        </div>
                        <div className="divide-y" style={{borderColor: 'var(--gray-30)'}}>
                          {searchHistory.map((query, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setLocalSearchQuery(query);
                                setSearchFocused(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center gap-3"
                            >
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{query}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-600">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Belum ada riwayat pencarian</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Icons - Desktop Only */}
          <div className="flex items-center gap-1 -mr-2">
            {/* Account */}
            <Link
              href={session ? "/profile" : "/auth/login"}
              className="flex flex-col items-center p-2 px-3 transition-all duration-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl group"
              style={{color: 'var(--gray-60)'}}
            >
              {session && profileData?.avatar ? (
                <img
                  src={profileData.avatar}
                  alt={profileData.name || "User"}
                  className="w-8 h-8 rounded-full object-cover border-2 transition-transform group-hover:scale-110"
                  style={{borderColor: 'var(--primary)'}}
                />
              ) : (
                <User className="w-5 h-5 mb-0.5 transition-transform group-hover:scale-110 group-hover:text-orange-500" />
              )}
              {!session || !profileData?.avatar ? (
                <span className="text-xs font-medium">Akun</span>
              ) : null}
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex flex-col items-center p-2 px-3 transition-all duration-300 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 rounded-xl group relative"
              style={{color: 'var(--gray-60)'}}
            >
              <div className="relative">
                <Heart className="w-5 h-5 mb-0.5 transition-all group-hover:scale-110 group-hover:text-red-500 group-hover:fill-red-100" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full animate-pulse" style={{background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)', fontSize: '10px', boxShadow: '0 2px 6px rgba(255,87,51,0.3)'}}>
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">Favorit</span>
            </Link>

            {/* Cart with Total */}
            <Link
              href="/cart"
              className="flex items-center gap-3 ml-2 px-4 py-2.5 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg group bg-gradient-to-br from-orange-50/50 to-red-50/50"
              style={{borderColor: 'rgba(255,117,91,0.2)'}}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" style={{color: 'var(--primary)'}} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse" style={{background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)', fontSize: '10px', boxShadow: '0 2px 8px rgba(255,87,51,0.4)'}}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-medium" style={{color: 'var(--gray-60)'}}>
                  {cartCount} item
                </p>
                <p className="text-sm font-black" style={{color: 'var(--primary)'}}>
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </Link>

            {/* Auth Buttons */}
            {!session && (
              <Link
                href="/auth/login"
                className="ml-2 px-6 py-2.5 text-white text-sm font-bold rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)',
                  boxShadow: '0 4px 12px rgba(255, 117, 91, 0.25)'
                }}
              >
                Login
              </Link>
            )}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:bg-red-50"
                style={{
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(254, 226, 226, 0.3)'
                }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Mobile Header - Shopee Style */}
        <div className="md:hidden flex items-center gap-2 h-14">
          {/* Search Bar - Full Width - Live Search */}
          <form onSubmit={handleMobileSearch} className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 text-sm border rounded-lg outline-none focus:border-primary bg-gray-50"
                style={{borderColor: 'var(--gray-30)'}}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{color: 'var(--gray-60)'}}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!searchQuery && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center pointer-events-none" style={{color: 'var(--primary)'}}>
                  <Search className="w-4 h-4" />
                </div>
              )}
            </div>
          </form>

          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            className="relative p-2 shrink-0"
            style={{color: 'var(--gray-60)'}}
          >
            <Heart className="w-6 h-6" />
            {wishlistCount > 0 && (
              <span className="absolute top-0 right-0 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{backgroundColor: 'var(--primary)', fontSize: '10px'}}>
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 shrink-0"
            style={{color: 'var(--gray-60)'}}
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{backgroundColor: 'var(--primary)', fontSize: '10px'}}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3 space-y-1" style={{borderColor: 'var(--gray-30)'}}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900"
              style={{color: pathname === "/" ? 'var(--primary)' : 'var(--gray-60)'}}
            >
              Beranda
            </Link>
            <Link
              href="/#products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900"
              style={{color: 'var(--gray-60)'}}
            >
              Produk
            </Link>
            {session ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900"
                  style={{color: 'var(--gray-60)'}}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {session.user?.name || "Profile"}
                  </div>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{color: 'var(--accent-red)'}}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </div>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mx-4 my-2 px-4 py-3 text-white text-sm font-bold text-center rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)',
                    boxShadow: '0 4px 12px rgba(255, 117, 91, 0.25)'
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mx-4 px-4 py-3 text-sm font-bold text-center rounded-2xl border-2 transition-all duration-300 hover:scale-105"
                  style={{
                    color: '#FF755B',
                    borderColor: 'rgba(255, 117, 91, 0.3)',
                    backgroundColor: 'rgba(255, 117, 91, 0.05)'
                  }}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
