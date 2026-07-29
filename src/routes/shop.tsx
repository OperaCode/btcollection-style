import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Search, SlidersHorizontal, ShoppingBag, Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { listPublicProducts, PRODUCTS_QUERY_KEY, type Product } from "@/lib/catalog";
import { useCart, formatUSD } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop the Collection - Breakthrough Collection LLC" },
      {
        name: "description",
        content:
          "Browse faith-inspired apparel, personalized mugs,personalized tumblers, accessories, and curated gift sets from Breakthrough Collection LLC.",
      },
      { property: "og:title", content: "Shop the Collection - Breakthrough Collection LLC" },
      {
        property: "og:description",
        content: "Faith-inspired apparel, mugs,tumblers, accessories, and curated gift sets.",
      },
    ],
  }),
  component: ShopPage,
});

const FILTERS = ["All", ...CATEGORIES] as const;
const SORTS = ["Newest", "Price: Low to High", "Price: High to Low", "Popular"] as const;
const OCCASIONS = [
  "All",
  "Birthday",
  "Ministry",
  "Mother's Day",
  "Father's Day",
  "Wedding",
  "Anniversary",
  "Thank You",
  "Corporate",
] as const;
const PRICE_RANGES = ["All", "Under $30", "$30 - $60", "$60+"] as const;

function ShopPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [occasion, setOccasion] = useState<(typeof OCCASIONS)[number]>("All");
  const [priceRange, setPriceRange] = useState<(typeof PRICE_RANGES)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { add } = useCart();
  const wishlist = useWishlist();
  const products = useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: listPublicProducts });

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (products.data ?? []).filter((p) => {
      const matchesCategory = filter === "All" || p.category === filter;
      const matchesOccasion = occasion === "All" || p.occasions?.includes(occasion);
      const matchesPrice =
        priceRange === "All" ||
        (priceRange === "Under $30" && p.price < 30) ||
        (priceRange === "$30 - $60" && p.price >= 30 && p.price <= 60) ||
        (priceRange === "$60+" && p.price > 60);
      const matchesQuery =
        !q ||
        [p.name, p.category, p.description ?? "", ...(p.occasions ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesOccasion && matchesPrice && matchesQuery;
    });

    const sorted = [...filtered];
    if (sort === "Price: Low to High") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "Price: High to Low") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "Popular") sorted.sort((a, b) => Number(b.best_seller) - Number(a.best_seller));
    return sorted;
  }, [filter, occasion, priceRange, query, sort, products.data]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="mx-auto max-w-7xl px-4 pt-8 pb-20 md:px-8 md:pt-10 md:pb-24">
        <div className="mb-10 grid gap-5 rounded-sm border border-border bg-cream/70 p-4 shadow-sm md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by product, occasion, or gift type"
                className="h-12 w-full rounded-full border border-ink/15 bg-background pl-11 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-gold"
              />
            </div>

            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {list.length} {list.length === 1 ? "piece" : "pieces"}
              </p>
              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-background px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-ink shadow-sm hover:border-gold hover:text-gold"
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
          </div>

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-ink">Collection</div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] shadow-sm transition ${
                    filter === f
                      ? "border-ink bg-ink text-background"
                      : "border-ink/15 bg-background text-ink hover:border-gold hover:bg-gold/10 hover:text-ink"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <FilterGroup
              label="Occasion"
              values={OCCASIONS}
              value={occasion}
              onChange={setOccasion}
            />
            <FilterGroup
              label="Price"
              values={PRICE_RANGES}
              value={priceRange}
              onChange={setPriceRange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard
              key={p.slug}
              p={p}
              wished={wishlist.has(p.slug)}
              onWish={() => wishlist.toggle(p.slug)}
              onAdd={() => add({ id: p.id, slug: p.slug, name: p.name, price: p.price, img: p.images[0] ?? "" })}
            />
          ))}
        </div>

        {products.isLoading && (
          <p className="py-20 text-center text-sm text-muted-foreground">Loading the collection...</p>
        )}
        {!products.isLoading && list.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No pieces match this filter yet.
          </p>
        )}
      </section>

      <Footer />
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-ink">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] shadow-sm transition ${
              value === v
                ? "border-gold bg-gold text-ink"
                : "border-ink/15 bg-background text-ink hover:border-gold hover:bg-gold/10"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({
  p,
  onAdd,
  wished,
  onWish,
}: {
  p: Product;
  onAdd: () => void;
  wished: boolean;
  onWish: () => void;
}) {
  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block h-full w-full">
          <img
            src={p.images[0]}
            alt={p.name}
            loading="lazy"
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${
              p.in_stock ? "" : "opacity-50"
            }`}
          />
        </Link>
        {p.best_seller && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-ink">
            Best Seller
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          onClick={onWish}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink transition hover:bg-gold"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-gold text-gold" : ""}`} />
        </button>
        {p.in_stock ? (
          <button
            onClick={onAdd}
            className="absolute inset-x-3 bottom-3 inline-flex translate-y-2 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-background opacity-0 transition duration-300 hover:bg-gold hover:text-ink group-hover:translate-y-0 group-hover:opacity-100"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
          </button>
        ) : (
          <span className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center rounded-full bg-ink/80 px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.22em] text-background">
            Out of Stock
          </span>
        )}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {p.category}
          </span>
          {p.customizable && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-gold">
              <Sparkles className="h-2.5 w-2.5" /> Personalizable
            </span>
          )}
        </div>
        <Link
          to="/product/$slug"
          params={{ slug: p.slug }}
          className="font-display text-lg leading-tight text-ink transition hover:text-gold"
        >
          {p.name}
        </Link>
        <span className="text-sm font-medium text-ink">{formatUSD(p.price)}</span>
      </div>
    </article>
  );
}
