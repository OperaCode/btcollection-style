import { createServerOnlyFn } from "@tanstack/react-start";
import { META_PIXEL_ID } from "@/lib/meta-pixel";

// Meta Conversions API — the server-side twin of the browser pixel
// (meta-pixel.ts), set up the same way as tiktok-events.ts. Used only for
// Purchase, reported when an order is created from either the success page
// or a payment webhook. The browser sends the same event with
// eventID = order id, which is what lets Meta merge the two reports.
//
// Needs VITE_META_PIXEL_ID and META_ACCESS_TOKEN (server-only — never
// VITE_-prefix it). Set META_TEST_EVENT_CODE to route events to the
// "Test events" tab in Events Manager while testing; remove it afterwards.

const GRAPH_VERSION = "v24.0";

// Captured in the browser's request when checkout starts; see
// startOrderCheckout.
export type MetaContext = {
  fbp?: string;
  fbc?: string;
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
  context?: MetaContext | null;
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const sendMetaPurchase = createServerOnlyFn(async (input: PurchaseInput) => {
  const pixelId = META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  if (!pixelId || !accessToken) return;

  // Reporting is best-effort: a Meta outage must never fail an order, so
  // every error is logged and swallowed, and the request is time-boxed.
  try {
    const ctx = input.context ?? {};
    const user: Record<string, unknown> = { em: [await sha256(input.email)] };
    // Meta wants phones as digits only, country code included, before hashing.
    const phoneDigits = input.phone?.replace(/\D/g, "");
    if (phoneDigits) user.ph = [await sha256(phoneDigits)];
    if (ctx.fbp) user.fbp = ctx.fbp;
    if (ctx.fbc) user.fbc = ctx.fbc;
    if (ctx.ip) user.client_ip_address = ctx.ip;
    if (ctx.userAgent) user.client_user_agent = ctx.userAgent;

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.orderId,
          action_source: "website",
          ...(ctx.url ? { event_source_url: ctx.url } : {}),
          user_data: user,
          custom_data: {
            content_type: "product",
            content_ids: input.items.map((i) => i.id),
            contents: input.items.map((i) => ({ id: i.id, quantity: i.qty, item_price: i.price })),
            num_items: input.items.reduce((n, i) => n + i.qty, 0),
            currency: "USD",
            value: Math.round(input.value * 100) / 100,
            order_id: input.orderId,
          },
        },
      ],
    };
    const testCode = process.env.META_TEST_EVENT_CODE?.trim();
    if (testCode) body.test_event_code = testCode;

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      },
    );
    const json = (await res.json().catch(() => null)) as { events_received?: number; error?: unknown } | null;
    if (!res.ok || !json?.events_received) {
      console.error("Meta Conversions API rejected Purchase", input.orderId, res.status, json);
    }
  } catch (err) {
    console.error("Meta Conversions API request failed", input.orderId, err);
  }
});
