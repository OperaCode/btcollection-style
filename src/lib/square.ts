import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
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
};

function splitName(name: string) {
  const trimmed = name.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed || undefined, lastName: undefined };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

const createCheckoutLink = createServerFn({ method: "POST" })
  .validator((data: CreateCheckoutInput) => data)
  .handler(async ({ data }) => {
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
        },
        checkout_options: { redirect_url: data.redirectUrl },
        pre_populated_data: prePopulatedData,
      }),
    });

    if (!result.payment_link) throw new Error("Square did not return a checkout link.");
    return { url: result.payment_link.url, squareOrderId: result.payment_link.order_id };
  });

export async function createSquareCheckout(input: CreateCheckoutInput) {
  return createCheckoutLink({ data: input });
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

const fetchSquareOrder = createServerFn({ method: "POST" })
  .validator((data: { squareOrderId: string }) => data)
  .handler(async ({ data }) => {
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
  return fetchSquareOrder({ data: { squareOrderId } });
}
