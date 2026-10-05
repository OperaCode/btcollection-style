// Unlike Stripe, where the hosted Checkout page itself charges the card and
// our server just has to find out it happened, PayPal's flow is two steps:
// the buyer approves on PayPal's site, then OUR server has to call capture
// to actually move the money. If the buyer's browser never makes it back to
// /checkout/success (closed tab, flaky connection), nobody ever calls
// capture and the money never moves — so this webhook isn't just a backup
// the way the Stripe one is, it's the thing that guarantees payment still
// completes even when the browser doesn't cooperate.
export async function handlePayPalWebhook(request: Request): Promise<Response> {
  const rawBody = await request.text();
  let event: {
    event_type: string;
    resource: Record<string, unknown>;
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const headers: Record<string, string> = {};
  for (const key of [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ]) {
    const value = request.headers.get(key);
    if (value) headers[key] = value;
  }

  const { verifyPayPalWebhook } = await import("@/lib/paypal");
  let verified: boolean;
  try {
    verified = await verifyPayPalWebhook(headers, event);
  } catch (err) {
    console.error("PayPal webhook: signature verification request failed.", err);
    return new Response("Invalid signature", { status: 401 });
  }
  if (!verified) {
    console.error("PayPal webhook: signature verification failed.");
    return new Response("Invalid signature", { status: 401 });
  }

  let paypalOrderId: string | null = null;
  let paymentId: string | null = null;

  if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
    paypalOrderId = (event.resource.id as string) ?? null;
    if (!paypalOrderId) return new Response("ignored", { status: 200 });
    const { capturePayPalOrder } = await import("@/lib/paypal");
    const result = await capturePayPalOrder(paypalOrderId);
    if (!result.paid) return new Response("ignored", { status: 200 });
    paymentId = result.paymentId;
  } else if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const supplementary = event.resource.supplementary_data as
      | { related_ids?: { order_id?: string } }
      | undefined;
    paypalOrderId = supplementary?.related_ids?.order_id ?? null;
    paymentId = (event.resource.id as string) ?? null;
    if (!paypalOrderId) return new Response("ignored", { status: 200 });
  } else {
    return new Response("ignored", { status: 200 });
  }

  try {
    const { markOrderPaidByPayPalOrderId } = await import("@/lib/paid-order-checkout");
    const { markCustomRequestPaidByPayPalOrderId } = await import("@/lib/custom-request-payment");
    // A given PayPal order id only ever matches one of these two tables —
    // both are no-ops when the id isn't theirs, so calling both is safe.
    await Promise.all([
      markOrderPaidByPayPalOrderId(paypalOrderId, paymentId),
      markCustomRequestPaidByPayPalOrderId(paypalOrderId, paymentId),
    ]);
    console.log(`PayPal webhook: marked order paid for paypal_order_id=${paypalOrderId}.`);
  } catch (error) {
    // Non-2xx tells PayPal to retry — better than silently losing the event.
    console.error("PayPal webhook: failed to mark order paid.", error);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
