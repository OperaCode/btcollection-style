import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export type ShippingAddress = {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type ShippoRate = {
  object_id: string;
  provider: string;
  service: string;
  amount: string;
  currency: string;
  estimated_days?: number | null;
  duration_terms?: string | null;
};

type ShippoShipmentResponse = {
  object_id: string;
  address_to?: {
    validation_results?: {
      is_valid?: boolean;
      messages?: Array<{ text?: string; code?: string }>;
    };
  };
  rates?: Array<{
    object_id: string;
    provider?: string;
    amount?: string;
    currency?: string;
    estimated_days?: number | null;
    duration_terms?: string | null;
    servicelevel?: {
      name?: string;
      token?: string;
    };
  }>;
};

const CHECKOUT_RATE_LIMIT = 4;

type ShippoTransactionResponse = {
  status: string;
  label_url?: string;
  object_id?: string;
  messages?: Array<{ text?: string; message?: string }>;
  tracking_number?: string;
  tracking_url_provider?: string;
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to your Vercel environment variables.`);
  return value;
}

function getFromAddress() {
  return {
    name: requireEnv("SHIPPO_FROM_NAME"),
    company: process.env.SHIPPO_FROM_COMPANY || "BT Collection LLC",
    street1: requireEnv("SHIPPO_FROM_STREET1"),
    street2: process.env.SHIPPO_FROM_STREET2 || undefined,
    city: requireEnv("SHIPPO_FROM_CITY"),
    state: requireEnv("SHIPPO_FROM_STATE"),
    zip: requireEnv("SHIPPO_FROM_ZIP"),
    country: process.env.SHIPPO_FROM_COUNTRY || "US",
    phone: requireEnv("SHIPPO_FROM_PHONE"),
    email: requireEnv("SHIPPO_FROM_EMAIL"),
  };
}

function getDefaultParcel() {
  return {
    length: process.env.SHIPPO_PARCEL_LENGTH || "10",
    width: process.env.SHIPPO_PARCEL_WIDTH || "8",
    height: process.env.SHIPPO_PARCEL_HEIGHT || "4",
    distance_unit: "in",
    weight: process.env.SHIPPO_PARCEL_WEIGHT || "2",
    mass_unit: "lb",
  };
}

async function verifyAdmin(accessToken: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) throw new Error("Unauthorized");

  return supabaseAdmin;
}

async function shippoRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.goshippo.com${path}`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${requireEnv("SHIPPO_API_TOKEN")}`,
      "Content-Type": "application/json",
      "SHIPPO-API-VERSION": "2018-02-08",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) {
    throw new Error(JSON.stringify(data) || `Shippo returned ${response.status}.`);
  }
  if (!data) throw new Error("Shippo returned an empty response.");
  return data;
}

function orderAddressToShippo(address: ShippingAddress, fallbackEmail: string, validate = false) {
  return {
    name: address.name || fallbackEmail,
    street1: address.address,
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: "US",
    email: address.email || fallbackEmail,
    validate,
  };
}

function mapShippoRates(rates: ShippoShipmentResponse["rates"]): ShippoRate[] {
  return (rates ?? []).map((rate) => ({
    object_id: rate.object_id,
    provider: rate.provider || "Carrier",
    service: rate.servicelevel?.name || rate.servicelevel?.token || "Service",
    amount: rate.amount || "0.00",
    currency: rate.currency || "USD",
    estimated_days: rate.estimated_days ?? null,
    duration_terms: rate.duration_terms ?? null,
  }));
}

const createShipmentRates = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; accessToken: string }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = await verifyAdmin(data.accessToken);
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw error ?? new Error("Order not found.");

    const shippingAddress = (order.shipping_address ?? {}) as ShippingAddress;
    const shipment = await shippoRequest<ShippoShipmentResponse>("/shipments/", {
      address_from: getFromAddress(),
      address_to: orderAddressToShippo(shippingAddress, order.email),
      parcels: [getDefaultParcel()],
      async: false,
      metadata: `Order ${order.id}`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ shippo_shipment_id: shipment.object_id })
      .eq("id", order.id);

    return { shipmentId: shipment.object_id, rates: mapShippoRates(shipment.rates) };
  });

// Unauthenticated on purpose: this only requests free rate quotes from
// Shippo (no label is purchased, no order exists yet) so a guest can see
// real shipping costs during checkout before creating an account or order.
const createCheckoutRates = createServerFn({ method: "POST" })
  .validator((data: { address: ShippingAddress }) => data)
  .handler(async ({ data }) => {
    const shipment = await shippoRequest<ShippoShipmentResponse>("/shipments/", {
      address_from: getFromAddress(),
      address_to: orderAddressToShippo(data.address, data.address.email ?? "", true),
      parcels: [getDefaultParcel()],
      async: false,
    });

    const cheapest = mapShippoRates(shipment.rates)
      .sort((a, b) => Number(a.amount) - Number(b.amount))
      .slice(0, CHECKOUT_RATE_LIMIT);

    const validation = shipment.address_to?.validation_results;
    return {
      rates: cheapest,
      addressValid: validation?.is_valid ?? true,
      addressMessages: (validation?.messages ?? []).map((m) => m.text).filter((t): t is string => Boolean(t)),
    };
  });

export async function getCheckoutShippingRates(address: ShippingAddress) {
  return createCheckoutRates({ data: { address } });
}

const purchaseLabel = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; rateId: string; accessToken: string }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = await verifyAdmin(data.accessToken);
    const transaction = await shippoRequest<ShippoTransactionResponse>("/transactions", {
      rate: data.rateId,
      async: false,
      label_file_type: "PDF_4x6",
      metadata: `Order ${data.orderId}`,
    });

    if (transaction.status !== "SUCCESS") {
      const message =
        transaction.messages?.map((item) => item.text || item.message).filter(Boolean).join("; ") ||
        `Shippo transaction status: ${transaction.status}`;
      throw new Error(message);
    }

    await supabaseAdmin
      .from("orders")
      .update({
        shippo_rate_id: data.rateId,
        shipping_label_url: transaction.label_url ?? null,
        tracking_number: transaction.tracking_number ?? null,
        tracking_url: transaction.tracking_url_provider ?? null,
        label_purchased_at: new Date().toISOString(),
      })
      .eq("id", data.orderId);

    return {
      labelUrl: transaction.label_url,
      trackingNumber: transaction.tracking_number,
      trackingUrl: transaction.tracking_url_provider,
    };
  });

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) throw new Error("Admin session expired. Please sign in again.");
  return accessToken;
}

export async function getShippoRates(orderId: string) {
  return createShipmentRates({ data: { orderId, accessToken: await getAccessToken() } });
}

export async function buyShippoLabel(orderId: string, rateId: string) {
  return purchaseLabel({ data: { orderId, rateId, accessToken: await getAccessToken() } });
}
