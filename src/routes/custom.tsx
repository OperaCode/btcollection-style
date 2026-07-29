import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock,
  ImagePlus,
  Loader2,
  PackageCheck,
  Sparkles,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { Header, Footer, PageBanner } from "@/components/site/SiteChrome";
import catGifts from "@/assets/cat-gifts.jpg";
import { saveCustomRequest } from "@/lib/commerce";
import { uploadCustomizationPhoto } from "@/lib/uploads";

export const Route = createFileRoute("/custom")({
  head: () => ({
    meta: [
      { title: "Custom Quote Request - Breakthrough Collection LLC" },
      {
        name: "description",
        content:
          "Request a quote for a custom item that is not listed in the shop. Upload a sample image and share the text, photo, logo, or media you want added.",
      },
      { property: "og:title", content: "Custom Quote Request - Breakthrough Collection LLC" },
      { property: "og:description", content: "Request a quote for unlisted custom gifts and apparel." },
      { property: "og:image", content: catGifts },
    ],
  }),
  component: CustomPage,
});

const inputCls =
  "min-h-11 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none";

function CustomPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitNote, setSubmitNote] = useState("");
  const [samplePath, setSamplePath] = useState("");
  const [samplePreview, setSamplePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleSampleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    setSamplePreview(URL.createObjectURL(file));

    try {
      const path = await uploadCustomizationPhoto(file);
      setSamplePath(path);
    } catch (error) {
      setSamplePath("");
      setSamplePreview("");
      setUploadError(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeSample() {
    setSamplePath("");
    setSamplePreview("");
    setUploadError("");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Custom Quote"
        title="Request something"
        italic="made just for you."
        image={catGifts}
        blurb="For items not listed in the shop, send a sample image, wording, media details, quantity, and delivery preference. We will review and reply with a quote."
      />

      <section className="border-b border-border bg-cream/55">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 md:grid-cols-3 md:px-8">
          <TimelineCard
            icon={Truck}
            title="Standard Delivery"
            body="Standard turnaround is usually 7-8 days after quote, design, and payment approval."
          />
          <TimelineCard
            icon={Zap}
            title="Rush / Express"
            body="Rush timing may be available for an extra fee depending on item type, quantity, and complexity."
          />
          <TimelineCard
            icon={PackageCheck}
            title="Quote First"
            body="This page is not checkout. It creates a quote request so the owner can confirm price and feasibility."
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-20 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-24">
        <div>
          <span className="text-[11px] uppercase tracking-[0.32em] text-gold">What To Include</span>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            The clearer the request, the faster the quote.
          </h2>
          <ul className="mt-8 grid gap-3 text-sm text-foreground/80">
            {[
              "A sample image of the item or style you want",
              "The exact text, name, scripture, logo, or media to add",
              "Quantity and date needed",
              "Whether standard 7-8 day delivery works or rush is needed",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                  <Check className="h-3 w-3" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setSending(true);
            setSubmitNote("");
            const form = new FormData(event.currentTarget);
            form.set("sampleImagePath", samplePath);
            const result = await saveCustomRequest(Object.fromEntries(form.entries()));
            setSending(false);
            setSent(true);
            setSubmitNote(
              result.offline
                ? "The request was saved on this device, but Supabase could not be reached."
                : result.notificationWarning
                  ? `Your request was saved. Email notification needs attention: ${result.notificationWarning}`
                  : "Your quote request was received. We will respond with next steps.",
            );
          }}
          className="rounded-sm border border-border bg-card p-6 md:p-10"
        >
          {sent ? (
            <div className="grid place-items-center py-10 text-center">
              <Sparkles className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-3xl text-ink">Quote request received</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/75">{submitNote}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <h3 className="font-display text-2xl text-ink">Start a Custom Quote</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  For unlisted items, special designs, bulk ideas, and quote-only requests.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Your name">
                  <input name="name" required className={inputCls} />
                </Field>
                <Field label="Email">
                  <input name="email" required type="email" className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Item type">
                  <input name="itemType" required placeholder="Blanket, pillow, tumbler, robe..." className={inputCls} />
                </Field>
                <Field label="Occasion">
                  <input name="occasion" placeholder="Birthday, wedding, ministry..." className={inputCls} />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Quantity">
                  <input name="quantity" type="number" min={1} defaultValue={1} className={inputCls} />
                </Field>
                <Field label="Needed by">
                  <input name="deadline" type="date" className={inputCls} />
                </Field>
              </div>

              <Field label="Delivery preference">
                <select name="deliveryPreference" className={inputCls}>
                  <option>Standard delivery: 7-8 days after approval</option>
                  <option>Rush / express request: extra fee if available</option>
                  <option>Not sure yet</option>
                </select>
              </Field>

              <div className="grid gap-2">
                <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Sample image
                </span>
                {samplePreview ? (
                  <div className="flex items-center gap-3 rounded-sm border border-border bg-background p-3">
                    <img src={samplePreview} alt="Sample preview" className="h-20 w-20 rounded-sm object-cover" />
                    {uploading ? (
                      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Uploading sample...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={removeSample}
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" /> Remove
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border bg-background px-4 text-center text-sm text-foreground/75 hover:border-gold hover:text-gold">
                    <ImagePlus className="h-5 w-5" />
                    Upload a sample item, design reference, logo, or photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleSampleChange} />
                  </label>
                )}
                {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
              </div>

              <Field label="Text, name, scripture, or wording">
                <textarea
                  name="designText"
                  rows={3}
                  className={inputCls}
                  placeholder="Write the exact wording you want on the item."
                />
              </Field>

              <Field label="Media details">
                <textarea
                  name="mediaDetails"
                  rows={3}
                  className={inputCls}
                  placeholder="Describe any photo, logo, font, color, placement, or design assets."
                />
              </Field>

              <Field label="Describe the full idea">
                <textarea
                  name="idea"
                  rows={4}
                  className={inputCls}
                  placeholder="Tell us what you want made, how it should look, and anything else we should know."
                />
              </Field>

              <button
                type="submit"
                disabled={sending || uploading}
                className="mt-2 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
              >
                {sending ? "Submitting..." : "Request Quote"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </form>
      </section>

      <Footer />
    </div>
  );
}

function TimelineCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Clock;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4 rounded-sm border border-border bg-background p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/60 text-gold">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <h2 className="font-display text-xl text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground/75">{body}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
