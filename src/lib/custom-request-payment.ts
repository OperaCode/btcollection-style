import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { sendCustomRequestStatusUpdateInternal } from "@/lib/custom-request-email";
import { createStripeCheckout, getStripeSessionStatus } from "@/lib/stripe";
import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal";
import type { Database, Tables } from "@/integrations/supabase/types";

// Checkout links are created on demand (not pre-generated when the quote
// email is sent) so they never go stale.
export const createCustomRequestCheckoutUrl = createServerFn({ method: "POST" })
  .validator((data: { id: string; gateway: "stripe" | "paypal" }) => data)
  .handler(async ({ data }): Promise<{ url?: string; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error || !request) return { error: "This quote could not be found." };
    if (request.status !== "awaiting_payment" || request.quoted_price == null) {
      return { error: "This quote is not currently awaiting payment." };
    }

    // Dynamic import, not top-level: this file is reachable from client
    // code (custom.pay.$id.tsx), and @tanstack/react-start/server is
    // server-only.
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const origin = getRequestUrl().origin;
    const items = [
      {
        id: request.id,
        slug: request.id,
        name: `Custom Order${request.item_type ? ` — ${request.item_type}` : ""}`.slice(0, 500),
        price: request.quoted_price,
        img: "",
        qty: 1,
      },
    ];
    const successUrl = `${origin}/custom/pay/${request.id}/success`;
    const cancelUrl = `${origin}/custom/pay/${request.id}`;

    try {
      if (data.gateway === "paypal") {
        const checkout = await createPayPalOrder({
          orderId: request.id,
          items,
          shippingLabel: null,
          shippingAmount: 0,
          successUrl,
          cancelUrl,
        });
        await supabaseAdmin
          .from("custom_requests")
          .update({ payment_gateway: "paypal", paypal_order_id: checkout.paypalOrderId })
          .eq("id", request.id);
        return { url: checkout.url };
      }

      const checkout = await createStripeCheckout({
        orderId: request.id,
        items,
        shippingLabel: null,
        shippingAmount: 0,
        buyerEmail: request.email,
        successUrl,
        cancelUrl,
      });

      await supabaseAdmin
        .from("custom_requests")
        .update({ payment_gateway: "stripe", stripe_checkout_session_id: checkout.stripeSessionId })
        .eq("id", request.id);

      return { url: checkout.url };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not start checkout." };
    }
  });

// Shared by both the customer's return-from-Stripe redirect and the Stripe
// webhook — same race-tolerant pattern as markOrderPaid in paid-order-checkout.ts.
async function markCustomRequestPaid(
  supabaseAdmin: SupabaseClient<Database>,
  request: Tables<"custom_requests">,
  paymentId: string | null,
) {
  if (request.paid_at) return { paid: true as const };

  const isPayPal = request.payment_gateway === "paypal";
  const base = { status: "processing", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { data: updated, error } = isPayPal
    ? await supabaseAdmin
        .from("custom_requests")
        .update({ ...base, paypal_capture_id: paymentId })
        .eq("id", request.id)
        .is("paid_at", null)
        .select("id")
    : await supabaseAdmin
        .from("custom_requests")
        .update({ ...base, stripe_payment_id: paymentId })
        .eq("id", request.id)
        .is("paid_at", null)
        .select("id");

  if (error) throw error;
  if (!updated || updated.length === 0) {
    // Someone else (webhook vs. redirect) already marked this paid.
    return { paid: true as const };
  }

  await sendCustomRequestStatusUpdateInternal({
    id: request.id,
    fullName: request.full_name,
    email: request.email,
    status: "processing",
  });

  return { paid: true as const };
}

export const confirmCustomRequestPayment = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ paid: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error || !request) return { paid: false, error: "Request not found." };
    if (request.paid_at) {
      const existingPaymentId =
        request.payment_gateway === "paypal" ? request.paypal_capture_id : request.stripe_payment_id;
      return markCustomRequestPaid(supabaseAdmin, request, existingPaymentId);
    }

    if (request.payment_gateway === "paypal") {
      if (!request.paypal_order_id) return { paid: false, error: "This request has no payment attached yet." };
      const status = await capturePayPalOrder(request.paypal_order_id);
      if (!status.paid) {
        return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
      }
      return markCustomRequestPaid(supabaseAdmin, request, status.paymentId);
    }

    if (!request.stripe_checkout_session_id) {
      return { paid: false, error: "This request has no payment attached yet." };
    }

    const status = await getStripeSessionStatus(request.stripe_checkout_session_id);
    if (!status.paid) {
      return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
    }

    return markCustomRequestPaid(supabaseAdmin, request, status.paymentId);
  });

// Called from the Stripe webhook (src/lib/stripe-webhook.ts) — the reliable
// source of truth regardless of whether the customer's browser ever makes
// it back to the success page. Wrapped in createServerOnlyFn (rather than
// createServerFn) since this is invoked directly from server code, not over
// an RPC — it just needs to be kept out of the client bundle.
export const markCustomRequestPaidByStripeSessionId = createServerOnlyFn(
  async (stripeSessionId: string, paymentId: string | null) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("stripe_checkout_session_id", stripeSessionId)
      .single();
    if (error || !request) return;

    await markCustomRequestPaid(supabaseAdmin, request, paymentId);
  },
);

// Called from the PayPal webhook (src/lib/paypal-webhook.ts) — see the
// comment there on why this one isn't just a backup the way the Stripe
// version above is.
export const markCustomRequestPaidByPayPalOrderId = createServerOnlyFn(
  async (paypalOrderId: string, paymentId: string | null) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("paypal_order_id", paypalOrderId)
      .single();
    if (error || !request) return;

    await markCustomRequestPaid(supabaseAdmin, request, paymentId);
  },
);
