import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { sendCustomRequestStatusUpdate } from "@/lib/custom-request-email";

// Checkout Sessions are created on demand (not pre-generated when the quote
// email is sent) so they never go stale — Stripe expires sessions after 24h,
// and a quote might sit unopened for days before the customer clicks "Pay".
export const createCustomRequestCheckoutUrl = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ url?: string; error?: string }> => {
    const { getStripe } = await import("@/lib/stripe.server");
    const stripe = getStripe();
    if (!stripe) {
      return { error: "Online payment isn't set up yet. Please contact us to arrange payment." };
    }

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

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: request.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(request.quoted_price * 100),
            product_data: {
              name: `Custom Order${request.item_type ? ` — ${request.item_type}` : ""}`,
              description: request.quote_note?.slice(0, 500) || undefined,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/custom/pay/${request.id}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/custom/pay/${request.id}`,
      metadata: { custom_request_id: request.id },
    });

    await supabaseAdmin
      .from("custom_requests")
      .update({ stripe_session_id: session.id })
      .eq("id", request.id);

    if (!session.url) return { error: "Could not start checkout. Please try again." };
    return { url: session.url };
  });

export const confirmCustomRequestPayment = createServerFn({ method: "POST" })
  .validator((data: { id: string; sessionId: string }) => data)
  .handler(async ({ data }): Promise<{ paid: boolean; error?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: request, error } = await supabaseAdmin
      .from("custom_requests")
      .select("*")
      .eq("id", data.id)
      .single();

    if (error || !request) return { paid: false, error: "Request not found." };

    // Already processed — idempotent success if the customer refreshes this page.
    if (request.paid_at) return { paid: true };

    if (request.stripe_session_id !== data.sessionId) {
      return { paid: false, error: "This payment link does not match this request." };
    }

    const { getStripe } = await import("@/lib/stripe.server");
    const stripe = getStripe();
    if (!stripe) return { paid: false, error: "Online payment isn't set up yet." };

    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.payment_status !== "paid" || session.metadata?.custom_request_id !== request.id) {
      return { paid: false, error: "Payment was not completed." };
    }

    await supabaseAdmin
      .from("custom_requests")
      .update({
        status: "processing",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    await sendCustomRequestStatusUpdate({
      data: { id: request.id, fullName: request.full_name, email: request.email, status: "processing" },
    });

    return { paid: true };
  });
