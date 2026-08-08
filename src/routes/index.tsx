import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Heart,
  ArrowRight,
  Gift,
  Sparkles,
  Shirt,
  Coffee,
  Star,
  Mail,
  Truck,
  PackageCheck,
  HandHeart,
  Instagram,
  ChevronDown,
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
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";
import { subscribeNewsletter } from "@/lib/commerce";
import { SOCIAL_LINKS } from "@/lib/site-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breakthrough Collection LLC — Faith-Inspired Personalized Gifts" },
      {
        name: "description",
        content:
          "Faith-inspired, personalized apparel, mugs, accessories, and curated gift sets. Every stitch tells a story — thoughtfully made with love.",
      },
      { property: "og:title", content: "Breakthrough Collection LLC — Every Stitch Tells a Story" },
      {
        property: "og:description",
        content: "Faith-inspired personalized apparel and curated gift sets.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: Index,
});

const MARQUEE = [
  "Inspired by Faith",
  "Made with Love",
  "Premium Personalization",
  "Curated Gift Sets",
  "Custom Mugs & Totes",
  "Embroidered Apparel",
  "Bulk Order Discounts",
  "Fast US Shipping",
  "5-Star Reviews",
  "Gift-Ready Packaging",
];

const CATEGORIES = [
  {
    name: "Breakthrough Faith",
    blurb: "Apparel rooted in scripture & purpose",
    img: catFaith,
  },
  {
    name: "Personalized Mugs",
    blurb: "Custom 15oz coffee cups & drinkware",
    img: catMugs,
  },
  {
    name: "Accessories",
    blurb: "Totes, hats & everyday carry",
    img: catAccessories,
  },
  {
    name: "Curated Gift Sets",
    blurb: "Beautifully boxed for any occasion",
    img: catGifts,
  },
];

const PRODUCTS = [
  { name: "Faith Over Fear Sweatshirt", price: "$48.00", tag: "Faith", img: p1, rating: 32 },
  { name: "Blessed Mom 15oz Mug", price: "$22.00", tag: "Mugs", img: p2, rating: 47 },
  { name: "Grateful Canvas Tote", price: "$28.00", tag: "Accessories", img: p3, rating: 19 },
  { name: "Signature Navy Gift Box", price: "$85.00", tag: "Gift Sets", img: p4, rating: 12 },
];

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <Hero />
      <Marquee />
      <Categories />
      <Services />
      <NewArrivals />
      {/* <About /> */}
      <CustomCTA />
      <Testimonials />
      <FollowAlong />
      <FAQ />
      <Newsletter />
      <Footer />
    </div>
  );
}

/* ──────────────────────────── Sections ──────────────────────────── */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden h-screen">
      <img
        src={heroImg}
        alt="Faith-inspired sweatshirt, ceramic mug, open bible and canvas tote arranged on a warm linen surface"
        width={1920}
        height={1280}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/75 via-ink/55 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-36 lg:py-28">
        <div className="max-w-xl text-background">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-gold">
            Faith · Family · Personalization
          </p>
          <h1 className="font-display text-5xl leading-[0.95] md:text-7xl">
            Every Stitch
            <br />
            Tells a <span className="italic text-gold-soft">Story</span>
          </h1>
          <p className="mt-6 max-w-md text-base/relaxed text-background/85">
            Faith-inspired apparel, personalized mugs, and beautifully curated gift sets —
            thoughtfully made with love by Breakthrough Collection LLC.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-background px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-ink transition hover:bg-gold"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
            <a
              href="/custom"
              className="inline-flex items-center gap-3 rounded-full border border-background/40 px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:border-gold hover:text-gold"
            >
              <Gift className="h-4 w-4" />
              Design Your Own
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="overflow-hidden border-y border-border bg-cream pt-6">
      <div className="animate-marquee flex w-max gap-12 py-5 text-[12px] uppercase tracking-[0.28em] text-ink/80">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            <span>{t}</span>
            <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <span className="text-[11px] uppercase tracking-[0.32em] text-gold">{kicker}</span>
      <h2 className="mt-3 font-display text-4xl md:text-5xl">{title}</h2>
      <span className="mt-5 inline-block h-px w-12 bg-gold" />
    </div>
  );
}

function Categories() {
  return (
    <section id="shop" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionLabel kicker="Browse" title="Shop by Collection" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => (
          <a
            key={c.name}
            href="/shop"
            className="group relative block overflow-hidden rounded-sm border border-border bg-card"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={c.img}
                alt={c.name}
                width={800}
                height={1000}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent p-5 text-background">
              <div className="font-display text-2xl">{c.name}</div>
              <div className="mt-1 text-xs text-background/80">{c.blurb}</div>
              <div className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold-soft">
                Shop now <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

const SERVICES = [
  {
    icon: Shirt,
    title: "Faith-Inspired Apparel",
    body: "Sweatshirts, tees, and hoodies thoughtfully designed with scripture and uplifting messages.",
    cta: "Shop Faith",
  },
  {
    icon: Coffee,
    title: "Personalized Mugs",
    body: "Premium 15oz coffee mugs printed with your name, photo, or custom message — built to last.",
    cta: "Design a Mug",
  },
  {
    icon: Sparkles,
    title: "Custom Designs",
    body: "Send us your idea — birthdays, weddings, ministry, small business — and we’ll bring it to life.",
    cta: "Start a Custom",
  },
  {
    icon: Gift,
    title: "Curated Gift Sets",
    body: "Beautifully boxed sets for mothers, mentors, milestones, and corporate gifting moments.",
    cta: "Explore Sets",
  },
];

function Services() {
  return (
    <section id="services" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <div className="mb-14 flex flex-col items-center text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">What We Make</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Our Craft</h2>
          <span className="mt-5 inline-block h-px w-12 bg-gold" />
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map(({ icon: Icon, title, body, cta }) => (
            <div
              key={title}
              className="group flex flex-col bg-primary p-8 transition hover:bg-primary/80"
            >
              <Icon className="h-7 w-7 text-gold" />
              <h3 className="mt-6 font-display text-2xl text-primary-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary-foreground/75">{body}</p>
              <a
                href="#shop"
                className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-gold transition hover:gap-3"
              >
                {cta} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewArrivals() {
  return (
    <section id="new" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Just In</span>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">New Arrivals</h2>
        </div>
        <a
          href="#shop"
          className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold sm:inline-flex"
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {PRODUCTS.map((p) => (
          <article key={p.name} className="group">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
              <img
                src={p.img}
                alt={p.name}
                width={800}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink">
                New
              </span>
              <button
                aria-label="Add to wishlist"
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink transition hover:bg-gold"
              >
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {p.tag}
              </span>
              <h3 className="font-display text-lg leading-tight text-ink">{p.name}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{p.price}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" /> ({p.rating})
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// function About() {
//   return (
//     <section id="about" className="bg-cream">
//       <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
//         <div className="relative">
//           <img
//             src={catFaith}
//             alt="Cream Faith sweatshirt folded in warm sunlight"
//             width={800}
//             height={1000}
//             loading="lazy"
//             className="aspect-[4/5] w-full rounded-sm object-cover"
//           />
//           <div className="absolute -bottom-6 -right-6 hidden h-40 w-40 rounded-sm border border-gold bg-background p-6 shadow-sm md:block">
//             <div className="font-display text-3xl italic text-gold">5★</div>
//             <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
//               Loved by hundreds of customers
//             </div>
//           </div>
//         </div>

//         <div>
//           <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Our Story</span>
//           <h2 className="mt-3 font-display text-4xl md:text-5xl">
//             Inspired by <span className="italic">faith</span>,<br />
//             made with <span className="italic">love</span>.
//           </h2>
//           <p className="mt-6 text-base leading-relaxed text-foreground/80">
//             Breakthrough Collection LLC began as a labor of love — a small studio creating heartfelt,
//             faith-rooted pieces for the people we love most. Today, every sweatshirt, mug, and
//             gift box we ship still passes through caring hands and a prayerful heart.
//           </p>
//           <p className="mt-4 text-base leading-relaxed text-foreground/80">
//             We believe a gift should feel personal — that it should carry meaning long after
//             the wrapping is gone. That’s why every detail, from our hand-finished embroidery
//             to our gold-ribboned packaging, is made with intention.
//           </p>

//           <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-6">
//             <Stat value="500+" label="Happy Gifts Sent" />
//             <Stat value="100%" label="Made With Love" />
//             <Stat value="48h" label="Design Turnaround" />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

function CustomCTA() {
  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-background">
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-cream/70" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-[1fr_1.05fr] md:px-8 md:py-20">
        <div className="max-w-xl">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Design Your Own</span>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">
            Make it <span className="italic">yours</span>.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/75 md:text-base">
            Names, scripture, photos, or a message that matters — choose any personalizable piece
            and add your name, photo, or message right on the product page.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {["Names", "Scripture", "Photos", "Gift Notes"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-ink"
              >
                {item}
              </span>
            ))}
          </div>
          <a
            href="/custom"
            className="group mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink"
          >
            Request a Custom Quote
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-sm border border-border bg-cream p-4">
          <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-4">
            <img
              src={catMugs}
              alt="Personalized mug gift inspiration"
              loading="lazy"
              className="h-72 w-full rounded-sm object-cover"
            />
            <div className="grid gap-4">
              <img
                src={catGifts}
                alt="Curated custom gift set"
                loading="lazy"
                className="h-32 w-full rounded-sm object-cover"
              />
              <img
                src={p3}
                alt="Custom tote inspiration"
                loading="lazy"
                className="h-36 w-full rounded-sm object-cover"
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-ink/88 py-3 text-background">
            <div className="animate-marquee flex w-max gap-8 text-[10px] uppercase tracking-[0.24em]">
              {[
                "Personalized Gift Sets",
                "Engravery Gift Sets",
                "Prints on Mugs and Tumblers",
                "Leather Cushion",
                "Personalised Pillow",
                "Name on Items",
                "Gift-ready packaging",
                "Bulk orders welcome",
                "Custom names & messages",
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-8">
                  <span>{item}</span>
                  <span className="text-gold">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-ink">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

const REVIEWS = [
  {
    quote:
      "The “Blessed Mom” mug arrived in the most beautiful packaging — my mother cried. Quality is unreal.",
    name: "Amara J.",
    role: "Verified buyer",
  },
  {
    quote:
      "Ordered custom sweatshirts for our women’s ministry. Stitching is gorgeous and shipping was so fast.",
    name: "Pastor Renee K.",
    role: "Ministry order",
  },
  {
    quote:
      "Breakthrough Collection’s gift sets are my go-to for client gifting. They feel high-end without being cold.",
    name: "Daniella O.",
    role: "Corporate gifting",
  },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <SectionLabel kicker="Kind Words" title="Loved by Our Community" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure
            key={r.name}
            className="flex h-full flex-col justify-between rounded-sm border border-border bg-card p-8"
          >
            <div>
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-5 font-display text-xl leading-snug text-ink">
                “{r.quote}”
              </blockquote>
            </div>
            <figcaption className="mt-8 border-t border-border pt-4">
              <div className="font-medium text-ink">{r.name}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {r.role}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4">
        <Pill icon={Truck} label="Fast US Shipping" />
        <Pill icon={HandHeart} label="Made With Love" />
        <Pill icon={PackageCheck} label="Gift-Ready Packaging" />
        <Pill icon={Sparkles} label="48-Hour Custom Designs" />
      </div>
    </section>
  );
}

function Pill({ icon: Icon, label }: { icon: typeof Truck; label: string }) {
  return (
    <div className="flex items-center gap-3 text-foreground/85">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[12px] uppercase tracking-[0.22em]">{label}</span>
    </div>
  );
}

const FOLLOW_IMAGES = [p1, catMugs, p3, catGifts, p2, catAccessories];

function FollowAlong() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-24">
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">
            @BTCollectionLLC
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Follow the Journey</h2>
          <p className="mt-4 max-w-lg text-sm text-foreground/75">
            See our latest designs, behind-the-scenes, and real gifts unboxed by our community.
          </p>
          <a
            href={SOCIAL_LINKS.instagram || "https://instagram.com"}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-ink hover:text-gold"
          >
            <Instagram className="h-4 w-4" /> Open Instagram
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {FOLLOW_IMAGES.map((img, i) => (
            <a
              key={i}
              href={SOCIAL_LINKS.instagram || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-sm bg-muted"
            >
              <img
                src={img}
                alt="Breakthrough Collection LLC on Instagram"
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition group-hover:bg-ink/30">
                <Instagram className="h-5 w-5 text-background opacity-0 transition group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "How long does personalization take?",
    a: "Most custom and personalized pieces are proofed within 48 hours and ship within 3–5 business days after approval.",
  },
  {
    q: "Do you ship across the US?",
    a: "Yes — we ship nationwide from our studio, with free shipping on orders over $75.",
  },
  {
    q: "Can I return a personalized item?",
    a: "Personalized and custom items are final sale, but if anything arrives damaged or incorrect, we’ll make it right.",
  },
  {
    q: "Do you offer bulk or ministry/corporate pricing?",
    a: "Yes — orders of 12+ pieces qualify for bulk pricing. Reach out through our Custom Orders page for a quote.",
  },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 md:px-8 md:py-28">
      <SectionLabel kicker="Good to Know" title="Frequently Asked Questions" />
      <div className="divide-y divide-border border-y border-border">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-lg text-ink md:text-xl">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gold transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <p className="pb-5 text-sm leading-relaxed text-foreground/75">{item.a}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Newsletter() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const result = await subscribeNewsletter({ email, fullName, source: "homepage" });
    setStatus("idle");

    if (result.ok) {
      setFullName("");
      setEmail("");
      toast.success(
        result.alreadySubscribed
          ? "You are already on the newsletter list."
          : result.emailWarning
          ? `You are subscribed. ${result.emailWarning}`
          : "You are subscribed. Please check your inbox for a welcome email.",
      );
      return;
    }

    toast.error(
      "Your signup was saved on this device, but it could not reach Supabase yet. Please try again in a moment.",
    );
  }

  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-24">
        <span className="text-[11px] uppercase tracking-[0.32em] text-gold">Stay Connected</span>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">
          Join the <span className="italic text-gold-soft">Breakthrough</span> family
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-primary-foreground/80">
          Get first access to new collections, custom design drops, and exclusive subscriber-only
          offers — straight to your inbox.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <input
            type="text"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your name"
            className="h-12 w-full rounded-full border border-white/20 bg-white/5 px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:outline-none"
          />
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/60" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="h-12 w-full rounded-full border border-white/20 bg-white/5 pl-11 pr-4 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:border-gold focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 rounded-full bg-gold px-6 text-[12px] font-medium uppercase tracking-[0.22em] text-ink transition hover:bg-gold-soft"
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </button>
        </form>

        <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/55">
          No spam · Unsubscribe anytime
        </p>
      </div>
    </section>
  );
}
