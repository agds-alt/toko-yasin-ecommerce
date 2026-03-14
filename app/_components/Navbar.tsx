"use client";

import Link from "next/link";
import { ShoppingCart, LogOut, User, Menu, X, Search, Heart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useCart } from "../_contexts/CartContext";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { totalItems, totalPrice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Get categories for dropdown
  const { data: categories } = trpc.product.getCategories.useQuery();
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Search functionality
  const { data: searchData } = trpc.product.getAll.useQuery(
    {
      search: searchQuery,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined
    },
    { enabled: searchQuery.length > 0 }
  );

  const cartCount = totalItems;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to homepage with search params
      const params = new URLSearchParams();
      params.set('search', searchQuery);
      if (selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      router.push(`/?${params.toString()}`);
      setSearchQuery(""); // Clear search after navigation
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b" style={{borderColor: 'var(--gray-30)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo - Bold & Prominent */}
          <Link href="/" className="flex items-center group shrink-0">
            <span className="text-2xl sm:text-3xl font-black transition-colors" style={{
              color: 'var(--gray-900)',
              fontFamily: 'Urbanist',
              letterSpacing: '-0.02em'
            }}>
              TOKO YASIN
            </span>
          </Link>

          {/* Search Bar - Prominent Center (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="flex items-center border rounded-full overflow-hidden transition-all" style={{
                borderColor: searchFocused ? 'var(--primary)' : 'var(--gray-30)',
                boxShadow: searchFocused ? '0 0 0 3px rgba(255, 117, 91, 0.1)' : 'none'
              }}>
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-12 pl-4 pr-8 text-sm font-medium border-r outline-none bg-white cursor-pointer appearance-none"
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="flex-1 h-12 px-4 text-sm outline-none"
                  style={{color: 'var(--gray-900)'}}
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="h-12 px-6 text-white transition-all hover:opacity-90"
                  style={{backgroundColor: 'var(--primary)'}}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchQuery.length > 0 && searchData && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border max-h-96 overflow-y-auto" style={{borderColor: 'var(--gray-30)'}}>
                  {searchData.products.length > 0 ? (
                    <div className="divide-y" style={{borderColor: 'var(--gray-30)'}}>
                      {searchData.products.slice(0, 5).map((product) => {
                        const images = product.images || [];
                        const imageUrl = images[0] || "/placeholder.png";

                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            onClick={() => setSearchQuery("")}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                          >
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-contain bg-gray-100 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate" style={{color: 'var(--gray-900)'}}>
                                {product.name}
                              </h4>
                              <p className="text-xs" style={{color: 'var(--gray-60)'}}>
                                {product.category?.name}
                              </p>
                              <p className="text-sm font-bold mt-1" style={{color: 'var(--primary)'}}>
                                Rp {Number(product.price).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center" style={{color: 'var(--gray-60)'}}>
                      <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Produk tidak ditemukan</p>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Icons - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {/* Account */}
            <Link
              href={session ? "/profile" : "/auth/login"}
              className="flex flex-col items-center p-2 transition-colors hover:text-gray-900 group"
              style={{color: 'var(--gray-60)'}}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-medium">Akun</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="flex flex-col items-center p-2 transition-colors hover:text-gray-900 group"
              style={{color: 'var(--gray-60)'}}
            >
              <Heart className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-medium">Favorit</span>
            </Link>

            {/* Cart with Total */}
            <Link
              href="/cart"
              className="flex items-center gap-3 ml-2 px-4 py-2 rounded-full border transition-all hover:border-gray-900"
              style={{borderColor: 'var(--gray-30)'}}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" style={{color: 'var(--gray-900)'}} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{backgroundColor: 'var(--primary)', fontSize: '10px'}}>
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs" style={{color: 'var(--gray-60)'}}>
                  {cartCount} item
                </p>
                <p className="text-sm font-bold" style={{color: 'var(--gray-900)'}}>
                  Rp {totalPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </Link>

            {/* Auth Buttons */}
            {!session && (
              <Link
                href="/auth/login"
                className="ml-2 text-white text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderRadius: 'var(--radius-default)',
                  padding: '0.7em 0.8em',
                  display: 'inline-block',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline dotted';
                  e.currentTarget.style.textUnderlineOffset = '3px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Login
              </Link>
            )}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{color: 'var(--accent-red)'}}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile: Cart + Menu */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/cart"
              className="relative p-2"
              style={{color: 'var(--gray-60)'}}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full" style={{backgroundColor: 'var(--primary)', fontSize: '10px'}}>
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-colors hover:text-gray-900"
              style={{color: 'var(--gray-60)'}}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-12 text-sm border rounded-full outline-none focus:border-primary"
              style={{borderColor: 'var(--gray-30)'}}
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-10 w-10 rounded-full flex items-center justify-center text-white"
              style={{backgroundColor: 'var(--primary)'}}
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
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
                  className="block px-4 py-2 text-sm font-medium transition-colors hover:text-gray-900"
                  style={{color: 'var(--gray-60)'}}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mx-4 my-2 px-4 py-2 text-white text-sm font-medium transition-all hover:opacity-90 text-center"
                  style={{
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-default)',
                    padding: '0.7em 0.8em',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline dotted';
                    e.currentTarget.style.textUnderlineOffset = '3px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
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
