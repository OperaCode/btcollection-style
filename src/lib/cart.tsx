import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartCustomization = {
  size?: string;
  text?: string;
  photoPath?: string;
  note?: string;
  occasion?: string;
};

export type CartItem = {
  id: string; // product UUID — matches order_items.product_id
  slug: string; // for routing to the product page
  name: string;
  price: number;
  img: string;
  qty: number;
  customization?: CartCustomization;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, customization?: CartCustomization) => void;
  setQty: (id: string, qty: number, customization?: CartCustomization) => void;
  clear: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "btc.cart.v2";

function keyOf(id: string, customization?: CartCustomization) {
  if (!customization) return id;
  const { size, text, photoPath, note, occasion } = customization;
  return `${id}::${[size, text, photoPath, note, occasion].map((v) => v ?? "").join("|")}`;
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
          const k = keyOf(item.id, item.customization);
          const found = prev.find((p) => keyOf(p.id, p.customization) === k);
          if (found) {
            return prev.map((p) =>
              keyOf(p.id, p.customization) === k ? { ...p, qty: p.qty + qty } : p,
            );
          }
          return [...prev, { ...item, qty }];
        });
        setOpen(true);
      },
      remove: (id, customization) =>
        setItems((prev) => prev.filter((p) => keyOf(p.id, p.customization) !== keyOf(id, customization))),
      setQty: (id, qty, customization) =>
        setItems((prev) =>
          prev
            .map((p) => (keyOf(p.id, p.customization) === keyOf(id, customization) ? { ...p, qty } : p))
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
