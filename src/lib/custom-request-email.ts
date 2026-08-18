import { createServerFn } from "@tanstack/react-start";
import { brandedEmailHtml } from "@/lib/email-template";

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

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
  skipped?: boolean;
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

async function sendCustomerEmail(input: {
  id: string;
  email: string;
  subject: string;
  html: string;
  text: string;
}): Promise<CustomRequestEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Breakthrough Collection LLC <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false, error: "Resend is not configured. Add RESEND_API_KEY." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: input.email, subject: input.subject, html: input.html, text: input.text }),
  });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  if (!response.ok) {
    const body = await response.text();
    const error = body || `Resend returned ${response.status}.`;
    await supabaseAdmin
      .from("custom_requests")
      .update({ customer_notification_error: error })
      .eq("id", input.id);
    return { sent: false, error };
  }

  await supabaseAdmin
    .from("custom_requests")
    .update({ customer_notified_at: new Date().toISOString(), customer_notification_error: null })
    .eq("id", input.id);

  return { sent: true };
}

export const sendCustomRequestConfirmation = createServerFn({ method: "POST" })
  .validator((data: { id: string; fullName: string; email: string }) => ({
    ...data,
    email: data.email.trim().toLowerCase(),
  }))
  .handler(async ({ data }): Promise<CustomRequestEmailResult> => {
    const greeting = data.fullName ? `Hi ${data.fullName},` : "Hi there,";
    const html = brandedEmailHtml({
      eyebrow: "Custom Quote Request",
      heading: "Your request is under review",
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">
          Thank you for sending your custom order request. We've received it and it's now being
          reviewed. We'll follow up with a quote shortly.
        </p>
        <p style="margin:0; font-size:12px; color:#8c8579;">Reference: ${data.id.slice(0, 8)}</p>
      `,
    });

    return sendCustomerEmail({
      id: data.id,
      email: data.email,
      subject: "Your custom order request is under review",
      html,
      text: `${greeting}\n\nThank you for sending your custom order request. We've received it and it's now being reviewed. We'll follow up with a quote shortly.\n\nReference: ${data.id.slice(0, 8)}`,
    });
  });

export const sendCustomRequestQuote = createServerFn({ method: "POST" })
  .validator((data: { id: string; fullName: string; email: string; quotedPrice: number; quoteNote?: string | null }) => ({
    ...data,
    email: data.email.trim().toLowerCase(),
  }))
  .handler(async ({ data }): Promise<CustomRequestEmailResult> => {
    const greeting = data.fullName ? `Hi ${data.fullName},` : "Hi there,";
    const price = formatUSD(data.quotedPrice);

    const { isSquareConfigured } = await import("@/lib/square");
    const squareConfigured = isSquareConfigured();

    let cta: { label: string; url: string } | undefined;
    let actionCopy: string;

    if (squareConfigured) {
      const { getRequestUrl } = await import("@tanstack/react-start/server");
      const origin = getRequestUrl().origin;
      cta = { label: `Pay ${price} to Approve`, url: `${origin}/custom/pay/${data.id}` };
      actionCopy = "Click below to pay and we'll get started, or reply to this email if you'd like any changes.";
    } else {
      const contactEmail =
        process.env.RESEND_NOTIFY_EMAIL ?? process.env.CONTACT_EMAIL ?? process.env.VITE_CONTACT_EMAIL ?? "";
      cta = contactEmail
        ? {
            label: "Reply to Approve",
            url: `mailto:${contactEmail}?subject=${encodeURIComponent(`Approve my quote - ${data.id.slice(0, 8)}`)}`,
          }
        : undefined;
      actionCopy = "Reply to this email to approve and we'll get started, or let us know if you'd like any changes.";
    }

    const html = brandedEmailHtml({
      eyebrow: "Custom Quote Request",
      heading: "Your quote is ready",
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
        <p style="margin:0 0 8px; font-size:15px; line-height:1.7; color:#3a3630;">
          Here's the quote for your custom piece:
        </p>
        <p style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:28px; color:#1f1d2b;">
          ${price}
        </p>
        ${
          data.quoteNote
            ? `<p style="margin:0 0 16px; font-size:14px; line-height:1.7; color:#3a3630; white-space:pre-line;">${data.quoteNote}</p>`
            : ""
        }
        <p style="margin:0 0 28px; font-size:14px; line-height:1.7; color:#3a3630;">
          ${actionCopy}
        </p>
      `,
      cta,
    });

    return sendCustomerEmail({
      id: data.id,
      email: data.email,
      subject: "Your custom quote is ready",
      html,
      text: `${greeting}\n\nHere's the quote for your custom piece: ${price}\n${data.quoteNote ? `\n${data.quoteNote}\n` : ""}\n${actionCopy}${cta ? `\n${cta.url}` : ""}`,
    });
  });

const STATUS_COPY: Record<string, { heading: string; body: string }> = {
  processing: {
    heading: "Payment received — you're confirmed",
    body: "Thanks for your payment. Your custom piece is now queued up and work is starting.",
  },
  ready: {
    heading: "Your order is ready",
    body: "Your custom piece is finished. We'll be in touch shortly about pickup or shipping.",
  },
  shipped: {
    heading: "Your order has shipped",
    body: "Your custom piece is on its way to you. We'll follow up with tracking details shortly.",
  },
  delivered: {
    heading: "Your order has been delivered",
    body: "Your custom piece has arrived. Thank you for trusting us with something so personal — we're grateful for you.",
  },
};

export const sendCustomRequestStatusUpdate = createServerFn({ method: "POST" })
  .validator((data: { id: string; fullName: string; email: string; status: string }) => ({
    ...data,
    email: data.email.trim().toLowerCase(),
  }))
  .handler(async ({ data }): Promise<CustomRequestEmailResult> => {
    const copy = STATUS_COPY[data.status];
    if (!copy) return { sent: false, skipped: true, error: "No email template for this status." };

    const greeting = data.fullName ? `Hi ${data.fullName},` : "Hi there,";
    const html = brandedEmailHtml({
      eyebrow: "Custom Quote Request",
      heading: copy.heading,
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
        <p style="margin:0; font-size:15px; line-height:1.7; color:#3a3630;">${copy.body}</p>
      `,
    });

    return sendCustomerEmail({
      id: data.id,
      email: data.email,
      subject: copy.heading,
      html,
      text: `${greeting}\n\n${copy.body}`,
    });
  });
