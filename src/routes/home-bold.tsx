import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Heart,
  Sparkles,
  Shirt,
  Coffee,
  Gift,
  Star,
  Mail,
  Flame,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import catFaith from "@/assets/cat-faith.jpg";
import catMugs from "@/assets/cat-mugs.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import { Header, Footer } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/home-bold")({
  head: () => ({
    meta: [
      { title: "BT Collection LLC — Bold Edition" },
      {
        name: "description",
        content:
          "A bolder take on BT Collection LLC — faith-inspired apparel, mugs, accessories, and gift sets with maximum attitude.",
      },
      { property: "og:title", content: "BT Collection LLC — Bold Edition" },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: HomeBold,
});

const TICKER = [
  "STITCHED WITH PURPOSE",
  "FAITH ✦ FAMILY ✦ FIRE",
  "MADE IN THE USA",
  "CUSTOM IN 48 HRS",
  "BULK DISCOUNTS LIVE",
  "BREAKTHROUGH SEASON",
];

const CATEGORIES = [
  { n: "01", name: "Breakthrough Faith", blurb: "Apparel rooted in scripture", img: catFaith },
  { n: "02", name: "Personalized Mugs", blurb: "15oz drinkware, your way", img: catMugs },
  { n: "03", name: "Accessories", blurb: "Totes, hats, everyday carry", img: catAccessories },
  { n: "04", name: "Curated Gift Sets", blurb: "Boxed for big moments", img: catGifts },
];

const PRODUCTS = [
  { name: "Faith Over Fear Sweatshirt", price: "$48", tag: "Faith", img: p1 },
  { name: "Blessed Mom 15oz Mug", price: "$22", tag: "Mugs", img: p2 },
  { name: "Grateful Canvas Tote", price: "$28", tag: "Accessories", img: p3 },
  { name: "Signature Navy Gift Box", price: "$85", tag: "Gift Sets", img: p4 },
];

const SERVICES = [
  { icon: Shirt, title: "Faith-Inspired Apparel", body: "Sweatshirts, tees, hoodies — scripture you wear loud." },
  { icon: Coffee, title: "Personalized Mugs", body: "Premium 15oz mugs printed with your story." },
  { icon: Sparkles, title: "Custom Designs", body: "Birthdays, weddings, ministry — we bring it to life." },
  { icon: Gift, title: "Curated Gift Sets", body: "Boxed sets for mentors, mothers, milestones." },
];

const REVIEWS = [
  { quote: "The Blessed Mom mug arrived in the most beautiful packaging — my mother cried.", name: "Amara J." },
  { quote: "Ordered custom sweatshirts for our women’s ministry. Stitching is gorgeous.", name: "Pastor Renee K." },
  { quote: "BT Collection’s gift sets are my go-to for client gifting. High-end without being cold.", name: "Daniella O." },
];

function HomeBold() {
  return (
    <div className="min-h-screen bg-ink text-background">
      <BoldBanner />
      <div className="bg-ink">
        <div className="[&_header]:!bg-ink/90 [&_header]:!border-white/10 [&_a]:!text-background [&_button]:!text-background">
          <Header />
        </div>
      </div>
      <Hero />
      <Ticker />
      <Categories />
      <Manifesto />
      <Services />
      <Drop />
      <Testimonials />
      <BigCTA />
      <Footer />
    </div>
  );
}

function BoldBanner() {
  return (
    <div className="bg-gold text-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em]">
        <Flame className="h-3.5 w-3.5" />
        Breakthrough season — code <span className="underline">BTC15</span> for 15% off
        <Flame className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-ink">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-20 pt-16 md:grid-cols-12 md:px-8 md:pb-28 md:pt-24">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-gold">
            <Zap className="h-3 w-3" /> Bold Edition · FW26
          </div>
          <h1 className="mt-6 font-display text-[18vw] leading-[0.82] tracking-tight md:text-[10rem]">
            EVERY
            <br />
            <span className="italic text-gold">STITCH</span>
            <br />
            SPEAKS.
          </h1>
          <p className="mt-8 max-w-md text-base text-background/75">
            Faith-loud apparel, personalized mugs, and gift sets engineered to be felt — not
            just worn. BT Collection LLC is for the bold believers.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-gold px-7 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-ink transition hover:bg-background"
            >
              Shop the Drop
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </Link>
            <Link
              to="/custom"
              className="inline-flex items-center gap-3 border border-background/50 px-7 py-4 text-[12px] font-bold uppercase tracking-[0.24em] text-background transition hover:border-gold hover:text-gold"
            >
              Build Your Own
            </Link>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
            <img src={heroImg} alt="" className="h-full w-full object-cover grayscale contrast-125" />
            <div className="absolute inset-0 bg-gradient-to-tr from-gold/40 via-transparent to-ink/40 mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 text-[10px] uppercase tracking-[0.28em]">
              <span className="bg-gold px-2 py-1 text-ink">NEW</span>
              <span className="text-background/80">VOL · 01</span>
            </div>
          </div>
          <div className="absolute -left-6 top-8 hidden rotate-[-8deg] border border-gold bg-ink px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-gold md:block">
            Made in USA
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Ticker ───────── */
function Ticker() {
  const items = [...TICKER, ...TICKER, ...TICKER];
  return (
    <div className="overflow-hidden border-y border-white/10 bg-gold py-4 text-ink">
      <div className="animate-marquee flex w-max gap-10 text-sm font-black uppercase tracking-[0.2em]">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t} <span>★</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────── Categories ───────── */
function Categories() {
  return (
    <section className="border-b border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="font-display text-5xl md:text-7xl">
            Shop <span className="italic text-gold">loud.</span>
          </h2>
          <Link to="/shop" className="hidden text-[11px] uppercase tracking-[0.25em] text-gold hover:underline md:inline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              className="group relative block aspect-[3/4] overflow-hidden bg-ink"
            >
              <img src={c.img} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <span className="font-display text-3xl text-gold">{c.n}</span>
                <div>
                  <div className="font-display text-2xl leading-tight">{c.name.toUpperCase()}</div>
                  <div className="mt-1 text-xs text-background/70">{c.blurb}</div>
                  <div className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold opacity-0 transition group-hover:opacity-100">
                    Enter <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Manifesto ───────── */
function Manifesto() {
  return (
    <section className="border-b border-white/10 bg-gold text-ink">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <p className="text-[11px] uppercase tracking-[0.32em]">Our Manifesto</p>
        <p className="mt-6 font-display text-4xl leading-[1.05] md:text-6xl">
          We don’t whisper our faith. We <span className="italic">wear it</span>, pour it into
          coffee mugs, stitch it into sweatshirts, and pack it into gift boxes —
          <span className="bg-ink px-3 text-gold"> made loud, made on purpose.</span>
        </p>
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-ink/30 pt-8 md:grid-cols-4">
          {[
            ["500+", "Gifts Shipped"],
            ["48h", "Custom Turnaround"],
            ["100%", "Made With Love"],
            ["5★", "Avg Review"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-5xl">{v}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em]">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Services ───────── */
function Services() {
  return (
    <section className="border-b border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">What We Make</span>
          <h2 className="mt-3 font-display text-5xl md:text-7xl">The Craft.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {SERVICES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="group flex items-start gap-6 border-b border-white/10 p-8 transition hover:bg-gold hover:text-ink md:p-12 [&:nth-child(odd)]:md:border-r"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center border border-gold text-gold transition group-hover:border-ink group-hover:bg-ink group-hover:text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[11px] uppercase tracking-[0.28em] opacity-60">0{i + 1}</span>
                  <h3 className="font-display text-3xl md:text-4xl">{title}</h3>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed opacity-80">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Drop ───────── */
function Drop() {
  return (
    <section className="border-b border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold">The Drop</span>
            <h2 className="mt-2 font-display text-5xl md:text-7xl">New In.</h2>
          </div>
          <Link to="/shop" className="text-[11px] uppercase tracking-[0.25em] text-gold hover:underline">
            All Products →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <article key={p.name} className="group relative bg-ink p-4">
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <img src={p.img} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-ink">
                  0{i + 1} / Drop
                </span>
                <button
                  aria-label="wishlist"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-white/30 bg-ink/60 text-background transition hover:border-gold hover:text-gold"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-gold">{p.tag}</div>
                  <h3 className="mt-1 font-display text-xl leading-tight">{p.name}</h3>
                </div>
                <div className="font-display text-2xl text-gold">{p.price}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Testimonials ───────── */
function Testimonials() {
  return (
    <section className="border-b border-white/10 bg-ink">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Voices</span>
          <h2 className="mt-3 font-display text-5xl md:text-7xl">
            Loud <span className="italic text-gold">love.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px bg-white/10 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex flex-col justify-between bg-ink p-8 md:p-10">
              <div>
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold" />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-2xl leading-snug">
                  “{r.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-8 border-t border-white/10 pt-4 text-[11px] uppercase tracking-[0.25em] text-gold">
                — {r.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Big CTA ───────── */
function BigCTA() {
  return (
    <section className="relative overflow-hidden bg-gold text-ink">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <h2 className="font-display text-6xl leading-[0.9] md:text-[9rem]">
          JOIN THE
          <br />
          <span className="italic">BREAKTHROUGH.</span>
        </h2>
        <p className="mt-6 max-w-md text-sm font-medium">
          First access to drops, custom design windows, and subscriber-only offers.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60" />
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="h-14 w-full border-2 border-ink bg-transparent pl-11 pr-4 text-sm font-medium text-ink placeholder:text-ink/50 focus:outline-none"
            />
          </div>
          <button className="h-14 bg-ink px-8 text-[12px] font-bold uppercase tracking-[0.24em] text-gold transition hover:bg-background hover:text-ink">
            Sign Me Up →
          </button>
        </form>
      </div>
    </section>
  );
}