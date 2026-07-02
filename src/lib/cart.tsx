import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  img: string;
  qty: number;
  variant?: string;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, variant?: string) => void;
  setQty: (id: string, qty: number, variant?: string) => void;
  clear: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "btc.cart.v1";

function keyOf(id: string, variant?: string) {
  return `${id}::${variant ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    return {
      items,
      count,
      subtotal,
      add: (item, qty = 1) => {
        setItems((prev) => {
          const k = keyOf(item.id, item.variant);
          const found = prev.find((p) => keyOf(p.id, p.variant) === k);
          if (found) {
            return prev.map((p) =>
              keyOf(p.id, p.variant) === k ? { ...p, qty: p.qty + qty } : p,
            );
          }
          return [...prev, { ...item, qty }];
        });
        setOpen(true);
      },
      remove: (id, variant) =>
        setItems((prev) => prev.filter((p) => keyOf(p.id, p.variant) !== keyOf(id, variant))),
      setQty: (id, qty, variant) =>
        setItems((prev) =>
          prev
            .map((p) => (keyOf(p.id, p.variant) === keyOf(id, variant) ? { ...p, qty } : p))
            .filter((p) => p.qty > 0),
        ),
      clear: () => setItems([]),
      isOpen,
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}