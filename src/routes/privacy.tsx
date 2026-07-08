import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BT Collection LLC" },
      { name: "description", content: "How BT Collection LLC collects, uses, and protects your information." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <p>
            BT Collection LLC ("we", "us", "our") respects your privacy. This policy explains what
            information we collect when you shop with us, how we use it, and the choices you have.
          </p>

          <Section title="Information We Collect">
            When you place an order, request a custom piece, or contact us, we collect information
            such as your name, email address, shipping address, and order details. If you create an
            account, we store your login credentials securely through our authentication provider.
          </Section>

          <Section title="How We Use It">
            We use your information to process and ship orders, respond to custom order and support
            requests, send order confirmations, and — only if you opt in — send updates about new
            collections and offers. We never sell your personal information.
          </Section>

          <Section title="Payment Information">
            Payment details are processed securely and are not stored on our servers.
          </Section>

          <Section title="Cookies">
            We use basic cookies and local storage to remember your cart and wishlist between visits.
          </Section>

          <Section title="Your Rights">
            You may request a copy of the data we hold about you, ask us to correct it, or request
            deletion at any time by contacting us at {CONTACT_EMAIL}.
          </Section>

          <Section title="Contact">
            Questions about this policy can be sent to {CONTACT_EMAIL}.
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
