import { createServerOnlyFn } from "@tanstack/react-start";
import { brandedEmailHtml } from "@/lib/email-template";

type NewsletterEmailInput = {
  email: string;
  fullName?: string;
};

type NewsletterEmailResult = {
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

// createServerOnlyFn, not createServerFn: only ever called from
// upsertNewsletterSubscriber right after a real subscriber row is written
// (see commerce.ts), so it's never reachable as a standalone RPC that
// anyone could use to spam an arbitrary address a "welcome" email.
export const sendNewsletterWelcomeEmail = createServerOnlyFn(
  async (rawData: NewsletterEmailInput): Promise<NewsletterEmailResult> => {
    const data = { email: rawData.email.trim().toLowerCase(), fullName: rawData.fullName?.trim() || undefined };
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
      return {
        sent: false,
        skipped: true,
        error: "Resend is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.",
      };
    }

    const greeting = data.fullName ? `Hi ${escapeHtml(data.fullName)},` : "Hi there,";
    const shopUrl = "https://breakthroughcollection.com/shop";

    const html = brandedEmailHtml({
      eyebrow: "Stay Connected",
      heading: "Welcome to the Breakthrough family",
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
        <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#3a3630;">
          Thank you for joining our newsletter. You'll be first to hear about new
          faith-inspired pieces, custom design drops, gift sets, and subscriber-only offers.
        </p>
        <p style="margin:24px 0 0; font-size:14px; line-height:1.7; color:#3a3630;">
          We are grateful to have you here.<br />With love,<br />Breakthrough Collection LLC
        </p>
      `,
      cta: { label: "Shop the Collection", url: shopUrl },
    });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: data.email,
        subject: "Welcome to the Breakthrough Collection family",
        html,
        text: `${greeting}\n\nWelcome to Breakthrough Collection LLC. Thank you for joining our newsletter. You will be first to hear about new collections, custom design drops, gift sets, and subscriber-only offers.\n\nShop the collection: ${shopUrl}\n\nWith love,\nBreakthrough Collection LLC`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        sent: false,
        error: body || `Resend returned ${response.status}.`,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("email", data.email);

    return { sent: true };
  },
);
