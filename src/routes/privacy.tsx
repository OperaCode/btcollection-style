import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import { useSiteSettings } from "@/lib/site-settings";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Breakthrough Collection LLC" },
      {
        name: "description",
        content: "How Breakthrough Collection LLC collects, uses, and protects your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

const LAST_UPDATED = "September 23, 2026";

function PrivacyPage() {
  const { contactEmail } = useSiteSettings();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Legal"
        title="Privacy"
        italic="Policy"
        blurb="How we handle order, contact, and personalization details."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="prose-legal space-y-8 text-sm leading-relaxed text-foreground/80">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Last updated: {LAST_UPDATED}
          </p>

          <p>
            Breakthrough Collection LLC ("we", "us", "our") respects your privacy. This policy
            explains what information we collect when you shop with us, how we use it, and the
            choices you have.
          </p>

          <Section title="Information We Collect">
            When you place an order, request a custom piece, or contact us, we collect information
            such as your name, email address, phone number, shipping address, and order or request
            details (including any photo, text, or wording you submit for personalization).
          </Section>

          <Section title="How We Use It">
            We use your information to process and ship orders, respond to custom order and support
            requests, send order confirmations, and — only if you opt in — send updates about new
            collections and offers. We never sell your personal information.
          </Section>

          <Section title="Service Providers">
            We share the minimum information needed with the vendors that help us run the shop:{" "}
            <strong>Square</strong> to process payments, <strong>Shippo</strong> to generate
            shipping quotes and labels, <strong>Resend</strong> to deliver order and account
            emails, and <strong>Supabase</strong> to securely store order and account data. Each
            handles your information under its own privacy policy and only for the purpose of
            providing that service to us.
          </Section>

          <Section title="Payment Information">
            Payments are processed securely by Square. We never see or store your full card
            number on our servers.
          </Section>

          <Section title="Cookies">
            We use basic cookies and local storage to remember your cart and wishlist between
            visits. We don't run third-party advertising or analytics trackers.
          </Section>

          <Section title="Your Choices">
            You can unsubscribe from marketing emails at any time using the link in those emails,
            or by emailing us. You can request a copy of, or the deletion of, the personal
            information we hold about you by contacting us below.
          </Section>

          <Section title="Contact">
            Questions about this policy can be sent to {contactEmail}.
          </Section>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl text-ink">{title}</h2>
      <p className="mt-3">{children}</p>
    </div>
  );
}
