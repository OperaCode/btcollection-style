import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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
const PRICE_RANGES = ["All", "Under $30", "$30 - $60", "$60+"] as const;

function ShopPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [priceRange, setPriceRange] = useState<(typeof PRICE_RANGES)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { add } = useCart();
  const wishlist = useWishlist();
  const products = useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: listPublicProducts });

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (products.data ?? []).filter((p) => {
      const matchesCategory = filter === "All" || p.category === filter;
      const matchesPrice =
        priceRange === "All" ||
        (priceRange === "Under $30" && p.base_price < 30) ||
        (priceRange === "$30 - $60" && p.base_price >= 30 && p.base_price <= 60) ||
        (priceRange === "$60+" && p.base_price > 60);
      const matchesQuery =
        !q ||
        [p.name, p.category, p.description ?? "", ...(p.occasions ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return matchesCategory && matchesPrice && matchesQuery;
    });

    const sorted = [...filtered];
    if (sort === "Price: Low to High") sorted.sort((a, b) => a.base_price - b.base_price);
    else if (sort === "Price: High to Low") sorted.sort((a, b) => b.base_price - a.base_price);
    else if (sort === "Popular") sorted.sort((a, b) => Number(b.best_seller) - Number(a.best_seller));
    return sorted;
  }, [filter, priceRange, query, sort, products.data]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 md:px-8 md:pb-24 md:pt-14">
        <div className="mb-8 flex flex-col gap-6 border-b border-border pb-6 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink">
              Shop the Collection
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">All Products</h1>
          </div>

          <Link
            to="/inspiration"
            search={{ category: "" }}
            className="group inline-flex shrink-0 items-center gap-4 self-start rounded-lg border bg-gradient-to-br from-gold/10 via-gold/5 to-transparent px-5 py-4 transition duration-300 hover:border-gold hover:shadow-[0_8px_24px_-8px_rgba(180,140,60,0.35)] lg:self-auto

           
            "
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold transition duration-300 group-hover:bg-gold group-hover:text-ink">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-[10px] rounded-full border border-gold/45 bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-ink">
                VIEW CATALOGUE
              </span>
             
              <span className="mt-0.5 inline-flex items-center gap-1.5 font-display text-base text-ink">
                Browse the Our Works
                <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside
            className="self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-3"
          >
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="mb-4 flex w-full items-center justify-between rounded-sm border border-border px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-ink lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
              </span>
              <span className="text-muted-foreground sm:hidden">
                {list.length} {list.length === 1 ? "piece" : "pieces"}
              </span>
            </button>

            <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
              <div className="relative mb-7">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/70" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  className="h-11 w-full rounded-sm border border-ink/25 bg-card pl-9 pr-3 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink/60 focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>

              <div className="mb-7">
                <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Category
                </p>
                <ul className="space-y-0.5">
                  {FILTERS.map((f) => (
                    <li key={f}>
                      <button
                        type="button"
                        onClick={() => setFilter(f)}
                        className={`block w-full rounded-sm px-2 py-1.5 text-left text-sm transition ${
                          filter === f
                            ? "font-medium text-ink"
                            : "text-foreground/65 hover:text-ink"
                        }`}
                      >
                        {f === "All" ? "All Products" : f}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  Price
                </p>
                <ul className="space-y-0.5">
                  {PRICE_RANGES.map((r) => (
                    <li key={r}>
                      <button
                        type="button"
                        onClick={() => setPriceRange(r)}
                        className={`block w-full rounded-sm px-2 py-1.5 text-left text-sm transition ${
                          priceRange === r
                            ? "font-medium text-ink"
                            : "text-foreground/65 hover:text-ink"
                        }`}
                      >
                        {r}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {list.length} {list.length === 1 ? "piece" : "pieces"}
              </p>
              <Dropdown
                label={sort}
                icon={SlidersHorizontal}
                options={SORTS}
                value={sort}
                onChange={(v) => {
                  setSort(v);
                  setSortOpen(false);
                }}
                isOpen={sortOpen}
                onToggle={() => setSortOpen((o) => !o)}
              />
            </div>

            {products.isLoading ? (
              <ProductGridSkeleton />
            ) : list.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">
                No pieces match this filter yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4 xl:gap-x-8">
                {list.map((p) => (
                  <ProductCard
                    key={p.slug}
                    p={p}
                    wished={wishlist.has(p.slug)}
                    onWish={() => wishlist.toggle(p.slug)}
                    onAdd={() =>
                      add({ id: p.id, slug: p.slug, name: p.name, price: p.base_price, img: p.images[0] ?? "" })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Dropdown<T extends string>({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  isOpen,
  onToggle,
}: {
  label: string;
  icon: LucideIcon;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-background px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-ink shadow-sm hover:border-gold hover:text-gold"
      >
        <Icon className="h-3.5 w-3.5" /> {label}
      </button>
      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-sm border border-border bg-background shadow-lg">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`block w-full px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.2em] transition hover:bg-cream ${
                o === value ? "text-gold" : "text-foreground/75"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4 xl:gap-x-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-md bg-muted" />
          <div className="mt-5 h-2.5 w-1/3 rounded-full bg-muted" />
          <div className="mt-2 h-4 w-2/3 rounded-full bg-muted" />
          <div className="mt-2 h-3.5 w-1/4 rounded-full bg-muted" />
        </div>
      ))}
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted shadow-sm transition duration-300 group-hover:shadow-md">
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
      <div className="mt-5 flex flex-col gap-1.5">
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
        <span className="text-sm font-medium text-ink">
          {p.text_addon_price > 0 || p.image_addon_price > 0 ? "From " : ""}
          {formatUSD(p.base_price)}
        </span>
      </div>
    </article>
  );
}
