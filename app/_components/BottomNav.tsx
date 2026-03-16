"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Package, User, LayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Don't show bottom nav on auth pages
  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const customerNavItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: pathname === "/",
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
      href: session ? "/profile" : "/auth/login",
      icon: User,
      active: pathname === "/profile",
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
      {/* Bottom Navigation - Clean Floating Style */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 pb-safe pointer-events-none"
        style={{
          zIndex: 9999,
          position: 'fixed',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        {/* Navigation Card - Floating Style */}
        <div className="relative mx-6 mb-6 pointer-events-auto">
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-gray-200/80 px-2 py-1">
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
                      relative flex flex-col items-center justify-center px-3 py-1 rounded-[1.5rem]
                      transition-all duration-300 ease-out
                      ${
                        item.active
                          ? "text-white shadow-lg scale-105"
                          : "text-gray-600 hover:text-orange-600 hover:bg-orange-50/50 active:scale-95"
                      }
                    `}
                    style={item.active ? {
                      background: 'linear-gradient(135deg, #FF755B 0%, #FF5733 100%)',
                      boxShadow: '0 8px 24px rgba(255, 117, 91, 0.4)'
                    } : {}}
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
    </>
  );
}
