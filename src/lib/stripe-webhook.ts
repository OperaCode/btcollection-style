import Stripe from "stripe";

// Stripe's own SDK verifies webhook signatures for us
// (stripe.webhooks.constructEvent) — simpler and more robust than the
// manual HMAC-over-URL scheme Square's webhook required, and it doesn't
// depend on reconstructing or hardcoding the exact registered URL.
function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY.");
  return new Stripe(key);
}

export async function handleStripeWebhook(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Stripe webhook: missing signature header or STRIPE_WEBHOOK_SECRET.");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook: signature verification failed.", err);
    return new Response("Invalid signature", { status: 401 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ignored", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return new Response("ignored", { status: 200 });
  }
  const paymentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  // The real, address-exact amount Stripe Tax calculated — only present
  // when automatic_tax was on for this session. See the comment on
  // createPaidOrder in paid-order-checkout.ts for why this overrides our
  // own pre-checkout estimate.
  const taxAmount = session.total_details?.amount_tax != null ? session.total_details.amount_tax / 100 : null;

  try {
    const { markOrderPaidByStripeSessionId } = await import("@/lib/paid-order-checkout");
    const { markCustomRequestPaidByStripeSessionId } = await import("@/lib/custom-request-payment");
    // A given Stripe session id only ever matches one of these two tables —
    // both are no-ops when the id isn't theirs, so calling both is safe.
    await Promise.all([
      markOrderPaidByStripeSessionId(session.id, paymentId, taxAmount),
      markCustomRequestPaidByStripeSessionId(session.id, paymentId),
    ]);
    console.log(`Stripe webhook: marked order paid for stripe_session_id=${session.id}.`);
  } catch (error) {
    // Non-2xx tells Stripe to retry — better than silently losing the event.
    console.error("Stripe webhook: failed to mark order paid.", error);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
