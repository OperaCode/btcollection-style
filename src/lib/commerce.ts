import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart";
import { sendCustomRequestNotification } from "@/lib/custom-request-email";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";

type ShippingAddress = {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  state: string;
  deliveryMethod?: string;
};

type CreateOrderInput = {
  email: string;
  shippingAddress: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod?: string;
  notes?: string;
};

function offlineId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function storeOfflineSubmission(key: string, payload: unknown) {
  if (typeof window === "undefined") return;
  try {
    const existing = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    window.localStorage.setItem(
      key,
      JSON.stringify([...existing, { ...payload, createdAt: new Date().toISOString() }]),
    );
  } catch {}
}

// Guest checkout has no login, and orders/order_items INSERT is only granted
// to the "authenticated" role — an anon client insert would always be denied.
// This server function writes with the service-role client instead, so
// guest orders actually reach the database rather than silently falling
// through to the offline localStorage fallback below on every checkout.
const createOrderRecord = createServerFn({ method: "POST" })
  .validator((data: CreateOrderInput) => data)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        email: input.email,
        shipping_address: input.shippingAddress,
        subtotal: input.subtotal,
        shipping: input.shipping,
        tax: 0,
        total: input.total,
        status: "pending",
        notes: input.notes ?? null,
        delivery_method: input.deliveryMethod ?? null,
      })
      .select("id")
      .single();

    if (error || !order) throw error ?? new Error("Order was not created.");

    const { error: itemError } = await supabaseAdmin.from("order_items").insert(
      input.items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty,
        customization: item.customization ?? null,
      })),
    );

    if (itemError) throw itemError;
    return { id: order.id as string };
  });

export async function createOrder(input: CreateOrderInput) {
  try {
    const order = await createOrderRecord({ data: input });
    return { id: order.id, offline: false };
  } catch (error) {
    const id = offlineId("BTC");
    storeOfflineSubmission("btc.pendingOrders.v1", { ...input, id });
    return { id, offline: true, error };
  }
}

export async function saveContactMessage(payload: Record<string, unknown>) {
  storeOfflineSubmission("btc.contactMessages.v1", payload);
  return { offline: true };
}

export async function saveCustomRequest(payload: Record<string, unknown>) {
  const fullName = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const itemType = String(payload.itemType ?? "").trim() || null;
  const occasion = String(payload.occasion ?? "").trim() || null;
  const quantityValue = Number(payload.quantity ?? 0);
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : null;
  const deadline = String(payload.deadline ?? "").trim() || null;
  const deliveryPreference = String(payload.deliveryPreference ?? "").trim() || null;
  const sampleImagePath = String(payload.sampleImagePath ?? "").trim() || null;
  const designText = String(payload.designText ?? "").trim() || null;
  const mediaDetails = String(payload.mediaDetails ?? "").trim() || null;
  const idea = String(payload.idea ?? "").trim() || null;

  try {
    const { data, error } = await supabase
      .from("custom_requests")
      .insert({
        full_name: fullName,
        email,
        item_type: itemType,
        occasion,
        quantity,
        deadline,
        delivery_preference: deliveryPreference,
        sample_image_path: sampleImagePath,
        design_text: designText,
        media_details: mediaDetails,
        idea,
        status: "new",
      })
      .select("id")
      .single();

    if (error || !data) throw error ?? new Error("Custom request was not created.");

    const notification = await sendCustomRequestNotification({
      data: {
        id: data.id,
        fullName,
        email,
        itemType,
        occasion,
        quantity,
        deadline,
        deliveryPreference,
        sampleImagePath,
        designText,
        mediaDetails,
        idea,
      },
    });

    return {
      id: data.id,
      offline: false,
      notificationWarning: notification.sent ? undefined : notification.error,
    };
  } catch (error) {
    const id = offlineId("CUSTOM");
    storeOfflineSubmission("btc.customRequests.v1", { ...payload, id });
    return { id, offline: true, error };
  }
}

type SubscribeNewsletterInput = {
  email: string;
  fullName?: string;
  source?: string;
};

export async function subscribeNewsletter(input: SubscribeNewsletterInput) {
  const source = input.source ?? "homepage";
  const fullName = input.fullName?.trim() || null;
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        full_name: fullName,
        source,
        status: "subscribed",
      });

    if (error) {
      if (error.code === "23505") {
        return { ok: true, alreadySubscribed: true };
      }
      throw error;
    }

    let emailWarning: string | undefined;
    const emailResult = await sendNewsletterWelcomeEmail({
      data: { email: normalizedEmail, fullName: fullName ?? undefined },
    });

    if (!emailResult.sent) {
      emailWarning = emailResult.error ?? "The welcome email could not be sent yet.";
    }

    return { ok: true, emailWarning };
  } catch (error) {
    storeOfflineSubmission("btc.newsletterSubscribers.v1", { email: normalizedEmail, fullName, source });
    return { ok: false, offline: true, error };
  }
}
