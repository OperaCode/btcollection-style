import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import type { CartItem } from "@/lib/cart";
import type { Database, Json } from "@/integrations/supabase/types";
import { createSquareCheckout, getSquareOrderStatus } from "@/lib/square";
import { verifyShippingRate } from "@/lib/shippo";
import { resolveDiscount } from "@/lib/discounts";
import { resolveTaxRate } from "@/lib/tax";
import { sendOrderConfirmation, sendOrderNotification } from "@/lib/order-email";

type ShippingAddress = { name: string; email: string; phone: string; address: string; city: string; zip: string; state: string };

// The client only ever proposes *which* products, quantities, delivery rate
// and discount code it wants — never their dollar values. Every amount
// charged (item prices, shipping, tax, discount) is looked up or computed
// here from the products table, a verified Shippo rate, the tax rate table,
// and a validated discount_codes row, so a tampered request can't buy
// anything below its real price.
type StartCheckoutInput = {
  email: string;
  shippingAddress: ShippingAddress;
  items: Array<Pick<CartItem, "id" | "slug" | "img" | "qty" | "customization">>;
  shippingRateId: string | null;
  discountCode: string | null;
};
type CheckoutSession = {
  id: string;
  email: string;
  shipping_address: Json;
  items: Json;
  subtotal: number;
  shipping: number;
  tax: number;
  discount_code: string | null;
  discount_amount: number;
  total: number;
  delivery_method: string | null;
  square_checkout_order_id: string | null;
};

export const startOrderCheckout = createServerFn({ method: "POST" })
  .validator((data: StartCheckoutInput) => data)
  .handler(async ({ data: input }) => {
    if (!input.items.length) throw new Error("Your bag is empty.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const productIds = [...new Set(input.items.map((item) => item.id))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, base_price, text_addon_price, image_addon_price, in_stock")
      .in("id", productIds);
    if (productsError) throw productsError;
    const productById = new Map((products ?? []).map((p) => [p.id, p]));

    const items: CartItem[] = input.items.map((item) => {
      const product = productById.get(item.id);
      if (!product) throw new Error("One of the items in your bag is no longer available.");
      if (!product.in_stock) throw new Error(`"${product.name}" is currently out of stock.`);

      const hasText = Boolean(item.customization?.text?.trim());
      const hasPhoto = Boolean(item.customization?.photoPath);
      const price =
        Number(product.base_price) +
        (hasText ? Number(product.text_addon_price) : 0) +
        (hasPhoto ? Number(product.image_addon_price) : 0);

      return {
        id: item.id,
        slug: item.slug,
        name: product.name,
        price,
        img: item.img,
        qty: item.qty,
        customization: item.customization,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

    let discountCode: string | null = null;
    let discountAmount = 0;
    if (input.discountCode) {
      const resolution = await resolveDiscount(supabaseAdmin, {
        code: input.discountCode,
        email: input.email,
        subtotal,
      });
      if (!resolution.ok) throw new Error(resolution.error);
      discountCode = resolution.code;
      discountAmount = resolution.amount;
    }

    const taxRate = resolveTaxRate(input.shippingAddress.state);
    const taxAmount = Math.round((subtotal - discountAmount) * taxRate * 100) / 100;

    const shippingRate = input.shippingRateId ? await verifyShippingRate(input.shippingRateId) : null;
    if (input.shippingRateId && !shippingRate) {
      throw new Error("Your selected shipping option has expired. Please choose delivery again.");
    }
    const shipping = shippingRate?.amount ?? 0;
    const deliveryMethod = shippingRate?.label;
    const total = subtotal - discountAmount + taxAmount + shipping;
    if (total <= 0) {
      throw new Error("This discount brings your order to $0 — please contact us directly to place it.");
    }

    const { data: session, error } = await supabaseAdmin
      .from("checkout_sessions")
      .insert({
        email: input.email,
        shipping_address: input.shippingAddress,
        items: items as unknown as Json,
        subtotal,
        shipping,
        tax: taxAmount,
        discount_code: discountCode,
        discount_amount: discountAmount,
        total,
        delivery_method: deliveryMethod ?? null,
      })
      .select("id")
      .single();
    if (error || !session) throw error ?? new Error("Checkout could not be started.");

    const extraLines: Array<{ label: string; amount: number }> = [];
    if (taxAmount > 0) extraLines.push({ label: "Sales Tax", amount: taxAmount });

    // Dynamic import, not top-level: this file is reachable from client
    // code (checkout.tsx), and @tanstack/react-start/server is server-only.
    const { getRequestUrl } = await import("@tanstack/react-start/server");

    const checkout = await createSquareCheckout({
      orderId: session.id,
      items,
      shippingLabel: deliveryMethod ?? null,
      shippingAmount: shipping,
      extraLines,
      discount: discountAmount > 0 ? { label: `Discount (${discountCode})`, amount: discountAmount } : undefined,
      buyerEmail: input.email,
      buyerName: input.shippingAddress.name,
      buyerPhone: input.shippingAddress.phone,
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
    tax: session.tax, discount_code: session.discount_code, discount_amount: session.discount_amount,
    total: session.total, status: "paid", delivery_method: session.delivery_method, square_payment_id: paymentId,
  });
  if (orderError) {
    if (orderError.code === "23505") return { paid: true as const, orderId: session.id };
    throw orderError;
  }
  const items = session.items as unknown as CartItem[];
  const { error: itemError } = await supabaseAdmin.from("order_items").insert(items.map((item) => ({ order_id: session.id, product_id: item.id, name: item.name, price: item.price, quantity: item.qty, customization: item.customization ?? null })));
  if (itemError) throw itemError;
  const emailInput = {
    orderId: session.id,
    email: session.email,
    items: items.map((item) => ({ name: item.name, price: item.price, qty: item.qty })),
    subtotal: Number(session.subtotal),
    shipping: Number(session.shipping),
    tax: Number(session.tax),
    discountCode: session.discount_code,
    discountAmount: Number(session.discount_amount),
    total: Number(session.total),
    deliveryMethod: session.delivery_method,
  };
  await Promise.all([sendOrderConfirmation(emailInput), sendOrderNotification(emailInput)]);
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
