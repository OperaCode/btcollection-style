import { createServerFn } from "@tanstack/react-start";

type CustomRequestEmailInput = {
  id: string;
  fullName: string;
  email: string;
  itemType?: string | null;
  occasion?: string | null;
  quantity?: number | null;
  deadline?: string | null;
  deliveryPreference?: string | null;
  sampleImagePath?: string | null;
  designText?: string | null;
  mediaDetails?: string | null;
  idea?: string | null;
};

type CustomRequestEmailResult = {
  sent: boolean;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function field(label: string, value?: string | number | null) {
  return `<p><strong>${label}:</strong> ${escapeHtml(String(value || "Not provided"))}</p>`;
}

export const sendCustomRequestNotification = createServerFn({ method: "POST" })
  .validator((data: CustomRequestEmailInput) => ({
    ...data,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
  }))
  .handler(async ({ data }): Promise<CustomRequestEmailResult> => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "Breakthrough Collection LLC <onboarding@resend.dev>";
    const to =
      process.env.RESEND_NOTIFY_EMAIL ??
      process.env.CONTACT_EMAIL ??
      process.env.VITE_CONTACT_EMAIL;

    if (!apiKey || !to) {
      return {
        sent: false,
        error:
          "Custom request was saved, but email notification is not configured. Add RESEND_API_KEY and RESEND_NOTIFY_EMAIL.",
      };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: data.email,
        subject: `New custom order request from ${data.fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #241f1a; line-height: 1.6; max-width: 640px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; margin-bottom: 12px;">
              New custom order request
            </h1>
            ${field("Name", data.fullName)}
            ${field("Email", data.email)}
            ${field("Item type", data.itemType)}
            ${field("Occasion", data.occasion)}
            ${field("Quantity", data.quantity)}
            ${field("Needed by", data.deadline)}
            ${field("Delivery preference", data.deliveryPreference)}
            ${field("Sample image path", data.sampleImagePath)}
            ${field("Text / wording", data.designText)}
            ${field("Media details", data.mediaDetails)}
            <p><strong>Idea:</strong></p>
            <p style="white-space: pre-line;">${escapeHtml(data.idea || "Not provided")}</p>
            <p style="margin-top: 28px; font-size: 12px; color: #6f675f;">
              Request ID: ${escapeHtml(data.id)}
            </p>
          </div>
        `,
        text: [
          "New custom order request",
          `Name: ${data.fullName}`,
          `Email: ${data.email}`,
          `Item type: ${data.itemType || "Not provided"}`,
          `Occasion: ${data.occasion || "Not provided"}`,
          `Quantity: ${data.quantity || "Not provided"}`,
          `Needed by: ${data.deadline || "Not provided"}`,
          `Delivery preference: ${data.deliveryPreference || "Not provided"}`,
          `Sample image path: ${data.sampleImagePath || "Not provided"}`,
          `Text / wording: ${data.designText || "Not provided"}`,
          `Media details: ${data.mediaDetails || "Not provided"}`,
          `Idea: ${data.idea || "Not provided"}`,
          `Request ID: ${data.id}`,
        ].join("\n"),
      }),
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!response.ok) {
      const body = await response.text();
      const error = body || `Resend returned ${response.status}.`;
      await supabaseAdmin
        .from("custom_requests")
        .update({ notification_error: error })
        .eq("id", data.id);
      return { sent: false, error };
    }

    await supabaseAdmin
      .from("custom_requests")
      .update({
        notification_sent_at: new Date().toISOString(),
        notification_error: null,
      })
      .eq("id", data.id);

    return { sent: true };
  });
