import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HandHeart, Sparkles, PackageCheck, Truck } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import heroImg from "@/assets/hero.jpg";
import catFaith from "@/assets/cat-faith.jpg";
import catGifts from "@/assets/cat-gifts.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BT Collection LLC — Inspired by Faith, Made with Love" },
      {
        name: "description",
        content:
          "BT Collection LLC is a faith-rooted gifting studio crafting personalized apparel, mugs, and curated gift sets with intention and love.",
      },
      { property: "og:title", content: "About BT Collection LLC" },
      { property: "og:description", content: "Inspired by faith. Made with love." },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: HandHeart, title: "Made With Love", body: "Every piece passes through caring hands and a prayerful heart before it reaches your door." },
  { icon: Sparkles, title: "Thoughtful Design", body: "We design for meaning — pieces that feel personal long after the wrapping is gone." },
  { icon: PackageCheck, title: "Gift-Ready Always", body: "Hand-finished embroidery, signature navy boxes, and gold-ribbon detailing on every order." },
  { icon: Truck, title: "Crafted in the USA", body: "Small-batch production from our family studio, shipped quickly from coast to coast." },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <PageHero
        kicker="Our Story"
        title="Inspired by Faith,"
        italic="made with love."
        blurb="A small studio with a big heart — creating heartfelt, faith-rooted pieces for the people you love most."
        image={heroImg}
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div className="relative">
          <img
            src={catFaith}
            alt="A cream sweatshirt folded carefully in warm afternoon light"
            loading="lazy"
            className="aspect-[4/5] w-full rounded-sm object-cover"
          />
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">How It Started</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">A labor of love, stitch by stitch.</h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            BT Collection LLC began at a kitchen table — a single embroidery machine, a stack of
            cream sweatshirts, and a heart full of scripture. What started as personal gifts for
            family and friends quickly grew into something much bigger: a community of women,
            mothers, and ministry leaders looking for pieces that felt like them.
          </p>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            Today, we’re still that same small studio — just with more hands, more love, and a
            growing Breakthrough family across the country.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink"
          >
            Shop the Collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <div className="mb-14 flex flex-col items-center text-center">
            <span className="text-[11px] uppercase tracking-[0.32em] text-gold">What We Stand For</span>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Our Values</h2>
            <span className="mt-5 inline-block h-px w-12 bg-gold" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-sm border border-border bg-background p-8">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-2xl text-ink">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/75">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">The Mission</span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">More than a gift — a reminder.</h2>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            Every mug, every sweatshirt, every gift box we ship is meant to remind someone they
            are seen, loved, and held. Whether it’s a milestone, a hard season, or simply a
            Tuesday — our pieces are made to carry meaning.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <div><div className="font-display text-3xl text-ink">500+</div><div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Gifts Sent</div></div>
            <div><div className="font-display text-3xl text-ink">100%</div><div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Hand-Finished</div></div>
            <div><div className="font-display text-3xl text-ink">48h</div><div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Custom Turnaround</div></div>
          </div>
        </div>
        <img src={catGifts} alt="A navy gift box tied with a gold ribbon" loading="lazy" className="aspect-[4/5] w-full rounded-sm object-cover" />
      </section>

      <Footer />
    </div>
  );
}