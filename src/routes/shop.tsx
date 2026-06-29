import { createFileRoute } from "@tanstack/react-router";
import { Heart, Star, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import heroImg from "@/assets/hero.jpg";
import catFaith from "@/assets/cat-faith.jpg";
import catMugs from "@/assets/cat-mugs.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop the Collection — BT Collection LLC" },
      {
        name: "description",
        content:
          "Browse faith-inspired apparel, personalized mugs, accessories, and curated gift sets from BT Collection LLC.",
      },
      { property: "og:title", content: "Shop the Collection — BT Collection LLC" },
      {
        property: "og:description",
        content: "Faith-inspired apparel, mugs, accessories, and curated gift sets.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: ShopPage,
});

const FILTERS = ["All", "Faith Apparel", "Mugs", "Accessories", "Gift Sets"];

const PRODUCTS = [
  { name: "Faith Over Fear Sweatshirt", price: "$48.00", tag: "Faith Apparel", img: p1, rating: 32 },
  { name: "Blessed Mom 15oz Mug", price: "$22.00", tag: "Mugs", img: p2, rating: 47 },
  { name: "Grateful Canvas Tote", price: "$28.00", tag: "Accessories", img: p3, rating: 19 },
  { name: "Signature Navy Gift Box", price: "$85.00", tag: "Gift Sets", img: p4, rating: 12 },
  { name: "Walk by Faith Hoodie", price: "$54.00", tag: "Faith Apparel", img: catFaith, rating: 24 },
  { name: "Custom Name Coffee Mug", price: "$24.00", tag: "Mugs", img: catMugs, rating: 38 },
  { name: "Embroidered Day Tote", price: "$32.00", tag: "Accessories", img: catAccessories, rating: 16 },
  { name: "Mother's Day Curated Box", price: "$95.00", tag: "Gift Sets", img: catGifts, rating: 21 },
];

function ShopPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <PageHero
        kicker="The Collection"
        title="Shop the"
        italic="Collection"
        blurb="Thoughtfully designed pieces, hand-finished and made to last — for the people you love most."
        image={heroImg}
      />

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f, i) => (
              <button
                key={f}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                  i === 0
                    ? "border-ink bg-ink text-background"
                    : "border-border text-foreground/70 hover:border-gold hover:text-gold"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:border-gold hover:text-gold">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Sort
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <article key={p.name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <button
                  aria-label="Add to wishlist"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink transition hover:bg-gold"
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.tag}</span>
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

        <div className="mt-16 flex justify-center">
          <button className="group inline-flex items-center gap-3 rounded-full border border-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-ink transition hover:bg-ink hover:text-background">
            Load More
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}