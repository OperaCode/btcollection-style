import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import type { CartItem } from "@/lib/cart";
import type { Database, Tables } from "@/integrations/supabase/types";
import { createSquareCheckout, getSquareOrderStatus } from "@/lib/square";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/order-email";

type ShippingAddress = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  state: string;
};

type StartCheckoutInput = {
  email: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod?: string;
};

// Order is written to the DB as 'pending' before the customer ever reaches
// Square — that's what gives us a stable id to redirect back to and verify
// against. It only becomes visible/actionable to fulfillment once
// confirmOrderPayment flips it to 'paid'. No offline/localStorage fallback
// here on purpose: if we can't durably record the order, we must not send
// the customer on to pay for something we have no record of.
export const startOrderCheckout = createServerFn({ method: "POST" })
  .validator((data: StartCheckoutInput) => data)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        email: input.email,
        shipping_address: input.shippingAddress,
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: 0,
        total: input.total,
        status: "pending",
        delivery_method: input.deliveryMethod ?? null,
      })
      .select("id")
      .single();

    if (error || !order) throw error ?? new Error("Order was not created.");

    const { error: itemError } = await supabaseAdmin.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        customization: item.customization ?? null,
      })),
    );
    if (itemError) throw itemError;

    const origin = getRequestUrl().origin;
    const checkout = await createSquareCheckout({
      orderId: order.id,
      items: input.items,
      shippingLabel: input.deliveryMethod ?? null,
      shippingAmount: input.shipping,
      buyerEmail: input.email,
      buyerName: input.shippingAddress.name,
      buyerPhone: input.shippingAddress.phone,
      buyerAddress: {
        address: input.shippingAddress.address,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        zip: input.shippingAddress.zip,
      },
      redirectUrl: `${origin}/checkout/success?orderId=${order.id}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ square_checkout_order_id: checkout.squareOrderId })
      .eq("id", order.id);

    return { orderId: order.id as string, url: checkout.url };
  });

// Shared by both the customer's return-from-Square redirect and the Square
// webhook — whichever gets here first does the work; the `.eq("status",
// "pending")` on the update makes it a no-op (not a duplicate email) for
// whichever arrives second. That race is real: the webhook can beat the
// browser back to us.
async function markOrderPaid(
  supabaseAdmin: SupabaseClient<Database>,
  order: Tables<"orders">,
  paymentId: string | null,
) {
  if (order.status === "paid") return { paid: true as const, orderId: order.id };

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({ status: "paid", square_payment_id: paymentId })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id");

  if (updateError) throw updateError;
  if (!updated || updated.length === 0) {
    // Someone else (webhook vs. redirect) already marked this paid.
    return { paid: true as const, orderId: order.id };
  }

  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("name, price, quantity")
    .eq("order_id", order.id);

  const emailInput = {
    orderId: order.id,
    email: order.email,
    items: (items ?? []).map((it) => ({ name: it.name, price: Number(it.price), qty: it.quantity })),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    deliveryMethod: order.delivery_method,
  };

  await Promise.all([
    sendOrderConfirmation({ data: emailInput }),
    sendOrderNotification({ data: emailInput }),
  ]);

  return { paid: true as const, orderId: order.id };
}

export const confirmOrderPayment = createServerFn({ method: "POST" })
  .validator((data: { orderId: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (error || !order) return { paid: false, error: "Order not found." };

    if (order.status === "paid") return markOrderPaid(supabaseAdmin, order, order.square_payment_id);

    if (!order.square_checkout_order_id) {
      return { paid: false, error: "This order has no payment attached yet." };
    }

    const status = await getSquareOrderStatus(order.square_checkout_order_id);
    if (!status.paid) {
      return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
    }

    return markOrderPaid(supabaseAdmin, order, status.paymentId);
  });

// Called from the Square webhook (src/lib/square-webhook.ts), which is the
// reliable source of truth — it fires regardless of whether the customer's
// browser ever makes it back to /checkout/success. Wrapped in
// createServerOnlyFn (rather than createServerFn) since this is invoked
// directly from server code, not over an RPC — it just needs to be kept out
// of the client bundle.
export const markOrderPaidBySquareOrderId = createServerOnlyFn(
  async (squareOrderId: string, paymentId: string | null) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("square_checkout_order_id", squareOrderId)
      .single();
    if (error || !order) return;

    await markOrderPaid(supabaseAdmin, order, paymentId);
  },
);
