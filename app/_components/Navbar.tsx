"use client";

import Link from "next/link";
import { ShoppingCart, LogOut, User, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // TODO: Get cart count from tRPC
  const cartCount = 0;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Modern Gradient */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">TY</span>
            </div>
            <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Toko Yasin
            </div>
          </Link>

          {/* Navigation Links - Modern Pills */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              href="/#products"
              className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
            >
              Produk
            </Link>
          </div>

          {/* Right Side - Cart & Auth */}
          <div className="flex items-center space-x-2">
            {/* Cart - Modern Badge */}
            <Link
              href="/cart"
              className="relative p-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop Auth Buttons */}
            {status === "loading" ? (
              <div className="hidden sm:block w-20 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : session ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/orders"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">{session.user?.name || "Profile"}</span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg transition-all text-sm"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4 space-y-2 animate-slide-down">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
            >
              Home
            </Link>
            <Link
              href="/#products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
            >
              Produk
            </Link>
            {session ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-semibold rounded-lg transition-all"
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
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition-all"
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
                  className="block px-4 py-2 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg transition-all"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
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
