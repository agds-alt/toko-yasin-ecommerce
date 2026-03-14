"use client";

import Navbar from "../_components/Navbar";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  // TODO: Implement wishlist functionality with context/state management
  const wishlistItems: any[] = [];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{
              color: 'var(--gray-900)',
              fontFamily: 'Urbanist'
            }}>
              Wishlist Saya
            </h1>
            <p className="text-base" style={{color: 'var(--gray-60)'}}>
              {wishlistItems.length} produk dalam wishlist
            </p>
          </div>

          {/* Empty State */}
          {wishlistItems.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" style={{color: 'var(--gray-900)'}} />
              <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>
                Wishlist Kosong
              </h2>
              <p className="mb-6" style={{color: 'var(--gray-60)'}}>
                Anda belum menambahkan produk ke wishlist
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 text-white font-semibold rounded-full transition-all hover:opacity-90"
                style={{backgroundColor: 'var(--primary)'}}
              >
                Belanja Sekarang
              </Link>
            </div>
          )}

          {/* Wishlist Grid - Will show when items exist */}
          {wishlistItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Product cards will be here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
