import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import { CONTACT_EMAIL } from "@/lib/site-config";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Breakthrough Collection LLC" },
      {
        name: "description",
        content: "Terms of service for shopping with Breakthrough Collection LLC.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Legal"
        title="Terms of"
        italic="Service"
        blurb="The shopping, custom order, and site-use terms for Breakthrough Collection LLC."
      />
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <Section title="Orders">
            By placing an order with Breakthrough Collection LLC, you confirm the shipping and
            personalization details you've provided are accurate. We are not responsible for delays
            or errors caused by incorrect information at checkout.
          </Section>

          <Section title="Pricing">
            All prices are listed in USD and may change without notice. Prices at the time of
            checkout are final for that order.
          </Section>

          <Section title="Custom Orders">
            Custom order requests are quoted individually and require approval of a design proof
            before production begins. Once approved, production begins and the order becomes final
            sale per our Returns policy.
          </Section>

          <Section title="Intellectual Property">
            All designs, photography, and content on this site are the property of Breakthrough
            Collection LLC and may not be reproduced without permission.
          </Section>

          <Section title="Limitation of Liability">
            Breakthrough Collection LLC is not liable for indirect or incidental damages arising
            from the use of our products or website.
          </Section>

          <Section title="Contact">
            Questions about these terms can be sent to {CONTACT_EMAIL}.
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
