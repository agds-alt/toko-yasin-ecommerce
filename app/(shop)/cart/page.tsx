"use client";

import Navbar from "@/app/_components/Navbar";
import { useCart } from "@/app/_contexts/CartContext";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

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
              Keranjang Belanja
            </h1>
            <p className="text-base" style={{color: 'var(--gray-60)'}}>
              {totalItems} produk dalam keranjang
            </p>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" style={{color: 'var(--gray-900)'}} />
              <h2 className="text-xl font-semibold mb-2" style={{color: 'var(--gray-900)'}}>
                Keranjang Kosong
              </h2>
              <p className="mb-6" style={{color: 'var(--gray-60)'}}>
                Anda belum menambahkan produk ke keranjang
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

          {/* Cart Items */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border" style={{borderColor: 'var(--gray-30)'}}>
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/products/${item.slug}`} className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 sm:w-32 sm:h-32 object-contain bg-gray-50 rounded-lg"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="text-base sm:text-lg font-semibold mb-2 hover:text-primary transition-colors" style={{color: 'var(--gray-900)'}}>
                            {item.name}
                          </h3>
                        </Link>

                        <p className="text-xl font-bold mb-4" style={{color: 'var(--primary)', fontFamily: 'Urbanist'}}>
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                              style={{borderColor: 'var(--gray-30)'}}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-center border rounded text-sm font-semibold outline-none"
                              style={{borderColor: 'var(--gray-30)'}}
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded border flex items-center justify-center transition-colors hover:bg-gray-100"
                              style={{borderColor: 'var(--gray-30)'}}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus ${item.name} dari keranjang?`)) {
                                removeFromCart(item.id);
                              }
                            }}
                            className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t" style={{borderColor: 'var(--gray-30)'}}>
                          <div className="flex items-center justify-between text-sm">
                            <span style={{color: 'var(--gray-60)'}}>Subtotal:</span>
                            <span className="font-bold" style={{color: 'var(--gray-900)'}}>
                              Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 shadow-sm border sticky top-24" style={{borderColor: 'var(--gray-30)'}}>
                  <h2 className="text-xl font-bold mb-4" style={{color: 'var(--gray-900)', fontFamily: 'Urbanist'}}>
                    Ringkasan Pesanan
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span style={{color: 'var(--gray-60)'}}>Subtotal ({totalItems} item)</span>
                      <span className="font-semibold" style={{color: 'var(--gray-900)'}}>
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span style={{color: 'var(--gray-60)'}}>Ongkir</span>
                      <span className="text-sm" style={{color: 'var(--gray-60)'}}>
                        Dihitung di checkout
                      </span>
                    </div>

                    <div className="pt-3 border-t" style={{borderColor: 'var(--gray-30)'}}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold" style={{color: 'var(--gray-900)'}}>Total</span>
                        <span className="text-2xl font-bold" style={{color: 'var(--primary)', fontFamily: 'Urbanist'}}>
                          Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      if (!session) {
                        router.push('/auth/login');
                        return;
                      }
                      router.push('/checkout');
                    }}
                    className="w-full py-3 text-white font-semibold rounded-full transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{backgroundColor: 'var(--primary)'}}
                  >
                    Lanjut ke Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <Link
                    href="/"
                    className="block text-center mt-3 text-sm font-medium transition-colors hover:opacity-80"
                    style={{color: 'var(--gray-60)'}}
                  >
                    Lanjut Belanja
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
