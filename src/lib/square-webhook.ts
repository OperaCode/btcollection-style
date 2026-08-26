import { createHmac, timingSafeEqual } from "node:crypto";

// Square's webhook signature is HMAC-SHA256(notificationUrl + rawBody, key),
// base64-encoded, compared against the x-square-hmacsha256-signature header.
// We verify against SQUARE_WEBHOOK_URL (the exact URL registered in Square's
// dashboard) rather than reconstructing it from the incoming request, since
// a proxy rewriting scheme/host would otherwise make verification flaky.
function verifySquareSignature(rawBody: string, signatureHeader: string | null): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !notificationUrl || !signatureHeader) return false;

  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");

  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

type SquareWebhookEvent = {
  type?: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        status?: string;
        order_id?: string;
      };
    };
  };
};

export async function handleSquareWebhook(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");

  if (!verifySquareSignature(rawBody, signature)) {
    console.error("Square webhook: signature verification failed.");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: SquareWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type !== "payment.updated" && event.type !== "payment.created") {
    return new Response("ignored", { status: 200 });
  }

  const payment = event.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED" || !payment.order_id) {
    return new Response("ignored", { status: 200 });
  }

  try {
    const { markOrderPaidBySquareOrderId } = await import("@/lib/paid-order-checkout");
    const { markCustomRequestPaidBySquareOrderId } = await import("@/lib/custom-request-payment");
    // A given square order_id only ever matches one of these two tables —
    // both are no-ops when the id isn't theirs, so calling both is safe.
    await Promise.all([
      markOrderPaidBySquareOrderId(payment.order_id, payment.id ?? null),
      markCustomRequestPaidBySquareOrderId(payment.order_id, payment.id ?? null),
    ]);
  } catch (error) {
    // Non-2xx tells Square to retry — better than silently losing the event.
    console.error("Square webhook: failed to mark order paid.", error);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
