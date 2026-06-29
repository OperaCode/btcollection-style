import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Clock, Instagram, Facebook, ArrowRight } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — BT Collection LLC" },
      {
        name: "description",
        content:
          "Get in touch with BT Collection LLC for custom orders, wholesale, ministry gifting, and care questions.",
      },
      { property: "og:title", content: "Contact — BT Collection LLC" },
      { property: "og:description", content: "We’d love to hear from you." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: ContactPage,
});

const INFO = [
  { icon: Mail, label: "Email", value: "hello@btcollectionllc.com" },
  { icon: Clock, label: "Studio Hours", value: "Mon – Fri · 9am – 5pm EST" },
  { icon: MapPin, label: "Studio", value: "Made with love in the USA" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <PageHero
        kicker="Say Hello"
        title="We’d love to"
        italic="hear from you."
        blurb="Whether it’s a custom order, a wholesale inquiry, or simply a hello — our inbox is open."
        image={heroImg}
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-28">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Get in Touch</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Let’s create something beautiful.</h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            For custom orders, ministry & corporate gifting, or wholesale, please use the form
            and we’ll respond within one business day.
          </p>

          <ul className="mt-10 space-y-6">
            {INFO.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
                  <div className="mt-1 text-base text-ink">{value}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex gap-2">
            <a href="#" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition hover:border-gold hover:text-gold">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/70 transition hover:border-gold hover:text-gold">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="rounded-sm border border-border bg-card p-8 md:p-10"
        >
          {sent ? (
            <div className="grid place-items-center py-10 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-3xl text-ink">Message received</h3>
              <p className="mt-3 max-w-sm text-sm text-foreground/75">
                Thank you for reaching out. We’ll be in your inbox within one business day.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl text-ink">Send us a note</h3>
              <p className="mt-2 text-sm text-muted-foreground">All fields required.</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name"><input required className={inputCls} /></Field>
                <Field label="Last name"><input required className={inputCls} /></Field>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email"><input required type="email" className={inputCls} /></Field>
                <Field label="Subject">
                  <select className={inputCls}>
                    <option>General question</option>
                    <option>Custom order</option>
                    <option>Wholesale / Bulk</option>
                    <option>Order support</option>
                  </select>
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Message">
                  <textarea required rows={5} className={inputCls} />
                </Field>
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink"
              >
                Send Message <ArrowRight className="h-4 w-4" />
              </button>
            </>
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