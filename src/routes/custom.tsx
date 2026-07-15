import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Shirt, Coffee, Gift, Check, ArrowRight, Clock, Zap } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import catMugs from "@/assets/cat-mugs.jpg";
import { saveCustomRequest } from "@/lib/commerce";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom Orders - Breakthrough Collection LLC" },
      {
        name: "description",
        content:
          "Design your own faith-inspired apparel, mugs, and curated gift sets. Personalized custom orders for weddings, ministry, milestones, and small business.",
      },
      { property: "og:title", content: "Custom Orders - Breakthrough Collection LLC" },
      {
        property: "og:description",
        content: "Personalized apparel, mugs, and gift sets designed with you.",
      },
      { property: "og:image", content: catMugs },
    ],
  }),
  component: CustomPage,
});

const TYPES = [
  { icon: Shirt, title: "Apparel", body: "Sweatshirts, hoodies, tees, and embroidered pieces." },
  { icon: Coffee, title: "Drinkware", body: "Premium mugs, tumblers, and water bottles." },
  {
    icon: Gift,
    title: "Gift Sets",
    body: "Curated boxes for showers, ministry, or corporate gifting.",
  },
  {
    icon: Sparkles,
    title: "Custom Anything",
    body: "Have an idea? Tell us and we will help shape it.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Share Your Details",
    body: "Tell us the item type, quantity, deadline, colors, names, and any inspiration you already have.",
  },
  {
    n: "02",
    title: "Approve Your Quote",
    body: "We confirm pricing, rush availability, timeline, and design direction before production begins.",
  },
  {
    n: "03",
    title: "Production Begins",
    body: "Once approved, we hand-finish your order and prepare it for pickup or shipping.",
  },
];

const TIMELINES = [
  {
    icon: Clock,
    title: "Standard custom orders",
    body: "Most custom orders take 2-3 weeks, depending on quantity, design complexity, item availability, and timing.",
  },
  {
    icon: Zap,
    title: "Rush custom orders",
    body: "Rush orders may be available in 7-8 days depending on quantity and complexity. Rush production includes an additional fee.",
  },
];

const INCLUDES = [
  "Free design consultation",
  "Timeline confirmed before production",
  "Rush options when available",
  "Gift-ready packaging",
  "Bulk pricing on 12+ pieces",
  "Dedicated order concierge",
];

function CustomPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="border-b border-border bg-cream/55">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-16">
          <div className="mb-10 max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold">How It Works</span>
            <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
              Custom made with clear timelines.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75 md:text-base">
              Every custom request is reviewed before we promise a date, so the timeline matches the
              quantity, design details, and production complexity.
            </p>
          </div>

          {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-sm border border-border bg-background p-6">
                <div className="font-display text-4xl italic text-gold">{s.n}</div>
                <h2 className="mt-5 font-display text-2xl text-ink">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{s.body}</p>
              </div>
            ))}
          </div> */}

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            {TIMELINES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex gap-4 rounded-sm border border-gold/35 bg-gold/10 p-5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-xl text-ink">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/75">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Final dates are confirmed after your quote and design direction are approved.
          </p> */}
        </div>
      </section>

      {/* <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">What We Customize</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Designed With You</h2>
          <span className="mt-5 inline-block h-px w-12 bg-gold" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TYPES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-sm border border-border bg-card p-8">
              <Icon className="h-7 w-7 text-gold" />
              <h3 className="mt-6 font-display text-2xl text-ink">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">{body}</p>
            </div>
          ))}
        </div>
      </section> */}

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 pb-20 md:grid-cols-2 md:px-8 md:pb-28">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">
            Every Custom Includes
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            White-glove from start to finish.
          </h2>
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
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us your deadline and details. We will respond within 24 hours with next steps.
          </p>

          {sent ? (
            <div className="mt-8 rounded-sm border border-gold/40 bg-gold/10 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-3 font-display text-xl text-ink">Thank you - we have got it.</p>
              <p className="mt-2 text-sm text-foreground/75">
                A member of our team will reach out shortly.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4">
              <Field label="Your name">
                <input name="name" required className={inputCls} />
              </Field>
              <Field label="Email">
                <input name="email" required type="email" className={inputCls} />
              </Field>
              <Field label="Occasion">
                <select name="occasion" className={inputCls}>
                  <option>Wedding / Bridal</option>
                  <option>Ministry / Church</option>
                  <option>Corporate gifting</option>
                  <option>Birthday / Milestone</option>
                  <option>Other</option>
                </select>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Quantity">
                  <input
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={12}
                    className={inputCls}
                  />
                </Field>
                <Field label="Needed by">
                  <input name="deadline" type="date" className={inputCls} />
                </Field>
              </div>
              <Field label="Timeline preference">
                <select name="timeline" className={inputCls}>
                  <option>Standard timeline: 2-3 weeks</option>
                  <option>Rush request: 7-8 days with added fee</option>
                  <option>Not sure yet</option>
                </select>
              </Field>
              <Field label="Tell us about your idea">
                <textarea
                  name="idea"
                  rows={4}
                  className={inputCls}
                  placeholder="Colors, scripture, names, deadline..."
                />
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
  "min-h-11 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
