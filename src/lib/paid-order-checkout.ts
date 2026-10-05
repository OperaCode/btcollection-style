import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import type { CartItem } from "@/lib/cart";
import type { Database, Json } from "@/integrations/supabase/types";
import { calculateStripeTax, createStripeCheckout, getStripeSessionStatus } from "@/lib/stripe";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";
import { verifyShippingRate } from "@/lib/shippo";
import { resolveDiscount } from "@/lib/discounts";
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
  gateway: "stripe" | "paypal";
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
  payment_gateway: string;
  stripe_checkout_session_id: string | null;
  paypal_order_id: string | null;
};

export const startOrderCheckout = createServerFn({ method: "POST" })
  .validator((data: StartCheckoutInput) => data)
  .handler(async ({ data: input }) => {
    if (!input.items.length) throw new Error("Your bag is empty.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const productIds = [...new Set(input.items.map((item) => item.id))];
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, category, base_price, text_addon_price, image_addon_price, in_stock")
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
        // Apparel is eligible for the NY clothing rules in Stripe Tax;
        // drinkware and every other physical product use the standard
        // tangible-goods code. Never infer this from client-provided data.
        taxCode: /apparel/i.test(product.category) ? "txcd_30011000" : "txcd_99999999",
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

    const shippingRate = input.shippingRateId ? await verifyShippingRate(input.shippingRateId) : null;
    if (input.shippingRateId && !shippingRate) {
      throw new Error("Your selected shipping option has expired. Please choose delivery again.");
    }
    const shipping = shippingRate?.amount ?? 0;
    const deliveryMethod = shippingRate?.label;
    // Stripe Checkout calculates tax itself. PayPal uses this same Stripe
    // Tax calculation instead of the old flat NY rate, which overcharged
    // eligible clothing below $110.
    const taxAmount = input.gateway === "paypal"
      ? await calculateStripeTax({
          items,
          shippingAmount: shipping,
          shippingAddress: input.shippingAddress,
          discountAmount,
        })
      : 0;
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
        payment_gateway: input.gateway,
      })
      .select("id")
      .single();
    if (error || !session) throw error ?? new Error("Checkout could not be started.");

    // PayPal has no equivalent of Stripe Tax, so it still needs tax handed
    // to it as a plain amount. Stripe gets automaticTax instead (below) and
    // calculates its own, more accurate, address-exact figure — so it must
    // NOT also get this as a line item, or the customer would be taxed
    // twice.
    const extraLines: Array<{ label: string; amount: number }> = [];
    if (input.gateway === "paypal" && taxAmount > 0) {
      extraLines.push({ label: "Sales Tax", amount: taxAmount });
    }

    // Dynamic import, not top-level: this file is reachable from client
    // code (checkout.tsx), and @tanstack/react-start/server is server-only.
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const origin = getRequestUrl().origin;
    const discount =
      discountAmount > 0 ? { label: `Discount (${discountCode})`, amount: discountAmount } : undefined;
    const successUrl = `${origin}/checkout/success?orderId=${session.id}`;
    const cancelUrl = `${origin}/cart`;

    if (input.gateway === "paypal") {
      const checkout = await createPayPalOrder({
        orderId: session.id,
        items,
        shippingLabel: deliveryMethod ?? null,
        shippingAmount: shipping,
        extraLines,
        discount,
        successUrl,
        cancelUrl,
      });
      const { error: updateError } = await supabaseAdmin
        .from("checkout_sessions")
        .update({ paypal_order_id: checkout.paypalOrderId })
        .eq("id", session.id);
      if (updateError) throw updateError;
      return { orderId: session.id as string, url: checkout.url };
    }

    const checkout = await createStripeCheckout({
      orderId: session.id,
      items,
      shippingLabel: deliveryMethod ?? null,
      shippingAmount: shipping,
      extraLines,
      discount,
      buyerEmail: input.email,
      shippingAddress: input.shippingAddress,
      automaticTax: true,
      successUrl,
      cancelUrl,
    });
    const { error: updateError } = await supabaseAdmin
      .from("checkout_sessions")
      .update({ stripe_checkout_session_id: checkout.stripeSessionId })
      .eq("id", session.id);
    if (updateError) throw updateError;
    return { orderId: session.id as string, url: checkout.url };
  });

// `actualTax`, when provided, is the real tax Stripe Tax calculated and
// charged on the completed session — more accurate than (and sometimes
// slightly different from) this app's own pre-checkout estimate stored on
// the session row, since Stripe computes it from the exact address rather
// than a flat per-state rate. When present, it overrides the session's
// estimate for the actual order record and receipt, so what's recorded
// matches what the customer was really charged.
async function createPaidOrder(
  supabaseAdmin: SupabaseClient<Database>,
  session: CheckoutSession,
  paymentId: string | null,
  actualTax?: number | null,
) {
  const { data: existing, error: existingError } = await supabaseAdmin.from("orders").select("id").eq("id", session.id).maybeSingle();
  if (existingError) throw existingError;
  if (existing) return { paid: true as const, orderId: existing.id };
  const isPayPal = session.payment_gateway === "paypal";
  const paidAt = new Date().toISOString();
  const { error: sessionError } = isPayPal
    ? await supabaseAdmin.from("checkout_sessions").update({ paypal_capture_id: paymentId, paid_at: paidAt }).eq("id", session.id)
    : await supabaseAdmin.from("checkout_sessions").update({ stripe_payment_id: paymentId, paid_at: paidAt }).eq("id", session.id);
  if (sessionError) throw sessionError;

  const tax = actualTax != null ? actualTax : Number(session.tax);
  const total = Number(session.subtotal) - Number(session.discount_amount) + tax + Number(session.shipping);

  const orderBase = {
    id: session.id, email: session.email, shipping_address: session.shipping_address, subtotal: session.subtotal, shipping: session.shipping,
    tax, discount_code: session.discount_code, discount_amount: session.discount_amount,
    total, status: "paid" as const, delivery_method: session.delivery_method,
  };
  const { error: orderError } = isPayPal
    ? await supabaseAdmin.from("orders").insert({ ...orderBase, payment_gateway: "paypal", paypal_capture_id: paymentId })
    : await supabaseAdmin.from("orders").insert({ ...orderBase, payment_gateway: "stripe", stripe_payment_id: paymentId });
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
    tax,
    discountCode: session.discount_code,
    discountAmount: Number(session.discount_amount),
    total,
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

    if (session.payment_gateway === "paypal") {
      if (!session.paypal_order_id) return { paid: false, error: "This checkout has no payment attached yet." };
      const status = await capturePayPalOrder(session.paypal_order_id);
      if (!status.paid) return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
      return createPaidOrder(supabaseAdmin, session, status.paymentId);
    }

    if (!session.stripe_checkout_session_id) return { paid: false, error: "This checkout has no payment attached yet." };
    const status = await getStripeSessionStatus(session.stripe_checkout_session_id);
    if (!status.paid) return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
    return createPaidOrder(supabaseAdmin, session, status.paymentId, status.taxAmount);
  });

export const markOrderPaidByStripeSessionId = createServerOnlyFn(
  async (stripeSessionId: string, paymentId: string | null, taxAmount?: number | null) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: session, error } = await supabaseAdmin.from("checkout_sessions").select("*").eq("stripe_checkout_session_id", stripeSessionId).single();
    if (error || !session) return;
    await createPaidOrder(supabaseAdmin, session, paymentId, taxAmount);
  },
);

export const markOrderPaidByPayPalOrderId = createServerOnlyFn(async (paypalOrderId: string, paymentId: string | null) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: session, error } = await supabaseAdmin.from("checkout_sessions").select("*").eq("paypal_order_id", paypalOrderId).single();
  if (error || !session) return;
  await createPaidOrder(supabaseAdmin, session, paymentId);
});
