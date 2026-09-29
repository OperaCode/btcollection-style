import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
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
    // Dynamic import, not a top-level one: this file is reachable from
    // client-side code (commerce.ts -> index.tsx), and @tanstack/react-start/server
    // is server-only — a static import here would pull it into that
    // client-facing module graph. Matches the same pattern already used in
    // custom-request-email.ts for the same reason.
    const { getRequestUrl } = await import("@tanstack/react-start/server");
    const origin = getRequestUrl().origin;
    const shopUrl = `${origin}/shop`;
    // A visible, working unsubscribe link plus the List-Unsubscribe header
    // below: this is the one send in the app that's genuinely a marketing
    // email (as opposed to order confirmations, quotes, etc., which are
    // transactional and don't need one) — no unsubscribe path here both
    // hurts inbox placement (Gmail/Yahoo weigh this) and leaves a real
    // CAN-SPAM gap.
    const unsubscribeUrl = `${origin}/unsubscribe?email=${encodeURIComponent(data.email)}`;

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
        <p style="margin:28px 0 0; font-size:11px; line-height:1.6; color:#a39c8e;">
          Don't want these emails? <a href="${unsubscribeUrl}" style="color:#a39c8e;">Unsubscribe</a>.
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
        text: `${greeting}\n\nWelcome to Breakthrough Collection LLC. Thank you for joining our newsletter. You will be first to hear about new collections, custom design drops, gift sets, and subscriber-only offers.\n\nShop the collection: ${shopUrl}\n\nWith love,\nBreakthrough Collection LLC\n\nUnsubscribe: ${unsubscribeUrl}`,
        headers: {
          "List-Unsubscribe": `<mailto:${(process.env.RESEND_NOTIFY_EMAIL ?? process.env.CONTACT_EMAIL ?? "").trim() || "support@breakthroughcollection.com"}?subject=Unsubscribe>, <${unsubscribeUrl}>`,
        },
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

// Public and unauthenticated on purpose — this is reached from a link in an
// email, where there's no logged-in session to check. Worst case of no
// verification token here is someone unsubscribing an address that isn't
// theirs, which is low-stakes for a newsletter list (not a data leak, not
// reversible-harm) — the /unsubscribe page still requires an explicit
// button click, so a mail-scanner prefetching the link can't trigger it.
export const unsubscribeFromNewsletter = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => ({ email: data.email.trim().toLowerCase() }))
  .handler(async ({ data }) => {
    if (!data.email) throw new Error("Missing email address.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", data.email);
    if (error) throw error;
    return { ok: true };
  });
