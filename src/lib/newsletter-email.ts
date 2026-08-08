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
    const year = new Date().getFullYear();
    
    const shopUrl = "https://breakthroughcollection.com/shop";

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
          <div style="background-color:#f7f2ea; padding:32px 16px; font-family: Arial, Helvetica, sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background-color:#ffffff; border:1px solid #ece4d3; border-radius:4px;">
              <tr>
                <td style="background-color:#1f1d2b; padding:32px 24px; text-align:center; border-radius:4px 4px 0 0;">
                  <div style="font-family: Georgia, 'Times New Roman', serif; font-size:20px; letter-spacing:3px; text-transform:uppercase; color:#c8a45c;">
                    Breakthrough Collection <span style="font-style:italic; color:#e4cfa0;">LLC</span>
                  </div>
                  <div style="margin-top:8px; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.55);">
                    Every Stitch Tells a Story
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 32px;">
                  <p style="margin:0 0 8px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#c8a45c; font-weight:bold;">
                    Stay Connected
                  </p>
                  <h1 style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.25; color:#1f1d2b;">
                    Welcome to the Breakthrough family
                  </h1>
                  <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
                  <p style="margin:0 0 28px; font-size:15px; line-height:1.7; color:#3a3630;">
                    Thank you for joining our newsletter. You'll be first to hear about new
                    faith-inspired pieces, custom design drops, gift sets, and subscriber-only offers.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background-color:#c8a45c; border-radius:999px;">
                        <a href="${shopUrl}" style="display:inline-block; padding:14px 32px; font-family: Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1f1d2b; text-decoration:none;">
                          Shop the Collection
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:32px 0 0; font-size:14px; line-height:1.7; color:#3a3630;">
                    We are grateful to have you here.<br />With love,<br />Breakthrough Collection LLC
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background-color:#f7f2ea; padding:20px 24px; text-align:center; border-top:1px solid #ece4d3; border-radius:0 0 4px 4px;">
                  <p style="margin:0; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#8c8579;">
                    Crafted with love &middot; Made for the journey
                  </p>
                  <p style="margin:8px 0 0; font-size:11px; color:#a39c8e;">
                    &copy; ${year} Breakthrough Collection LLC. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </div>
        `,
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
