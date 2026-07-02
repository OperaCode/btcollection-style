import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, Star, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { Header, Footer, PageHeader } from "@/components/site/SiteChrome";
import { PRODUCTS, type Product } from "@/data/products";
import { useCart, formatUSD } from "@/lib/cart";

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
    ],
  }),
  component: ShopPage,
});

const FILTERS = ["All", "Faith Apparel", "Mugs", "Accessories", "Gift Sets"] as const;
const SORTS = ["Newest", "Price: Low → High", "Price: High → Low", "Popular"] as const;

function ShopPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const { add } = useCart();

  const list = useMemo(() => {
    const filtered =
      filter === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
    const sorted = [...filtered];
    if (sort === "Price: Low → High") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High → Low") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "Popular") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [filter, sort]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageHeader
        kicker="The Collection"
        title="Shop the"
        italic="Collection"
        blurb="Thoughtfully designed pieces, hand-finished and made to last — for the people you love most."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                  filter === f
                    ? "border-ink bg-ink text-background"
                    : "border-border text-foreground/70 hover:border-gold hover:text-gold"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70 hover:border-gold hover:text-gold"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" /> {sort}
            </button>
            {sortOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-sm border border-border bg-background shadow-lg">
                {SORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.2em] transition hover:bg-cream ${
                      s === sort ? "text-gold" : "text-foreground/75"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.slug} p={p} onAdd={() => add({ id: p.slug, name: p.name, price: p.price, img: p.img })} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No pieces match this filter yet.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ProductCard({ p, onAdd }: { p: Product; onAdd: () => void }) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <Link
          to="/product/$slug"
          params={{ slug: p.slug }}
          className="block h-full w-full"
        >
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        </Link>
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink transition hover:bg-gold"
        >
          <Heart className="h-4 w-4" />
        </button>
        <button
          onClick={onAdd}
          className="absolute inset-x-3 bottom-3 inline-flex translate-y-2 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-background opacity-0 transition duration-300 hover:bg-gold hover:text-ink group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.category}</span>
        <Link
          to="/product/$slug"
          params={{ slug: p.slug }}
          className="font-display text-lg leading-tight text-ink transition hover:text-gold"
        >
          {p.name}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">{formatUSD(p.price)}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" /> ({p.rating})
          </span>
        </div>
      </div>
    </article>
  );
}