import { createServerFn } from "@tanstack/react-start";

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
        html: `
          <div style="font-family: Arial, sans-serif; color: #241f1a; line-height: 1.6; max-width: 560px;">
            <h1 style="font-family: Georgia, serif; font-size: 30px; margin-bottom: 12px;">
              Welcome to Breakthrough Collection LLC
            </h1>
            <p>${greeting}</p>
            <p>
              Thank you for joining our newsletter. You will be first to hear about new faith-inspired
              pieces, custom design drops, gift sets, and subscriber-only offers.
            </p>
            <p>
              We are grateful to have you here.
            </p>
            <p style="margin-top: 28px;">With love,<br />Breakthrough Collection LLC</p>
          </div>
        `,
        text: `${greeting}\n\nWelcome to Breakthrough Collection LLC. Thank you for joining our newsletter. You will be first to hear about new collections, custom design drops, gift sets, and subscriber-only offers.`,
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
