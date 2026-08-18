import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { sendCustomRequestStatusUpdate } from "@/lib/custom-request-email";
import { createSquareCheckout, getSquareOrderStatus } from "@/lib/square";
import type { Database, Tables } from "@/integrations/supabase/types";

// Checkout links are created on demand (not pre-generated when the quote
// email is sent) so they never go stale.
export const createCustomRequestCheckoutUrl = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
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

    const origin = getRequestUrl().origin;

    try {
      const checkout = await createSquareCheckout({
        orderId: request.id,
        items: [
          {
            id: request.id,
            slug: request.id,
            name: `Custom Order${request.item_type ? ` — ${request.item_type}` : ""}`.slice(0, 500),
            price: request.quoted_price,
            img: "",
            qty: 1,
          },
        ],
        shippingLabel: null,
        shippingAmount: 0,
        buyerEmail: request.email,
        buyerName: request.full_name,
        buyerPhone: request.phone ?? undefined,
        redirectUrl: `${origin}/custom/pay/${request.id}/success`,
      });

      await supabaseAdmin
        .from("custom_requests")
        .update({ square_checkout_order_id: checkout.squareOrderId })
        .eq("id", request.id);

      return { url: checkout.url };
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Could not start checkout." };
    }
  });

// Shared by both the customer's return-from-Square redirect and the Square
// webhook — same race-tolerant pattern as markOrderPaid in order-payment.ts.
async function markCustomRequestPaid(
  supabaseAdmin: SupabaseClient<Database>,
  request: Tables<"custom_requests">,
  paymentId: string | null,
) {
  if (request.paid_at) return { paid: true as const };

  const { data: updated, error } = await supabaseAdmin
    .from("custom_requests")
    .update({
      status: "processing",
      paid_at: new Date().toISOString(),
      square_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id)
    .is("paid_at", null)
    .select("id");

  if (error) throw error;
  if (!updated || updated.length === 0) {
    // Someone else (webhook vs. redirect) already marked this paid.
    return { paid: true as const };
  }

  await sendCustomRequestStatusUpdate({
    data: { id: request.id, fullName: request.full_name, email: request.email, status: "processing" },
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
    if (request.paid_at) return markCustomRequestPaid(supabaseAdmin, request, request.square_payment_id);

    if (!request.square_checkout_order_id) {
      return { paid: false, error: "This request has no payment attached yet." };
    }

    const status = await getSquareOrderStatus(request.square_checkout_order_id);
    if (!status.paid) {
      return { paid: false, error: "Payment has not completed yet. If you just paid, please refresh in a moment." };
    }

    return markCustomRequestPaid(supabaseAdmin, request, status.paymentId);
  });

// Called from the Square webhook (src/lib/square-webhook.ts) — the reliable
// source of truth regardless of whether the customer's browser ever makes
// it back to the success page. Wrapped in createServerOnlyFn (rather than
// createServerFn) since this is invoked directly from server code, not over
// an RPC — it just needs to be kept out of the client bundle.
export const markCustomRequestPaidBySquareOrderId = createServerOnlyFn(
  async (squareOrderId: string, paymentId: string | null) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("square_checkout_order_id", squareOrderId)
      .single();
    if (error || !request) return;

    await markCustomRequestPaid(supabaseAdmin, request, paymentId);
  },
);
