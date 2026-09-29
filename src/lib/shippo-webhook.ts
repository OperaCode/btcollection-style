// Shippo's track_updated webhook — flips an order to "delivered"
// automatically once the carrier reports it, instead of relying on the
// admin to notice and click "Mark Delivered" by hand.
//
// Unlike Square, Shippo doesn't sign webhook payloads (no HMAC header to
// verify against), so this endpoint is unauthenticated by design. The blast
// radius of a forged call is small and self-limiting: it can only ever flip
// a real order that's already "shipped" (matched by tracking_number) to
// "delivered" a little early — no money moves, nothing is exposed, and it's
// a one-click fix in admin if it's ever wrong.
type ShippoTrackingWebhook = {
  event?: string;
  data?: {
    tracking_number?: string;
    tracking_status?: {
      status?: string;
    };
  };
};

export async function handleShippoWebhook(request: Request): Promise<Response> {
  let event: ShippoTrackingWebhook;
  try {
    event = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.event !== "track_updated") {
    return new Response("ignored", { status: 200 });
  }

  const trackingNumber = event.data?.tracking_number;
  // Shippo's tracking_status.status is one of UNKNOWN / PRE_TRANSIT /
  // TRANSIT / DELIVERED / RETURNED / FAILURE — only DELIVERED advances the
  // order here; the others are left for the admin to notice and handle
  // manually (a RETURNED or FAILURE shipment needs a human decision, not an
  // automatic status flip).
  const status = event.data?.tracking_status?.status;
  if (!trackingNumber || status !== "DELIVERED") {
    return new Response("ignored", { status: 200 });
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // .eq("status", "shipped") makes this a no-op for an order that's
    // already delivered or was cancelled after shipping — never overwrites
    // either of those.
    await supabaseAdmin
      .from("orders")
      .update({ status: "delivered", delivered_at: new Date().toISOString() })
      .eq("tracking_number", trackingNumber)
      .eq("status", "shipped");
  } catch (error) {
    // Non-2xx tells Shippo to retry — better than silently losing the event.
    console.error("Shippo webhook: failed to mark order delivered.", error);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
