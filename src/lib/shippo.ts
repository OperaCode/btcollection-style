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

export type ParcelInput = {
  length: string;
  width: string;
  height: string;
  weight: string;
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

type SiteSettingsRow = {
  shippo_from_name: string | null;
  shippo_from_company: string | null;
  shippo_from_street1: string | null;
  shippo_from_street2: string | null;
  shippo_from_city: string | null;
  shippo_from_state: string | null;
  shippo_from_zip: string | null;
  shippo_from_country: string | null;
  shippo_from_phone: string | null;
  shippo_from_email: string | null;
  parcel_length: string | null;
  parcel_width: string | null;
  parcel_height: string | null;
  parcel_weight: string | null;
} | null;

async function getSettingsRow(): Promise<SiteSettingsRow> {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return data;
}

function getFromAddress(settings: SiteSettingsRow) {
  return {
    name: settings?.shippo_from_name || requireEnv("SHIPPO_FROM_NAME"),
    company: settings?.shippo_from_company || process.env.SHIPPO_FROM_COMPANY || "BT Collection LLC",
    street1: settings?.shippo_from_street1 || requireEnv("SHIPPO_FROM_STREET1"),
    street2: settings?.shippo_from_street2 || process.env.SHIPPO_FROM_STREET2 || undefined,
    city: settings?.shippo_from_city || requireEnv("SHIPPO_FROM_CITY"),
    state: settings?.shippo_from_state || requireEnv("SHIPPO_FROM_STATE"),
    zip: settings?.shippo_from_zip || requireEnv("SHIPPO_FROM_ZIP"),
    country: settings?.shippo_from_country || process.env.SHIPPO_FROM_COUNTRY || "US",
    phone: settings?.shippo_from_phone || requireEnv("SHIPPO_FROM_PHONE"),
    email: settings?.shippo_from_email || requireEnv("SHIPPO_FROM_EMAIL"),
  };
}

function getDefaultParcel(settings: SiteSettingsRow) {
  return {
    length: settings?.parcel_length || process.env.SHIPPO_PARCEL_LENGTH || "10",
    width: settings?.parcel_width || process.env.SHIPPO_PARCEL_WIDTH || "8",
    height: settings?.parcel_height || process.env.SHIPPO_PARCEL_HEIGHT || "4",
    distance_unit: "in",
    weight: settings?.parcel_weight || process.env.SHIPPO_PARCEL_WEIGHT || "2",
    mass_unit: "lb",
  };
}

// The Settings-level parcel is only ever a rough estimate for a rate quote
// before anything is packed. Once an order is actually boxed and weighed,
// the admin measures the real package and that always wins — falling back
// to the estimate only when she hasn't entered real numbers yet.
function resolveParcel(settings: SiteSettingsRow, override?: ParcelInput | null) {
  if (override && override.length && override.width && override.height && override.weight) {
    return {
      length: override.length,
      width: override.width,
      height: override.height,
      distance_unit: "in",
      weight: override.weight,
      mass_unit: "lb",
    };
  }
  return getDefaultParcel(settings);
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
  .validator((data: { orderId: string; accessToken: string; parcel?: ParcelInput }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = await verifyAdmin(data.accessToken);
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw error ?? new Error("Order not found.");
    if (order.status !== "paid" && order.status !== "processing") {
      throw new Error("Shipping labels can only be created for paid orders.");
    }

    const settings = await getSettingsRow();
    const shippingAddress = (order.shipping_address ?? {}) as ShippingAddress;
    const shipment = await shippoRequest<ShippoShipmentResponse>("/shipments/", {
      address_from: getFromAddress(settings),
      address_to: orderAddressToShippo(shippingAddress, order.email),
      parcels: [resolveParcel(settings, data.parcel)],
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
    const settings = await getSettingsRow();
    const shipment = await shippoRequest<ShippoShipmentResponse>("/shipments/", {
      address_from: getFromAddress(settings),
      address_to: orderAddressToShippo(data.address, data.address.email ?? "", true),
      parcels: [getDefaultParcel(settings)],
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
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("status")
      .eq("id", data.orderId)
      .single();
    if (orderError || !order) throw orderError ?? new Error("Order not found.");
    if (order.status !== "paid" && order.status !== "processing") {
      throw new Error("Shipping labels can only be purchased for paid orders.");
    }
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
        // Buying the label is the real-world "it's on its way" moment —
        // status follows automatically instead of relying on the admin to
        // remember to flip a dropdown.
        status: "shipped",
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

export async function getShippoRates(orderId: string, parcel?: ParcelInput) {
  return createShipmentRates({ data: { orderId, parcel, accessToken: await getAccessToken() } });
}

export async function buyShippoLabel(orderId: string, rateId: string) {
  return purchaseLabel({ data: { orderId, rateId, accessToken: await getAccessToken() } });
}

// Read-only peek at the server env-var fallbacks, so the admin Settings form
// can show what's actually in effect today (not just what's saved in the
// database) before the admin has entered anything. None of these are secrets
// — they're the return address and box size that already go out on every
// label — so this is safe to expose to a verified admin.
const readEnvShippingDefaults = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => {
    await verifyAdmin(data.accessToken);
    return {
      shippo_from_name: process.env.SHIPPO_FROM_NAME || "",
      shippo_from_company: process.env.SHIPPO_FROM_COMPANY || "",
      shippo_from_street1: process.env.SHIPPO_FROM_STREET1 || "",
      shippo_from_street2: process.env.SHIPPO_FROM_STREET2 || "",
      shippo_from_city: process.env.SHIPPO_FROM_CITY || "",
      shippo_from_state: process.env.SHIPPO_FROM_STATE || "",
      shippo_from_zip: process.env.SHIPPO_FROM_ZIP || "",
      shippo_from_country: process.env.SHIPPO_FROM_COUNTRY || "",
      shippo_from_phone: process.env.SHIPPO_FROM_PHONE || "",
      shippo_from_email: process.env.SHIPPO_FROM_EMAIL || "",
      parcel_length: process.env.SHIPPO_PARCEL_LENGTH || "",
      parcel_width: process.env.SHIPPO_PARCEL_WIDTH || "",
      parcel_height: process.env.SHIPPO_PARCEL_HEIGHT || "",
      parcel_weight: process.env.SHIPPO_PARCEL_WEIGHT || "",
    };
  });

export async function getEnvShippingDefaults() {
  return readEnvShippingDefaults({ data: { accessToken: await getAccessToken() } });
}

// The current effective default parcel (settings override, else env), used
// only to pre-fill the per-order package fields with a starting point the
// admin then confirms or corrects against the real, measured package.
const readDefaultParcel = createServerFn({ method: "POST" })
  .validator((data: { accessToken: string }) => data)
  .handler(async ({ data }) => {
    await verifyAdmin(data.accessToken);
    const settings = await getSettingsRow();
    const parcel = getDefaultParcel(settings);
    return { length: parcel.length, width: parcel.width, height: parcel.height, weight: parcel.weight };
  });

export async function getDefaultParcelValues() {
  return readDefaultParcel({ data: { accessToken: await getAccessToken() } });
}
