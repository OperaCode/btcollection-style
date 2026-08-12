import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
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
  Info,
  Shield,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { getPublicProduct, type Product } from "@/lib/catalog";
import { useCart, formatUSD } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { uploadCustomizationPhoto } from "@/lib/uploads";

const CATEGORY_COPY: Record<string, { materials: string; care: string; processing: string }> = {
  "Faith Apparel": {
    materials: "Premium cotton-blend fabric with a soft, durable print or embroidered finish.",
    care: "Machine wash cold, inside out, with like colors. Tumble dry low and avoid ironing directly over any design.",
    processing: "Personalized apparel ships in 5–7 business days.",
  },
  "Mugs & Tumblers": {
    materials:
      "Durable ceramic or double-wall insulated stainless steel with a glossy, fade-resistant print.",
    care: "Ceramic mugs are dishwasher and microwave safe. Insulated tumblers should be hand washed.",
    processing: "Custom drinkware ships in 3–5 business days.",
  },
  Accessories: {
    materials: "Quality hardware and finishes, hand-inspected before packing.",
    care: "Wipe clean with a soft, dry cloth and keep away from moisture.",
    processing: "Ships in 3–5 business days.",
  },
  "Gift Sets": {
    materials: "Curated pieces packed together in gift-ready presentation.",
    care: "Follow the care instructions for each individual piece included in the set.",
    processing: "Gift sets ship in 5–7 business days.",
  },
};

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
  const [occasion, setOccasion] = useState("");
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
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setUploadError(
        message.includes("Bucket not found") || message.includes("not found")
          ? "Photo upload is temporarily unavailable. Please try again later or continue without a photo."
          : message,
      );
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
  const [openPanel, setOpenPanel] = useState(product.customizable ? "guidelines" : "shipping");

  const textAddonApplies = product.text_addon_price > 0 && personalization.trim().length > 0;
  const imageAddonApplies = product.image_addon_price > 0 && Boolean(photoPath);
  const unitPrice =
    product.base_price +
    (textAddonApplies ? product.text_addon_price : 0) +
    (imageAddonApplies ? product.image_addon_price : 0);

  const thumbs = product.images;
  const activeThumb = thumbs[active] ?? thumbs[0];
  const isDrinkware =
    product.category === "Mugs & Tumblers" || product.category === "Engraved Drinkware";
  const inspirationCategory = isDrinkware ? "Mugs & Tumblers" : "";
  const copy = CATEGORY_COPY[product.category] ?? CATEGORY_COPY.Accessories;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground md:px-8">
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

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-8 md:grid-cols-2 md:px-8 md:py-10">
        <div className="md:sticky md:top-24 md:max-w-[460px] md:self-start">
          {thumbs.length > 1 && (
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Tap a photo to preview
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 md:flex-row">
            <div className="flex gap-3 overflow-x-auto pb-1 md:max-h-[440px] md:flex-col md:overflow-y-auto md:overflow-x-visible md:pb-0 md:pr-1">
              {thumbs.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative h-14 w-12 shrink-0 overflow-hidden rounded-sm border-2 transition md:h-16 md:w-14 ${
                    i === active ? "border-gold" : "border-border hover:border-ink/40"
                  }`}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-sm border border-border bg-cream shadow-sm">
              <img
                src={activeThumb ?? product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
              />
            </div>
          </div>
          <Link
            to="/inspiration"
            search={{ category: inspirationCategory }}
            className="group mt-4 flex items-center justify-between gap-3 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-ink transition hover:border-gold hover:bg-gold/20"
          >
            <span className="flex items-center gap-2.5">
              <ImagePlus className="h-4 w-4 text-gold" />
              <span className="text-[11px] font-medium uppercase tracking-[0.2em]">
                See more inspiration
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
            {product.category}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            {product.name}
          </h1>
          {product.best_seller && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink shadow-sm">
                Best Seller
              </span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-baseline rounded-full bg-cream px-4 py-1.5 font-display text-2xl text-ink">
              {formatUSD(unitPrice)}
            </span>
            {(textAddonApplies || imageAddonApplies) && (
              <p className="text-xs text-muted-foreground">
                {formatUSD(product.base_price)} base
                {textAddonApplies && <> + {formatUSD(product.text_addon_price)} personalization</>}
                {imageAddonApplies && <> + {formatUSD(product.image_addon_price)} photo</>}
              </p>
            )}
          </div>
          <div className="mt-5 max-h-28 overflow-y-auto pr-2 text-sm leading-snug text-foreground/80">
            {product.description}
          </div>

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
            <div className="mt-8 rounded-md border-2 border-gold/50 bg-cream p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Personalize This Piece
              </div>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                    Name, phrase, logo text, or monogram
                    {product.text_addon_price > 0 && (
                      <span className="font-semibold text-gold">
                        +{formatUSD(product.text_addon_price)}
                      </span>
                    )}
                  </span>
                  <input
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    placeholder="Example: Faith Over Fear"
                    className="h-11 rounded-sm border border-ink/20 bg-background px-3 text-sm shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                    Occasion (optional)
                  </span>
                  <input
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="Birthday, wedding, ministry..."
                    className="h-11 rounded-sm border border-ink/20 bg-background px-3 text-sm shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                  />
                </label>

                <div className="grid gap-2">
                  <span className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                    Upload a photo (optional)
                    {product.image_addon_price > 0 && (
                      <span className="font-semibold text-gold">
                        +{formatUSD(product.image_addon_price)}
                      </span>
                    )}
                  </span>
                  {photoPreview ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Upload preview"
                        className="h-16 w-16 rounded-sm border border-ink/20 object-cover"
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
                    <label className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-sm border border-dashed border-ink/30 bg-background px-4 text-sm text-foreground/75 shadow-sm hover:border-gold hover:text-gold">
                      <ImagePlus className="h-4 w-4" /> Choose photo
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/heic"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                  {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
                  <p className="text-[11px] leading-snug text-muted-foreground">
                    Use a clear, high-resolution photo — blurry, low-res, or watermarked images can
                    delay your order.
                  </p>
                </div>

                <label className="grid gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/70">
                    Anything else?
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Colors, fonts, sizing, or anything else for this piece"
                    className="rounded-sm border border-ink/20 bg-background px-3 py-2 text-sm shadow-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
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
                    price: unitPrice,
                    img: product.images[0],
                    customization:
                      size || personalization || photoPath || note || occasion
                        ? {
                            size,
                            text: personalization || undefined,
                            photoPath: photoPath ?? undefined,
                            note: note || undefined,
                            occasion: occasion || undefined,
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
              Add to Bag · {formatUSD(unitPrice * qty)}
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

          <ul className="mt-10 grid grid-cols-1 divide-y divide-ink/10 rounded-sm border border-ink/10 bg-cream/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <li className="flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                <Truck className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-ink/80">Free US shipping $75+</span>
            </li>
            <li className="flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                <PackageCheck className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-ink/80">Gift-ready packaging</span>
            </li>
            <li className="flex items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/20 text-gold">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium text-ink/80">Hand-finished with love</span>
            </li>
          </ul>

          <div className="mt-8 divide-y divide-border border-y border-border">
            {product.customizable && (
              <ProductPanel
                id="guidelines"
                title="Personalization Guidelines"
                icon={Info}
                open={openPanel === "guidelines"}
                onOpen={setOpenPanel}
              >
                Use a clear, high-resolution photo for the best print quality — blurry,
                low-resolution, or watermarked images may delay your order or require a revision.
                Double-check names and spelling before checkout, as personalized items are final
                sale.
              </ProductPanel>
            )}
            <ProductPanel
              id="shipping"
              title="Shipping & Packaging"
              icon={Truck}
              open={openPanel === "shipping"}
              onOpen={setOpenPanel}
            >
              Orders ship gift-ready from our studio. {copy.processing} Standard US shipping is free
              on orders over $75.
            </ProductPanel>
            <ProductPanel
              id="care"
              title="Materials & Care"
              icon={Shield}
              open={openPanel === "care"}
              onOpen={setOpenPanel}
            >
              {copy.materials} {copy.care} Personalized items are final sale unless they arrive
              damaged.
            </ProductPanel>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ProductPanel({
  id,
  title,
  icon: Icon,
  open,
  onOpen,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  open: boolean;
  onOpen: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div className={open ? "bg-cream/40" : ""}>
      <button
        onClick={() => onOpen(open ? "" : id)}
        className="flex w-full items-center justify-between gap-3 px-1 py-4 text-left text-[11px] uppercase tracking-[0.22em] text-ink"
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-gold" /> {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gold transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="px-1 pb-5 text-sm leading-snug text-foreground/75">{children}</p>}
    </div>
  );
}
