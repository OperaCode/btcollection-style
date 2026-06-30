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
    <div className="min-h-screen bg-[#1a0f1a] text-[#f3e9d2]">
      <BoldBanner />
      <div className="bg-[#1a0f1a]">
        <div className="[&_header]:!bg-[#1a0f1a]/90 [&_header]:!border-[#c9a96a]/15 [&_a]:!text-[#f3e9d2] [&_button]:!text-[#f3e9d2]">
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
    <div className="bg-[#3d1a2b] text-[#e8c97c] border-b border-[#c9a96a]/20">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.32em]">
        <Flame className="h-3 w-3" />
        Breakthrough season — code <span className="underline underline-offset-4">BTC15</span> for 15% off
        <Flame className="h-3 w-3" />
      </div>
    </div>
  );
}

/* ───────── Hero ───────── */
function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#c9a96a]/15 bg-gradient-to-br from-[#1a0f1a] via-[#241526] to-[#0f1a1f]">
      <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,#e8c97c_1px,transparent_0)] [background-size:32px_32px]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-20 pt-16 md:grid-cols-12 md:px-8 md:pb-28 md:pt-24">
        <div className="md:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a96a]/40 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-[#e8c97c]">
            <Zap className="h-3 w-3" /> Maison Edition · FW26
          </div>
          <h1 className="mt-8 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Every stitch
            <br />
            <span className="italic text-[#e8c97c]">tells a story</span>
            <br />
            worth wearing.
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-relaxed text-[#f3e9d2]/70">
            Faith-inspired apparel, personalized mugs, and gift sets — crafted in
            considered detail for moments that matter. BT Collection LLC, made for the
            quietly devoted.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 bg-[#e8c97c] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a0f1a] transition hover:bg-[#f3e9d2]"
            >
              Shop the Collection
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </Link>
            <Link
              to="/custom"
              className="inline-flex items-center gap-3 border border-[#f3e9d2]/30 px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3e9d2] transition hover:border-[#e8c97c] hover:text-[#e8c97c]"
            >
              Commission a Piece
            </Link>
          </div>
        </div>

        <div className="relative md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden border border-[#c9a96a]/25">
            <img src={heroImg} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1a0f1a]/60 via-transparent to-[#3d1a2b]/40" />
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 text-[10px] uppercase tracking-[0.32em]">
              <span className="bg-[#e8c97c] px-2.5 py-1 text-[#1a0f1a]">New</span>
              <span className="text-[#f3e9d2]/80">Vol · 01</span>
            </div>
          </div>
          <div className="absolute -left-6 top-8 hidden border border-[#c9a96a]/50 bg-[#1a0f1a] px-4 py-2 text-[10px] uppercase tracking-[0.32em] text-[#e8c97c] md:block">
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
    <div className="overflow-hidden border-y border-[#c9a96a]/20 bg-[#3d1a2b] py-3.5 text-[#e8c97c]">
      <div className="animate-marquee flex w-max gap-10 text-xs font-medium uppercase tracking-[0.32em]">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            {t} <span className="text-[#c9a96a]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────── Categories ───────── */
function Categories() {
  return (
    <section className="border-b border-[#c9a96a]/15 bg-[#1a0f1a]">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.36em] text-[#c9a96a]">The Atelier</span>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">
              Shop by <span className="italic text-[#e8c97c]">collection</span>
            </h2>
          </div>
          <Link to="/shop" className="hidden text-[10px] uppercase tracking-[0.32em] text-[#e8c97c] hover:underline md:inline">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-px bg-[#c9a96a]/15 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              className="group relative block aspect-[3/4] overflow-hidden bg-[#1a0f1a]"
            >
              <img src={c.img} alt={c.name} className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f1a] via-[#1a0f1a]/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <span className="font-display text-2xl italic text-[#e8c97c]">{c.n}</span>
                <div>
                  <div className="font-display text-2xl leading-tight">{c.name}</div>
                  <div className="mt-1 text-xs text-[#f3e9d2]/65">{c.blurb}</div>
                  <div className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[#e8c97c] opacity-0 transition group-hover:opacity-100">
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
    <section className="border-b border-[#c9a96a]/15 bg-[#3d1a2b] text-[#f3e9d2]">
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <p className="text-[10px] uppercase tracking-[0.36em] text-[#e8c97c]">Our Philosophy</p>
        <p className="mt-6 font-display text-3xl leading-[1.15] md:text-5xl">
          Faith deserves craftsmanship. We pour it into <span className="italic text-[#e8c97c]">considered detail</span> —
          stitched into sweatshirts, fired into ceramic, wrapped in linen — so the moments
          you give them mean something <span className="italic text-[#e8c97c]">held</span>, not hurried.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-8 border-t border-[#c9a96a]/25 pt-10 md:grid-cols-4">
          {[
            ["500+", "Gifts Shipped"],
            ["48h", "Custom Turnaround"],
            ["100%", "Handfinished"],
            ["5★", "Avg Review"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="font-display text-4xl text-[#e8c97c] md:text-5xl">{v}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-[#f3e9d2]/75">{l}</div>
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
    <section className="border-b border-[#c9a96a]/15 bg-[#0f1a1f]">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14">
          <span className="text-[10px] uppercase tracking-[0.36em] text-[#c9a96a]">What We Make</span>
          <h2 className="mt-3 font-display text-4xl md:text-6xl">The <span className="italic text-[#e8c97c]">craft</span>.</h2>
        </div>
        <div className="grid grid-cols-1 border-t border-[#c9a96a]/15 md:grid-cols-2">
          {SERVICES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="group flex items-start gap-6 border-b border-[#c9a96a]/15 p-8 transition hover:bg-[#1a0f1a] md:p-12 [&:nth-child(odd)]:md:border-r [&:nth-child(odd)]:md:border-r-[#c9a96a]/15"
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center border border-[#c9a96a]/50 text-[#e8c97c] transition group-hover:border-[#e8c97c]">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-[10px] uppercase tracking-[0.32em] text-[#c9a96a]">0{i + 1}</span>
                  <h3 className="font-display text-2xl md:text-3xl">{title}</h3>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#f3e9d2]/70">{body}</p>
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
    <section className="border-b border-[#c9a96a]/15 bg-[#1a0f1a]">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.36em] text-[#c9a96a]">New Arrivals</span>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">Newly <span className="italic text-[#e8c97c]">in</span>.</h2>
          </div>
          <Link to="/shop" className="text-[10px] uppercase tracking-[0.32em] text-[#e8c97c] hover:underline">
            All Products →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[#c9a96a]/15 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => (
            <article key={p.name} className="group relative bg-[#1a0f1a] p-5">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#241526]">
                <img src={p.img} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 bg-[#e8c97c] px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-[#1a0f1a]">
                  0{i + 1} / Vol 1
                </span>
                <button
                  aria-label="wishlist"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center border border-[#f3e9d2]/25 bg-[#1a0f1a]/70 text-[#f3e9d2] transition hover:border-[#e8c97c] hover:text-[#e8c97c]"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.32em] text-[#c9a96a]">{p.tag}</div>
                  <h3 className="mt-1.5 font-display text-lg leading-tight">{p.name}</h3>
                </div>
                <div className="font-display text-xl text-[#e8c97c]">{p.price}</div>
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
    <section className="border-b border-[#c9a96a]/15 bg-[#0f1a1f]">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-[0.36em] text-[#c9a96a]">From the Family</span>
          <h2 className="mt-3 font-display text-4xl md:text-6xl">
            Held with <span className="italic text-[#e8c97c]">love</span>.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-px bg-[#c9a96a]/15 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex flex-col justify-between bg-[#0f1a1f] p-8 md:p-10">
              <div>
                <div className="flex gap-0.5 text-[#e8c97c]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-xl leading-snug md:text-2xl">
                  “{r.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-8 border-t border-[#c9a96a]/20 pt-4 text-[10px] uppercase tracking-[0.32em] text-[#c9a96a]">
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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#3d1a2b] via-[#241526] to-[#1a0f1a] text-[#f3e9d2]">
      <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle_at_1px_1px,#e8c97c_1px,transparent_0)] [background-size:32px_32px]" />
      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <span className="text-[10px] uppercase tracking-[0.36em] text-[#c9a96a]">The List</span>
        <h2 className="mt-3 font-display text-4xl leading-[1.05] md:text-6xl lg:text-7xl">
          Join the
          <br />
          <span className="italic text-[#e8c97c]">breakthrough family.</span>
        </h2>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-[#f3e9d2]/75">
          First access to new arrivals, custom design windows, and quiet subscriber-only
          offers.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative mt-10 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#f3e9d2]/50" />
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="h-14 w-full border border-[#c9a96a]/40 bg-[#1a0f1a]/40 pl-11 pr-4 text-sm text-[#f3e9d2] placeholder:text-[#f3e9d2]/40 focus:border-[#e8c97c] focus:outline-none"
            />
          </div>
          <button className="h-14 bg-[#e8c97c] px-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#1a0f1a] transition hover:bg-[#f3e9d2]">
            Join the List →
          </button>
        </form>
      </div>
    </section>
  );
}