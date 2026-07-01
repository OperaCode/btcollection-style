import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Heart, SlidersHorizontal } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import { useProducts } from "@/lib/products";
import { resolveImages } from "@/lib/product-images";
import { useWishlist, useCart, useUI } from "@/lib/stores";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";

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

function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<"new" | "price-asc" | "price-desc" | "name">("new");
  const wish = useWishlist();
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const filtered = useMemo(() => {
    let list = category === "All" ? products : products.filter((p) => p.category === category);
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [products, category, sort]);

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
            {categories.map((f) => (
              <button
                key={f}
                onClick={() => setCategory(f)}
                className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.22em] transition ${
                  category === f
                    ? "border-ink bg-ink text-background"
                    : "border-border text-foreground/70 hover:border-gold hover:text-gold"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-full border border-border bg-background px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-foreground/70">
              <option value="new">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-sm bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {filtered.map((p) => {
              const img = resolveImages(p.images)[0];
              const isWished = wish.has(p.id);
              return (
                <article key={p.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                    <Link to="/product/$slug" params={{ slug: p.slug }}>
                      <img src={img} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    </Link>
                    <button
                      onClick={() => wish.toggle(p.id)}
                      aria-label="Add to wishlist"
                      className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink transition hover:bg-gold ${isWished ? "text-gold" : ""}`}
                    >
                      <Heart className={`h-4 w-4 ${isWished ? "fill-gold" : ""}`} />
                    </button>
                    <button
                      onClick={() => {
                        add({ productId: p.id, slug: p.slug, name: p.name, price: Number(p.price), image: img });
                        toast.success("Added to bag");
                        openCart();
                      }}
                      className="absolute inset-x-3 bottom-3 rounded-full bg-ink py-2 text-[10px] uppercase tracking-[0.22em] text-background opacity-0 transition group-hover:opacity-100"
                    >
                      Quick Add
                    </button>
                  </div>
                  <div className="mt-4 flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.category}</span>
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="font-display text-lg leading-tight text-ink hover:text-gold">{p.name}</Link>
                    <span className="text-sm font-medium text-ink">${Number(p.price).toFixed(2)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}