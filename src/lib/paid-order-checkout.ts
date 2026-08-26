import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import type { CartItem } from "@/lib/cart";
import type { Database, Json } from "@/integrations/supabase/types";
import { createSquareCheckout, getSquareOrderStatus } from "@/lib/square";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/order-email";

type ShippingAddress = { name: string; email: string; phone: string; address: string; city: string; zip: string; state: string };
type StartCheckoutInput = { email: string; shippingAddress: ShippingAddress; items: CartItem[]; subtotal: number; shipping: number; total: number; deliveryMethod?: string };
type CheckoutSession = { id: string; email: string; shipping_address: Json; items: Json; subtotal: number; shipping: number; total: number; delivery_method: string | null; square_checkout_order_id: string | null };

export const startOrderCheckout = createServerFn({ method: "POST" })
  .validator((data: StartCheckoutInput) => data)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin.from("checkout_sessions").insert({
      email: input.email, shipping_address: input.shippingAddress, items: input.items as unknown as Json,
      subtotal: input.subtotal, shipping: input.shipping, total: input.total, delivery_method: input.deliveryMethod ?? null,
    }).select("id").single();
    if (error || !session) throw error ?? new Error("Checkout could not be started.");
    const checkout = await createSquareCheckout({
      orderId: session.id, items: input.items, shippingLabel: input.deliveryMethod ?? null, shippingAmount: input.shipping,
      buyerEmail: input.email, buyerName: input.shippingAddress.name, buyerPhone: input.shippingAddress.phone,
      buyerAddress: { address: input.shippingAddress.address, city: input.shippingAddress.city, state: input.shippingAddress.state, zip: input.shippingAddress.zip },
      redirectUrl: `${getRequestUrl().origin}/checkout/success?orderId=${session.id}`,
    });
    const { error: updateError } = await supabaseAdmin.from("checkout_sessions").update({ square_checkout_order_id: checkout.squareOrderId }).eq("id", session.id);
    if (updateError) throw updateError;
    return { orderId: session.id as string, url: checkout.url };
  });

async function createPaidOrder(supabaseAdmin: SupabaseClient<Database>, session: CheckoutSession, paymentId: string | null) {
  const { data: existing, error: existingError } = await supabaseAdmin.from("orders").select("id").eq("id", session.id).maybeSingle();
  if (existingError) throw existingError;
  if (existing) return { paid: true as const, orderId: existing.id };
  const { error: sessionError } = await supabaseAdmin.from("checkout_sessions").update({ square_payment_id: paymentId, paid_at: new Date().toISOString() }).eq("id", session.id);
  if (sessionError) throw sessionError;
  const { error: orderError } = await supabaseAdmin.from("orders").insert({
    id: session.id, email: session.email, shipping_address: session.shipping_address, subtotal: session.subtotal, shipping: session.shipping,
    tax: 0, total: session.total, status: "paid", delivery_method: session.delivery_method, square_payment_id: paymentId,
  });
  if (orderError) {
    if (orderError.code === "23505") return { paid: true as const, orderId: session.id };
    throw orderError;
  }
  const items = session.items as unknown as CartItem[];
  const { error: itemError } = await supabaseAdmin.from("order_items").insert(items.map((item) => ({ order_id: session.id, product_id: item.id, name: item.name, price: item.price, quantity: item.qty, customization: item.customization ?? null })));
  if (itemError) throw itemError;
  const emailInput = { orderId: session.id, email: session.email, items: items.map((item) => ({ name: item.name, price: item.price, qty: item.qty })), subtotal: Number(session.subtotal), shipping: Number(session.shipping), total: Number(session.total), deliveryMethod: session.delivery_method };
  await Promise.all([sendOrderConfirmation({ data: emailInput }), sendOrderNotification({ data: emailInput })]);
  return { paid: true as const, orderId: session.id };
}

export const confirmOrderPayment = createServerFn({ method: "POST" })
  .validator((data: { orderId: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin.from("checkout_sessions").select("*").eq("id", data.orderId).single();
    if (error || !session) return { paid: false, error: "Checkout session not found." };
    const { data: existing } = await supabaseAdmin.from("orders").select("id").eq("id", session.id).maybeSingle();
    if (existing) return { paid: true as const, orderId: existing.id };
    if (!session.square_checkout_order_id) return { paid: false, error: "This checkout has no payment attached yet." };
    const status = await getSquareOrderStatus(session.square_checkout_order_id);
    if (!status.paid) return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
    return createPaidOrder(supabaseAdmin, session, status.paymentId);
  });

export const markOrderPaidBySquareOrderId = createServerOnlyFn(async (squareOrderId: string, paymentId: string | null) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: session, error } = await supabaseAdmin.from("checkout_sessions").select("*").eq("square_checkout_order_id", squareOrderId).single();
  if (error || !session) return;
  await createPaidOrder(supabaseAdmin, session, paymentId);
});
