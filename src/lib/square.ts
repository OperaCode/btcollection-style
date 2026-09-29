import { randomUUID } from "node:crypto";
import { createServerOnlyFn } from "@tanstack/react-start";
import type { CartItem } from "@/lib/cart";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to your Vercel environment variables.`);
  return value;
}

export function isSquareConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.VITE_SQUARE_LOCATION_ID);
}

function squareBaseUrl() {
  const env = (process.env.VITE_SQUARE_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
}

async function squareRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${squareBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv("SQUARE_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const data = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    const message =
      (data as { errors?: Array<{ detail?: string }> } | null)?.errors
        ?.map((e) => e.detail)
        .filter(Boolean)
        .join("; ") || `Square returned ${response.status}.`;
    throw new Error(message);
  }
  if (!data) throw new Error("Square returned an empty response.");
  return data;
}

type PaymentLinkResponse = {
  payment_link?: { id: string; url: string; order_id: string };
};

type CreateCheckoutInput = {
  orderId: string;
  items: CartItem[];
  shippingLabel: string | null;
  shippingAmount: number;
  redirectUrl: string;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAddress?: { address: string; city: string; state: string; zip: string };
  // Extra *positive* line items beyond products/shipping — currently just
  // tax. Square rejects a negative base_price_money on a line item ("Money
  // amount must be non-negative"), so a discount can't be represented this
  // way — see `discount` below instead.
  extraLines?: Array<{ label: string; amount: number }>;
  // A discount code's dollar-off amount, applied via Square's own
  // order-level discount object (amount_money, not a percentage) so the
  // exact amount charged always matches what we already computed and
  // stored server-side.
  discount?: { label: string; amount: number };
};

function splitName(name: string) {
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed || undefined, lastName: undefined };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

// createServerOnlyFn, not createServerFn: this is only ever called from
// inside another server function's handler (startOrderCheckout,
// createCustomRequestCheckoutUrl), never directly as a client-facing RPC
// target. That nesting — a createServerFn calling another createServerFn —
// turned out not to make it into the production server-function manifest
// reliably (worked fine in dev, where resolution is dynamic rather than a
// pre-built table), causing "Server function info not found" in production
// only. createServerOnlyFn compiles as a plain function call instead of an
// RPC dispatch, which sidesteps the whole problem — matches the same
// pattern already used for sendOrderConfirmation, sendCustomRequestNotification, etc.
const createCheckoutLink = createServerOnlyFn(async (data: CreateCheckoutInput) => {
    const locationId = requireEnv("VITE_SQUARE_LOCATION_ID");

    const lineItems = data.items.map((item) => ({
      name: item.name.slice(0, 500),
      quantity: String(item.qty),
      base_price_money: { amount: Math.round(item.price * 100), currency: "USD" },
    }));

    if (data.shippingAmount > 0) {
      lineItems.push({
        name: (data.shippingLabel || "Shipping").slice(0, 500),
        quantity: "1",
        base_price_money: { amount: Math.round(data.shippingAmount * 100), currency: "USD" },
      });
    }

    for (const line of data.extraLines ?? []) {
      if (line.amount <= 0) continue;
      lineItems.push({
        name: line.label.slice(0, 500),
        quantity: "1",
        base_price_money: { amount: Math.round(line.amount * 100), currency: "USD" },
      });
    }

    const discounts =
      data.discount && data.discount.amount > 0
        ? [
            {
              name: data.discount.label.slice(0, 500),
              type: "FIXED_AMOUNT",
              amount_money: { amount: Math.round(data.discount.amount * 100), currency: "USD" },
              scope: "ORDER",
            },
          ]
        : undefined;

    const { firstName, lastName } = data.buyerName ? splitName(data.buyerName) : { firstName: undefined, lastName: undefined };

    const prePopulatedData =
      data.buyerEmail || data.buyerPhone || data.buyerAddress
        ? {
            buyer_email: data.buyerEmail || undefined,
            buyer_phone_number: data.buyerPhone || undefined,
            buyer_address: data.buyerAddress
              ? {
                  address_line_1: data.buyerAddress.address,
                  locality: data.buyerAddress.city,
                  administrative_district_level_1: data.buyerAddress.state,
                  postal_code: data.buyerAddress.zip,
                  country: "US",
                  first_name: firstName,
                  last_name: lastName,
                }
              : undefined,
          }
        : undefined;

    const result = await squareRequest<PaymentLinkResponse>("/v2/online-checkout/payment-links", {
      method: "POST",
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        order: {
          location_id: locationId,
          reference_id: data.orderId,
          line_items: lineItems,
          discounts,
        },
        // enable_coupon: false hides Square's own native coupon field —
        // we already have our own discount-code system (src/lib/discounts.ts)
        // applied before the order ever reaches Square, and leaving Square's
        // built-in one visible would let a customer type our promo code into
        // the wrong box and have it silently do nothing.
        checkout_options: { redirect_url: data.redirectUrl, enable_coupon: false },
        pre_populated_data: prePopulatedData,
      }),
    });

    if (!result.payment_link) throw new Error("Square did not return a checkout link.");
    return { url: result.payment_link.url, squareOrderId: result.payment_link.order_id };
});

export async function createSquareCheckout(input: CreateCheckoutInput) {
  return createCheckoutLink(input);
}

type SquareOrderResponse = {
  order?: {
    id: string;
    state?: string;
    tenders?: Array<{ id?: string; payment_id?: string }>;
    net_amount_due_money?: { amount?: number };
    total_money?: { amount?: number };
  };
};

// createServerOnlyFn — same reasoning as createCheckoutLink above: only
// ever called from confirmOrderPayment/confirmCustomRequestPayment's own
// server-side handlers, never directly from the client.
const fetchSquareOrder = createServerOnlyFn(async (data: { squareOrderId: string }) => {
    const result = await squareRequest<SquareOrderResponse>(`/v2/orders/${data.squareOrderId}`, {
      method: "GET",
    });

    const order = result.order;
    const tender = order?.tenders?.[0];
    // Square order 'state' semantics for payment-link-created orders aren't
    // fully reliable to gate on alone, so treat any of these as proof of
    // payment: order marked COMPLETED, a tender was applied, or nothing is
    // left owing on an order that actually has a total.
    const hasTender = Boolean(tender);
    const nothingOwed =
      order?.net_amount_due_money?.amount === 0 && (order?.total_money?.amount ?? 0) > 0;
    const paid = order?.state === "COMPLETED" || hasTender || nothingOwed;

    return { paid, paymentId: tender?.payment_id || tender?.id || order?.id || null };
});

export async function getSquareOrderStatus(squareOrderId: string) {
  return fetchSquareOrder({ squareOrderId });
}
