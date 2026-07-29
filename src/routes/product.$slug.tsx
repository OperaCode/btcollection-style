import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  PackageCheck,
  Sparkles,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { getPublicProduct, listPublicProducts, PRODUCTS_QUERY_KEY, type Product } from "@/lib/catalog";
import { useCart, formatUSD } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { uploadCustomizationPhoto } from "@/lib/uploads";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getPublicProduct(params.slug).catch(() => null);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Breakthrough Collection LLC` },
          { name: "description", content: loaderData.product.description ?? "" },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description ?? "" },
          { property: "og:image", content: loaderData.product.images[0] },
        ]
      : [{ title: "Product not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-display text-4xl text-ink">Piece not found</h1>
        <p className="mt-4 text-sm text-foreground/70">
          The item you're looking for is no longer available.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
        >
          Back to Shop
        </Link>
      </div>
      <Footer />
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { add } = useCart();
  const wishlist = useWishlist();
  const [size, setSize] = useState(product.sizes?.[1] ?? product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);
  const [personalization, setPersonalization] = useState("");
  const [note, setNote] = useState("");
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const path = await uploadCustomizationPhoto(file);
      setPhotoPath(path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setPhotoPreview(null);
      setPhotoPath(null);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto() {
    setPhotoPath(null);
    setPhotoPreview(null);
    setUploadError(null);
  }
  const [openPanel, setOpenPanel] = useState("details");

  const allProducts = useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: listPublicProducts });
  const related = (allProducts.data ?? [])
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 text-[11px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
          <Link to="/" className="hover:text-gold">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-gold">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {product.images.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-sm border transition md:h-24 md:w-20 ${
                  i === active ? "border-gold" : "border-border hover:border-foreground/40"
                }`}
              >
                <img src={g} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="relative flex-1 overflow-hidden rounded-sm bg-muted">
            <img
              src={product.images[active]}
              alt={product.name}
              className="aspect-[4/5] w-full object-cover transition duration-500 hover:scale-105"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.28em] text-gold">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            {product.name}
          </h1>
          {product.best_seller && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink">
                Best Seller
              </span>
            </div>
          )}
          <div className="mt-4 flex items-center gap-4">
            <span className="font-display text-2xl text-ink">{formatUSD(product.price)}</span>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-foreground/80">{product.description}</p>

          {product.sizes && (
            <div className="mt-8">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.22em]">
                <span className="text-muted-foreground">Size</span>
                <span className="text-gold">{size}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-11 rounded-full border px-4 py-2 text-xs font-medium transition ${
                      size === s
                        ? "border-ink bg-ink text-background"
                        : "border-border text-foreground/75 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.customizable && (
            <div className="mt-8 rounded-sm border border-border bg-cream/50 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-gold">
                Personalization
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Name, phrase, logo text, or monogram
                  </span>
                  <input
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    placeholder="Example: Faith Over Fear"
                    className="h-11 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-gold"
                  />
                </label>

                <div className="grid gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Upload a photo (optional)
                  </span>
                  {photoPreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Upload preview"
                        className="h-16 w-16 rounded-sm border border-border object-cover"
                      />
                      {uploading ? (
                        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-sm border border-dashed border-border bg-background px-4 text-sm text-foreground/75 hover:border-gold hover:text-gold">
                      <ImagePlus className="h-4 w-4" /> Choose photo
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                  )}
                  {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                </div>

                <label className="grid gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Anything else?
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Colors, fonts, sizing, or anything else for this piece"
                    className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                </label>
              </div>
            </div>
          )}

          <div className="mt-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Quantity
            </div>
            <div className="mt-3 inline-flex items-center rounded-full border border-border">
              <button
                aria-label="Decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-foreground/70 hover:text-ink"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button
                aria-label="Increase"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-10 w-10 place-items-center text-foreground/70 hover:text-ink"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              disabled={uploading}
              onClick={() =>
                add(
                  {
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    img: product.images[0],
                    customization:
                      size || personalization || photoPath || note
                        ? {
                            size,
                            text: personalization || undefined,
                            photoPath: photoPath ?? undefined,
                            note: note || undefined,
                          }
                        : undefined,
                  },
                  qty,
                )
              }
              className="inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}{" "}
              Add to Bag · {formatUSD(product.price * qty)}
            </button>
            <button
              aria-label="Wishlist"
              onClick={() => wishlist.toggle(product.slug)}
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border text-foreground/70 hover:border-gold hover:text-gold"
            >
              <Heart
                className={`h-5 w-5 ${wishlist.has(product.slug) ? "fill-gold text-gold" : ""}`}
              />
            </button>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-4 border-t border-border pt-8 text-sm text-foreground/75 sm:grid-cols-3">
            <li className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-gold" /> Free US shipping $75+
            </li>
            <li className="flex items-center gap-3">
              <PackageCheck className="h-4 w-4 text-gold" /> Gift-ready packaging
            </li>
            <li className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-gold" /> Hand-finished with love
            </li>
          </ul>

          <div className="mt-8 divide-y divide-border border-y border-border">
            <ProductPanel
              id="details"
              title="Details"
              open={openPanel === "details"}
              onOpen={setOpenPanel}
            >
              {product.description}
            </ProductPanel>
            <ProductPanel
              id="shipping"
              title="Shipping & Packaging"
              open={openPanel === "shipping"}
              onOpen={setOpenPanel}
            >
              Orders ship gift-ready from our studio. Standard US shipping is free on orders over
              $75.
            </ProductPanel>
            <ProductPanel
              id="care"
              title="Care & Returns"
              open={openPanel === "care"}
              onOpen={setOpenPanel}
            >
              Apparel should be washed cold and inside out. Personalized items are final sale unless
              they arrive damaged.
            </ProductPanel>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-cream/60">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-gold">
                  You May Also Love
                </p>
                <h2 className="mt-2 font-display text-3xl text-ink md:text-4xl">
                  Pair it beautifully
                </h2>
              </div>
              <Link
                to="/shop"
                className="hidden text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold sm:block"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {related.map((p) => (
                <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-sm bg-muted">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-lg text-ink group-hover:text-gold">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink">{formatUSD(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

function ProductPanel({
  id,
  title,
  open,
  onOpen,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onOpen: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        onClick={() => onOpen(open ? "" : id)}
        className="flex w-full items-center justify-between py-4 text-left text-[11px] uppercase tracking-[0.22em] text-ink"
      >
        {title}
        <ChevronDown className={`h-4 w-4 text-gold transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm leading-relaxed text-foreground/75">{children}</p>}
    </div>
  );
}
