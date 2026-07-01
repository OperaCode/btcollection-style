import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";
import { useProduct } from "@/lib/products";
import { resolveImages } from "@/lib/product-images";
import { useCart, useWishlist, useUI } from "@/lib/stores";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — BT Collection LLC` },
      { name: "description", content: "Personalized, faith-inspired gifts from BT Collection LLC." },
    ],
  }),
  component: ProductPage,
  errorComponent: ({ error }) => <div className="p-10 text-center">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Product not found.</div>,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product, isLoading } = useProduct(slug);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [customName, setCustomName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const add = useCart((s) => s.add);
  const openCart = useUI((s) => s.openCart);
  const wish = useWishlist();

  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!product) throw notFound();
  const images = resolveImages(product.images);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> Back to Shop
        </Link>
      </div>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 md:grid-cols-2 md:px-8">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted">
            <img src={images[imgIdx]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`h-20 w-16 overflow-hidden rounded-sm border-2 ${i === imgIdx ? "border-gold" : "border-transparent"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{product.category}</span>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-2xl font-medium text-ink">${Number(product.price).toFixed(2)}</p>
          <p className="mt-6 leading-relaxed text-foreground/75">{product.description}</p>

          {product.customizable && (
            <div className="mt-8 rounded-md border border-gold/30 bg-cream/40 p-5">
              <div className="text-[10px] uppercase tracking-[0.25em] text-gold">Personalize</div>
              <div className="mt-4 space-y-3">
                <input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Name or monogram" className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
                <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Gift message (optional)" rows={2} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-full border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center"><Minus className="h-4 w-4" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => {
                add({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: Number(product.price),
                  image: images[0],
                  quantity: qty,
                  customization: customName || giftMessage ? { name: customName, giftMessage } : undefined,
                });
                toast.success("Added to bag");
                openCart();
              }}
              className="flex-1 rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-ink/90"
            >
              Add to Bag
            </button>
            <button onClick={() => wish.toggle(product.id)} className={`grid h-12 w-12 place-items-center rounded-full border ${wish.has(product.id) ? "border-gold bg-gold/10 text-gold" : "border-border text-foreground/70 hover:border-gold hover:text-gold"}`}>
              <Heart className={`h-5 w-5 ${wish.has(product.id) ? "fill-gold" : ""}`} />
            </button>
          </div>

          <div className="mt-10 space-y-3 border-t border-border pt-6 text-sm text-foreground/70">
            <p><span className="font-medium text-ink">Shipping:</span> Standard 3–5 business days. Free over $75.</p>
            <p><span className="font-medium text-ink">Returns:</span> 30-day returns on non-personalized items.</p>
            <p><span className="font-medium text-ink">Made with love:</span> Hand-finished in the United States.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}