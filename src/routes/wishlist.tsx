import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import { useProducts } from "@/lib/products";
import { useWishlist } from "@/lib/stores";
import { resolveImages } from "@/lib/product-images";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — BT Collection LLC" }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const { data: products = [] } = useProducts();
  const wish = useWishlist();
  const items = products.filter((p) => wish.ids.includes(p.id));
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <PageHero kicker="Saved" title="Your" italic="Wishlist" image={heroImg} />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {items.length === 0 ? (
          <div className="rounded-md border border-border p-12 text-center">
            <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-display text-2xl text-ink">No saved items yet</p>
            <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background">Discover the Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {items.map((p) => {
              const img = resolveImages(p.images)[0];
              return (
                <article key={p.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                    <Link to="/product/$slug" params={{ slug: p.slug }}>
                      <img src={img} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                    </Link>
                    <button onClick={() => wish.toggle(p.id)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-ink hover:bg-gold"><X className="h-4 w-4" /></button>
                  </div>
                  <h3 className="mt-3 font-display text-lg text-ink">{p.name}</h3>
                  <p className="text-sm text-ink">${Number(p.price).toFixed(2)}</p>
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