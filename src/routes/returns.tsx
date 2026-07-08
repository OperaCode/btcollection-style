import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds — BT Collection LLC" },
      { name: "description", content: "Return, exchange, and refund policy for BT Collection LLC." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Good to Know"
        title="Returns"
        italic="& Refunds"
        blurb="Simple expectations for personalized, custom, and ready-to-ship items."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="Personalized & Custom Items">
            Because every personalized or custom piece is made specifically for you, these items
            are final sale and cannot be returned or exchanged — unless they arrive damaged or
            incorrect, in which case we'll replace or refund it at no cost to you.
          </Section>

          <Section title="Non-Personalized Items">
            Unpersonalized, ready-to-ship items may be returned within 14 days of delivery for a
            refund, provided they're unused and in their original packaging. Return shipping is the
            customer's responsibility unless the item arrived damaged or incorrect.
          </Section>

          <Section title="Damaged or Incorrect Orders">
            If your order arrives damaged or isn't what you ordered, email us at {CONTACT_EMAIL}{" "}
            within 7 days with a photo, and we'll make it right with a replacement or refund.
          </Section>

          <Section title="Refund Timing">
            Approved refunds are issued to your original payment method within 5–7 business days.
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
