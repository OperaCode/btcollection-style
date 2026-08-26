import { createServerFn } from "@tanstack/react-start";
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const sendNewsletterWelcomeEmail = createServerFn({ method: "POST" })
  .validator((data: NewsletterEmailInput) => ({
    email: normalizeEmail(data.email),
    fullName: data.fullName?.trim() || undefined,
  }))
  .handler(async ({ data }): Promise<NewsletterEmailResult> => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;

    if (!apiKey || !from) {
      return {
        sent: false,
        skipped: true,
        error: "Resend is not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL.",
      };
    }

    const greeting = data.fullName ? `Hi ${data.fullName},` : "Hi there,";
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
  });
