import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Shirt, Coffee, Gift, Check, ArrowRight } from "lucide-react";
import { Header, Footer, PageHero } from "@/components/site/SiteChrome";
import catMugs from "@/assets/cat-mugs.jpg";
import { saveCustomRequest } from "@/lib/commerce";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom Orders — BT Collection LLC" },
      {
        name: "description",
        content:
          "Design your own faith-inspired apparel, mugs, and curated gift sets. Personalized custom orders for weddings, ministry, milestones, and small business.",
      },
      { property: "og:title", content: "Custom Orders — BT Collection LLC" },
      {
        property: "og:description",
        content: "Personalized apparel, mugs, and gift sets — designed with you.",
      },
      { property: "og:image", content: catMugs },
    ],
  }),
  component: CustomPage,
});

const TYPES = [
  { icon: Shirt, title: "Apparel", body: "Sweatshirts, hoodies, tees, and embroidered pieces." },
  { icon: Coffee, title: "Drinkware", body: "Premium 15oz mugs, tumblers, and water bottles." },
  { icon: Gift, title: "Gift Sets", body: "Curated boxes for showers, ministry, or corporate." },
  { icon: Sparkles, title: "Custom Anything", body: "Have an idea? Tell us — we’ll bring it to life." },
];

const STEPS = [
  { n: "01", title: "Share Your Vision", body: "Tell us about the occasion, quantity, and any inspiration you already have." },
  { n: "02", title: "We Design It", body: "Our team sends back proofs within 48 hours — refine until it feels perfectly you." },
  { n: "03", title: "Crafted & Shipped", body: "Once approved, we hand-finish your order and ship gift-ready, beautifully boxed." },
];

const INCLUDES = [
  "Free design consultation",
  "Up to 3 design revisions",
  "Gift-ready packaging",
  "Bulk pricing on 12+ pieces",
  "Priority production",
  "Dedicated order concierge",
];

function CustomPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pt-8 pb-20 md:grid-cols-2 md:px-8 md:pt-10 md:pb-24">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Every Custom Includes</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">White-glove from start to finish.</h2>
          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INCLUDES.map((i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Check className="h-3 w-3" />
                </span>
                {i}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            const form = new FormData(e.currentTarget);
            await saveCustomRequest(Object.fromEntries(form.entries()));
            setSending(false);
            setSent(true);
          }}
          className="rounded-sm border border-border bg-card p-8 md:p-10"
        >
          <h3 className="font-display text-2xl text-ink">Start Your Custom Order</h3>
          <p className="mt-2 text-sm text-muted-foreground">We’ll respond within 24 hours with next steps.</p>

          {sent ? (
            <div className="mt-8 rounded-sm border border-gold/40 bg-gold/10 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-3 font-display text-xl text-ink">Thank you — we’ve got it!</p>
              <p className="mt-2 text-sm text-foreground/75">A member of our team will reach out shortly.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4">
              <Field label="Your name"><input name="name" required className={inputCls} /></Field>
              <Field label="Email"><input name="email" required type="email" className={inputCls} /></Field>
              <Field label="Occasion">
                <select name="occasion" className={inputCls}>
                  <option>Wedding / Bridal</option>
                  <option>Ministry / Church</option>
                  <option>Corporate gifting</option>
                  <option>Birthday / Milestone</option>
                  <option>Other</option>
                </select>
              </Field>
              <Field label="Quantity"><input name="quantity" type="number" min={1} defaultValue={12} className={inputCls} /></Field>
              <Field label="Tell us about your idea">
                <textarea name="idea" rows={4} className={inputCls} placeholder="Colors, scripture, names, deadline..." />
              </Field>
              <button
                type="submit"
                disabled={sending}
                className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink"
              >
                {sending ? "Submitting..." : "Submit Request"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </section>

      <Footer />
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
