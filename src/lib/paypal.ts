import { createServerOnlyFn } from "@tanstack/react-start";
import type { CartItem } from "@/lib/cart";

// PayPal, unlike Stripe, really does have a live/sandbox split that the
// client credentials alone don't disambiguate (sandbox and live each have
// their own Client ID/Secret, but nothing about the string format tells you
// which — unlike Stripe's sk_test_/sk_live_ prefixes), so this one env var
// does matter. Get it wrong and you'll be hitting sandbox with live
// credentials (401) or vice versa — the Square environment-mismatch bug,
// again, if this isn't kept in sync with which credentials are set.
function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to your Vercel environment variables.`);
  return value;
}

export function isPayPalConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

function getBaseUrl() {
  return process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function money(amount: number) {
  return amount.toFixed(2);
}

// OAuth2 client-credentials token, cached until shortly before it expires —
// same shape as Stripe's lazy client singleton, just with an expiry to
// respect instead of a one-time construction.
let cachedToken: { value: string; expiresAt: number } | undefined;
async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const clientId = requireEnv("PAYPAL_CLIENT_ID");
  const clientSecret = requireEnv("PAYPAL_CLIENT_SECRET");
  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  // Shave 60s off so we never hand out a token that expires mid-request.
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

async function paypalFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body ? JSON.stringify(body) : await res.text().catch(() => "");
    throw new Error(`PayPal API error (${res.status}): ${detail}`);
  }
  return body;
}

type CreateOrderInput = {
  orderId: string;
  items: CartItem[];
  shippingLabel: string | null;
  shippingAmount: number;
  successUrl: string;
  cancelUrl: string;
  extraLines?: Array<{ label: string; amount: number }>;
  discount?: { label: string; amount: number };
};

// Unlike Stripe Checkout, PayPal's amount.breakdown has to sum EXACTLY to
// amount.value (item_total + shipping + tax_total - discount === value), or
// the order create call is rejected outright — so every line here has to
// agree to the penny with what paid-order-checkout.ts already computed.
const createOrder = createServerOnlyFn(async (data: CreateOrderInput) => {
  const itemTotal = data.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxTotal = (data.extraLines ?? []).reduce((sum, line) => sum + line.amount, 0);
  const discountAmount = data.discount?.amount ?? 0;
  const total = itemTotal + taxTotal + data.shippingAmount - discountAmount;

  const order = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: data.orderId,
          invoice_id: data.orderId,
          amount: {
            currency_code: "USD",
            value: money(total),
            breakdown: {
              item_total: { currency_code: "USD", value: money(itemTotal) },
              shipping: { currency_code: "USD", value: money(data.shippingAmount) },
              tax_total: { currency_code: "USD", value: money(taxTotal) },
              discount: { currency_code: "USD", value: money(discountAmount) },
            },
          },
          items: data.items.map((item) => ({
            name: item.name.slice(0, 127),
            quantity: String(item.qty),
            unit_amount: { currency_code: "USD", value: money(item.price) },
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Breakthrough Collection",
            user_action: "PAY_NOW",
            return_url: data.successUrl,
            cancel_url: data.cancelUrl,
          },
        },
      },
    }),
  });

  const approveLink = (order.links as Array<{ rel: string; href: string }> | undefined)?.find(
    (link) => link.rel === "payer-action" || link.rel === "approve",
  );
  if (!approveLink) throw new Error("PayPal did not return a checkout URL.");
  return { url: approveLink.href, paypalOrderId: order.id as string };
});

export async function createPayPalOrder(input: CreateOrderInput) {
  return createOrder(input);
}

// Captures the order (actually moves the money) and is safe to call more
// than once for the same order — both the browser returning to the success
// page AND the ORDER.APPROVED webhook call this, racing each other, so an
// "already captured" response from PayPal is treated as success rather
// than an error.
const captureOrder = createServerOnlyFn(async (data: { paypalOrderId: string }) => {
  const existing = await paypalFetch(`/v2/checkout/orders/${data.paypalOrderId}`, { method: "GET" });
  if (existing.status === "COMPLETED") {
    const captureId = existing.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    return { paid: true as const, paymentId: captureId };
  }
  if (existing.status !== "APPROVED") {
    return { paid: false as const, paymentId: null };
  }

  const captured = await paypalFetch(`/v2/checkout/orders/${data.paypalOrderId}/capture`, {
    method: "POST",
    body: JSON.stringify({}),
  });
  const paid = captured.status === "COMPLETED";
  const paymentId = captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
  return { paid, paymentId };
});

export async function capturePayPalOrder(paypalOrderId: string) {
  return captureOrder({ paypalOrderId });
}

// PayPal doesn't verify webhooks locally the way Stripe's SDK does — it
// requires an extra round-trip to its own verification endpoint, handing
// back the signature headers and raw event body for it to check.
const verifyWebhook = createServerOnlyFn(
  async (data: {
    headers: Record<string, string>;
    body: unknown;
  }) => {
    const webhookId = requireEnv("PAYPAL_WEBHOOK_ID");
    const result = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: data.headers["paypal-auth-algo"],
        cert_url: data.headers["paypal-cert-url"],
        transmission_id: data.headers["paypal-transmission-id"],
        transmission_sig: data.headers["paypal-transmission-sig"],
        transmission_time: data.headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: data.body,
      }),
    });
    return result.verification_status === "SUCCESS";
  },
);

export async function verifyPayPalWebhook(headers: Record<string, string>, body: unknown) {
  return verifyWebhook({ headers, body });
}
