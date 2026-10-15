import { createServerOnlyFn } from "@tanstack/react-start";
import { TIKTOK_PIXEL_ID } from "@/lib/tiktok-pixel";

// TikTok Events API — the server-side twin of the browser pixel
// (tiktok-pixel.ts). Used only for Purchase, reported when an order
// is created from either the success page or a payment webhook, so a sale
// still counts when an ad blocker or a closed tab stops the browser pixel.
// The browser sends the same event with event_id = order id, which is what
// lets TikTok merge the two reports into one purchase.
//
// Needs VITE_TIKTOK_PIXEL_ID and TIKTOK_ACCESS_TOKEN (server-only — never
// VITE_-prefix it). Set TIKTOK_TEST_EVENT_CODE to route events to the
// "Test Events" tab in Events Manager while testing; remove it afterwards.

const ENDPOINT = "https://business-api.tiktok.com/open_api/v1.3/event/track/";

// Captured in the browser's request when checkout starts; see
// startOrderCheckout.
export type TikTokContext = {
  ttp?: string;
  ttclid?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
};

type PurchaseInput = {
  orderId: string;
  email: string;
  phone?: string;
  items: Array<{ id: string; name: string; price: number; qty: number }>;
  value: number;
  context?: TikTokContext | null;
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const sendTikTokPurchase = createServerOnlyFn(async (input: PurchaseInput) => {
  const pixelId = TIKTOK_PIXEL_ID;
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  if (!pixelId || !accessToken) return;

  // Reporting is best-effort: a TikTok outage must never fail an order, so
  // every error is logged and swallowed, and the request is time-boxed.
  try {
    const ctx = input.context ?? {};
    const user: Record<string, string> = { email: await sha256(input.email) };
    if (input.phone) user.phone = await sha256(input.phone);
    if (ctx.ttp) user.ttp = ctx.ttp;
    if (ctx.ttclid) user.ttclid = ctx.ttclid;
    if (ctx.ip) user.ip = ctx.ip;
    if (ctx.userAgent) user.user_agent = ctx.userAgent;

    const body: Record<string, unknown> = {
      event_source: "web",
      event_source_id: pixelId,
      data: [
        {
          event: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.orderId,
          user,
          properties: {
            contents: input.items.map((i) => ({
              content_id: i.id,
              content_name: i.name,
              content_type: "product",
              quantity: i.qty,
              price: i.price,
            })),
            content_type: "product",
            currency: "USD",
            value: Math.round(input.value * 100) / 100,
            order_id: input.orderId,
          },
          ...(ctx.url ? { page: { url: ctx.url } } : {}),
        },
      ],
    };
    const testCode = process.env.TIKTOK_TEST_EVENT_CODE?.trim();
    if (testCode) body.test_event_code = testCode;

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": accessToken },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    const json = (await res.json().catch(() => null)) as { code?: number; message?: string } | null;
    if (!res.ok || json?.code !== 0) {
      console.error("TikTok Events API rejected Purchase", input.orderId, res.status, json);
    }
  } catch (err) {
    console.error("TikTok Events API request failed", input.orderId, err);
  }
});
