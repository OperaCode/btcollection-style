import { createServerFn } from "@tanstack/react-start";
import { brandedEmailHtml } from "@/lib/email-template";
import { isLikelySpam } from "@/lib/spam-guard";

type ContactMessageInput = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
  formRenderedAt?: number;
};

type ContactMessageResult = { sent: boolean; error?: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The site's /contact form used to only save to the visitor's own browser
// (see commerce.ts history) — nothing ever reached the owner. This actually
// delivers it via Resend. Worst-case abuse of this being an open createServerFn
// is spam landing in the owner's own inbox (there's no arbitrary recipient —
// `to` is always the fixed contact address), which is a much smaller risk
// than the order/custom-request email senders, so no admin gate here.
export const sendContactMessage = createServerFn({ method: "POST" })
  .validator((data: ContactMessageInput) => ({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim() || "General question",
    message: data.message.trim(),
    honeypot: data.honeypot,
    formRenderedAt: data.formRenderedAt,
  }))
  .handler(async ({ data }): Promise<ContactMessageResult> => {
    // Pretend success so a bot gets no signal that it was caught.
    if (isLikelySpam(data)) return { sent: true };

    if (!data.firstName || !data.email || !data.message) {
      return { sent: false, error: "Please fill out your name, email, and message." };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "Breakthrough Collection LLC <onboarding@resend.dev>";
    const to = process.env.RESEND_NOTIFY_EMAIL ?? process.env.CONTACT_EMAIL ?? process.env.VITE_CONTACT_EMAIL;

    if (!apiKey || !to) {
      return { sent: false, error: "Contact form is not configured. Add RESEND_API_KEY and RESEND_NOTIFY_EMAIL." };
    }

    const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
    const html = brandedEmailHtml({
      eyebrow: "Contact Form",
      heading: `New message: ${escapeHtml(data.subject)}`,
      bodyHtml: `
        <p><strong>From:</strong> ${escapeHtml(fullName)} (${escapeHtml(data.email)})</p>
        <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <p style="margin-top:16px; white-space:pre-line;">${escapeHtml(data.message)}</p>
      `,
    });
    const text = [
      `New contact form message`,
      `From: ${fullName} (${data.email})`,
      `Subject: ${data.subject}`,
      "",
      data.message,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        reply_to: data.email,
        subject: `Contact form: ${data.subject}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return { sent: false, error: body || `Resend returned ${response.status}.` };
    }
    return { sent: true };
  });
