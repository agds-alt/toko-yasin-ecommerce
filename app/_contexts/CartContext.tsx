"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  variant?: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get cart key based on user
  const getCartKey = (userId: string | null) => {
    return userId ? `cart_${userId}` : "cart_guest";
  };

  // Load cart from localStorage when session changes
  useEffect(() => {
    setMounted(true);

    if (status === "loading") return;

    const userId = session?.user?.email || null;
    const cartKey = getCartKey(userId);

    // If user changed (login/logout), clear current cart and load new one
    if (currentUserId !== userId) {
      setCurrentUserId(userId);

      // Load cart for current user (only on client-side)
      if (typeof window !== "undefined") {
        const savedCart = localStorage.getItem(cartKey);
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart));
          } catch (error) {
            console.error("Failed to load cart from localStorage:", error);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
    }
  }, [session, status, currentUserId]);

  // Save cart to localStorage whenever it changes (only on client-side)
  useEffect(() => {
    if (mounted && currentUserId !== null && typeof window !== "undefined") {
      const cartKey = getCartKey(currentUserId);
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, mounted, currentUserId]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    setItems((prevItems) => {
      // Check if item already exists in cart (with same variant if applicable)
      const existingItem = prevItems.find((i) => {
        if (i.productId !== item.productId) return false;

        // Both have no variants
        if (!i.variant && !item.variant) return true;

        // One has variant, one doesn't
        if (!i.variant || !item.variant) return false;

        // Compare variants
        return JSON.stringify(i.variant) === JSON.stringify(item.variant);
      });

      if (existingItem) {
        // Update quantity if item exists with same variant
        return prevItems.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Add new item
        return [...prevItems, { ...item, id: Date.now().toString() }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
