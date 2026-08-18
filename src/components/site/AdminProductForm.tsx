import { useState } from "react";
import { ArrowRight, ImagePlus, UploadCloud, X } from "lucide-react";
import { PRODUCT_CATEGORIES, type AdminProduct, uploadProductImage } from "@/lib/admin-data";

export type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  base_price: number;
  text_addon_price: number;
  image_addon_price: number;
  description: string;
  images: string[];
  customizable: boolean;
  featured: boolean;
  best_seller: boolean;
  in_stock: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AdminProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: AdminProduct;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [category, setCategory] = useState(initial?.category ?? PRODUCT_CATEGORIES[0]);
  const [basePrice, setBasePrice] = useState(initial ? String(initial.base_price) : "");
  const [textAddonPrice, setTextAddonPrice] = useState(
    initial ? String(initial.text_addon_price) : "0",
  );
  const [imageAddonPrice, setImageAddonPrice] = useState(
    initial ? String(initial.image_addon_price) : "0",
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [customizable, setCustomizable] = useState(initial?.customizable ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [bestSeller, setBestSeller] = useState(initial?.best_seller ?? false);
  const [inStock, setInStock] = useState(initial?.in_stock ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setError("");
    setUploadingImages(true);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const url = await uploadProductImage(file);
          return url;
        }),
      );
      setImages((current) => [...current, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
          await onSubmit({
            name,
            slug: slug || slugify(name),
            category,
            base_price: Number(basePrice) || 0,
            text_addon_price: Number(textAddonPrice) || 0,
            image_addon_price: Number(imageAddonPrice) || 0,
            description,
            images,
            customizable,
            featured,
            best_seller: bestSeller,
            in_stock: inStock,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
          setSubmitting(false);
        }
      }}
      className="mt-8 grid max-w-2xl gap-5 rounded-sm border border-border bg-card p-6 md:p-8"
    >
      <Field label="Product Name">
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className={inputCls}
        />
      </Field>

      <Field label="Slug (URL)">
        <input
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Base Price (USD)">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Personalization Text Add-on (USD)">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={textAddonPrice}
            onChange={(e) => setTextAddonPrice(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Photo Upload Add-on (USD)">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={imageAddonPrice}
            onChange={(e) => setImageAddonPrice(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Product Images">
        <div className="grid gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground transition hover:border-gold hover:text-gold">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <UploadCloud className="h-4 w-4" />
            <span>{uploadingImages ? "Uploading..." : "Upload product images"}</span>
          </label>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative overflow-hidden rounded-sm border border-border bg-background"
                >
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                    className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-white transition hover:bg-gold hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No product images uploaded yet.</p>
          )}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Checkbox label="Customizable" checked={customizable} onChange={setCustomizable} />
        <Checkbox label="Featured" checked={featured} onChange={setFeatured} />
        <Checkbox label="Best Seller" checked={bestSeller} onChange={setBestSeller} />
        <Checkbox label="In Stock" checked={inStock} onChange={setInStock} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex w-fit items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        {submitting ? "Saving..." : submitLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-foreground/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-gold"
      />
      {label}
    </label>
  );
}
