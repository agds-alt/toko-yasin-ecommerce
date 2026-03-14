"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingCart, Package, User, LayoutDashboard, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotFound, setShowNotFound] = useState(false);

  // Don't show bottom nav on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  // Search functionality
  const { data: searchData, isLoading: isSearching } = trpc.product.getAll.useQuery(
    { search: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Show not found notification after typing stops
  useEffect(() => {
    if (searchQuery.length > 0 && searchData && searchData.products.length === 0 && !isSearching) {
      setShowNotFound(true);
      const timer = setTimeout(() => setShowNotFound(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowNotFound(false);
    }
  }, [searchData, searchQuery, isSearching]);

  const customerNavItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
      onClick: undefined,
    },
    {
      name: "Cari",
      href: "#",
      icon: Search,
      active: false,
      onClick: () => setShowSearch(true),
    },
    {
      name: "Keranjang",
      href: "/cart",
      icon: ShoppingCart,
      active: pathname === "/cart",
      onClick: undefined,
    },
    {
      name: "Pesanan",
      href: "/orders",
      icon: Package,
      active: pathname?.startsWith("/orders"),
      onClick: undefined,
    },
    {
      name: session ? "Profile" : "Login",
      href: session ? "/orders" : "/auth/login",
      icon: User,
      active: false,
      onClick: undefined,
    },
  ];

  const adminNavItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      name: "Produk",
      href: "/admin/products",
      icon: Package,
      active: pathname?.startsWith("/admin/products"),
    },
    {
      name: "Pesanan",
      href: "/admin/orders",
      icon: ShoppingCart,
      active: pathname?.startsWith("/admin/orders"),
    },
    {
      name: "Store",
      href: "/",
      icon: Home,
      active: pathname === "/" && !pathname.startsWith("/admin"),
    },
  ];

  const navItems = isAdmin && pathname?.startsWith("/admin") ? adminNavItems : customerNavItems;

  return (
    <>
      {/* Bottom Navigation - Telegram Style - Always Fixed */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 pb-safe pointer-events-none"
        style={{
          zIndex: 9999,
          position: 'fixed',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-transparent backdrop-blur-xl"></div>

        {/* Navigation Card - Floating Style */}
        <div className="relative mx-8 mb-4 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-gray-200/50 px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const Component = item.onClick ? "button" : Link;
                const props = item.onClick
                  ? { onClick: item.onClick, type: "button" as const }
                  : { href: item.href };

                return (
                  <Component
                    key={item.name}
                    {...props}
                    className={`
                      flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-[1.5rem]
                      transition-all duration-300 ease-out
                      ${
                        item.active
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 active:scale-95"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        transition-all duration-300
                        ${item.active ? "w-5 h-5" : "w-4 h-4"}
                      `}
                      strokeWidth={item.active ? 2.5 : 2}
                    />
                    <span
                      className={`
                        text-[0.65rem] font-semibold transition-all duration-300
                        ${item.active ? "scale-100 opacity-100" : "scale-90 opacity-80"}
                      `}
                    >
                      {item.name}
                    </span>
                  </Component>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
            }}
          ></div>

          {/* Search Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 text-lg outline-none"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {searchQuery.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Ketik untuk mencari produk</p>
                </div>
              ) : searchData?.products && searchData.products.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchData.products.map((product) => {
                    const images = product.images || [];
                    const imageUrl = images[0] || "/placeholder.png";

                    return (
                      <button
                        key={product.id}
                        onClick={() => {
                          router.push(`/products/${product.slug}`);
                          setShowSearch(false);
                          setSearchQuery("");
                        }}
                        className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all text-left"
                      >
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-16 h-16 object-contain bg-gray-100 rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.category?.name}
                          </p>
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 5
                              ? "bg-green-100 text-green-700"
                              : product.stock > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.stock > 0 ? `${product.stock} stok` : "Habis"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-2xl mb-2">🔍</p>
                  <p>Produk tidak ditemukan</p>
                  <p className="text-sm mt-2">Coba kata kunci lain</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification - Product Not Found */}
      {showNotFound && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[10001] animate-fade-in-up">
          <div className="bg-red-500 text-white px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 border-2 border-red-400">
            <div className="text-2xl">❌</div>
            <div>
              <p className="font-bold">Produk Tidak Ditemukan</p>
              <p className="text-sm text-red-100">Coba kata kunci lain</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
