import { createServerFn } from "@tanstack/react-start";
import { sendCustomRequestConfirmation, sendCustomRequestNotification } from "@/lib/custom-request-email";
import { sendNewsletterWelcomeEmail } from "@/lib/newsletter-email";

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

export async function saveContactMessage(payload: Record<string, unknown>) {
  storeOfflineSubmission("btc.contactMessages.v1", payload);
  return { offline: true };
}

type CreateCustomRequestInput = {
  fullName: string;
  email: string;
  phone: string | null;
  itemType: string | null;
  occasion: string | null;
  colorPreference: string | null;
  quantity: number | null;
  deadline: string | null;
  deliveryPreference: string | null;
  sampleImagePath: string | null;
  designText: string | null;
  mediaDetails: string | null;
  idea: string | null;
};

// anon can only INSERT on custom_requests, not SELECT (only admins can, via
// has_role RLS) — an anon insert(...).select().single() to get the new id
// back fails RLS the same way the newsletter upsert did. Service-role write,
// same reasoning as createOrderRecord/upsertNewsletterSubscriber above.
const createCustomRequestRecord = createServerFn({ method: "POST" })
  .validator((data: CreateCustomRequestInput) => data)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("custom_requests")
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        item_type: input.itemType,
        occasion: input.occasion,
        color_preference: input.colorPreference,
        quantity: input.quantity,
        deadline: input.deadline,
        delivery_preference: input.deliveryPreference,
        sample_image_path: input.sampleImagePath,
        design_text: input.designText,
        media_details: input.mediaDetails,
        idea: input.idea,
        status: "reviewing",
      })
      .select("id")
      .single();

    if (error || !data) throw error ?? new Error("Custom request was not created.");
    return { id: data.id as string };
  });

export async function saveCustomRequest(payload: Record<string, unknown>) {
  const fullName = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim().toLowerCase();
  const phone = String(payload.phone ?? "").trim() || null;
  const itemType = String(payload.itemType ?? "").trim() || null;
  const occasion = String(payload.occasion ?? "").trim() || null;
  const colorPreference = String(payload.colorPreference ?? "").trim() || null;
  const quantityValue = Number(payload.quantity ?? 0);
  const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : null;
  const deadline = String(payload.deadline ?? "").trim() || null;
  const deliveryPreference = String(payload.deliveryPreference ?? "").trim() || null;
  const sampleImagePath = String(payload.sampleImagePath ?? "").trim() || null;
  const designText = String(payload.designText ?? "").trim() || null;
  const mediaDetails = String(payload.mediaDetails ?? "").trim() || null;
  const idea = String(payload.idea ?? "").trim() || null;

  try {
    const { id } = await createCustomRequestRecord({
      data: {
        fullName,
        email,
        phone,
        itemType,
        occasion,
        colorPreference,
        quantity,
        deadline,
        deliveryPreference,
        sampleImagePath,
        designText,
        mediaDetails,
        idea,
      },
    });

    const [notification, confirmation] = await Promise.all([
      sendCustomRequestNotification({
        data: {
          id,
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
      }),
      sendCustomRequestConfirmation({ data: { id, fullName, email } }),
    ]);

    return {
      id,
      offline: false,
      notificationWarning: notification.sent ? undefined : notification.error,
      confirmationWarning: confirmation.sent ? undefined : confirmation.error,
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

// Anon role only has INSERT on newsletter_subscribers, no SELECT — an anon
// upsert(...).select() to detect duplicates would fail RLS. This server
// function writes with the service-role client instead, same reasoning as
// createOrderRecord above.
const upsertNewsletterSubscriber = createServerFn({ method: "POST" })
  .validator((data: { email: string; fullName: string | null; source: string }) => data)
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email: input.email,
          full_name: input.fullName,
          source: input.source,
          status: "subscribed",
        },
        { onConflict: "email", ignoreDuplicates: true },
      )
      .select("id");

    if (error) throw error;
    return { alreadySubscribed: !data || data.length === 0 };
  });

export async function subscribeNewsletter(input: SubscribeNewsletterInput) {
  const source = input.source ?? "homepage";
  const fullName = input.fullName?.trim() || null;
  const normalizedEmail = input.email.trim().toLowerCase();

  try {
    const { alreadySubscribed } = await upsertNewsletterSubscriber({
      data: { email: normalizedEmail, fullName, source },
    });

    if (alreadySubscribed) {
      return { ok: true, alreadySubscribed: true };
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
