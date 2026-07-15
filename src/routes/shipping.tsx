import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Breakthrough Collection LLC" },
      {
        name: "description",
        content: "Shipping timelines, costs, and tracking for Breakthrough Collection LLC orders.",
      },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Good to Know"
        title="Shipping"
        italic="Policy"
        blurb="Processing timelines, delivery estimates, and tracking details."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="Processing Time">
            Personalized and custom pieces are hand-finished to order — please allow 7–8 business
            days for production before your order ships. Ready-to-ship items typically leave our
            studio within 1–2 business days.
          </Section>

          <Section title="Shipping Rates & Delivery">
            We ship nationwide across the US. Most packages arrive within 3–7 business days after
            leaving our studio.
          </Section>

          <Section title="Tracking">
            You'll receive a tracking number by email as soon as your order ships.
          </Section>

          <Section title="Delays">
            During high-volume seasons (holidays, Mother's Day) production times may extend slightly
            — we'll always note current turnaround times at checkout.
          </Section>

          <Section title="Questions">
            Reach out any time at {CONTACT_EMAIL} for a status update on your order.
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
