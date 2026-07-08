import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart";

type ShippingAddress = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  state: string;
};

type CreateOrderInput = {
  email: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
};

function offlineId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function storeOfflineSubmission(key: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    window.localStorage.setItem(
      key,
      JSON.stringify([...existing, { ...payload, createdAt: new Date().toISOString() }]),
    );
  } catch {}
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        email: input.email,
        shipping_address: input.shippingAddress,
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: 0,
        total: input.total,
        status: "pending",
        notes: input.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !order) throw error ?? new Error("Order was not created.");

    const { error: itemError } = await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: null,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        customization: item.variant ? { variant: item.variant } : null,
      })),
    );

    if (itemError) throw itemError;
    return { id: order.id, offline: false };
  } catch (error) {
    const id = offlineId("BTC");
    storeOfflineSubmission("btc.pendingOrders.v1", { ...input, id });
    return { id, offline: true, error };
  }
}

export async function saveContactMessage(payload: Record<string, unknown>) {
  storeOfflineSubmission("btc.contactMessages.v1", payload);
  return { offline: true };
}

export async function saveCustomRequest(payload: Record<string, unknown>) {
  storeOfflineSubmission("btc.customRequests.v1", payload);
  return { offline: true };
}
