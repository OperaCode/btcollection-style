import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
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
import { COLOR_SWATCHES } from "@/lib/colors";

export const Route = createFileRoute("/custom")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : "",
    type: typeof search.type === "string" ? search.type : "",
    occasion: typeof search.occasion === "string" ? search.occasion : "",
  }),
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

type FormState = {
  name: string;
  email: string;
  phone: string;
  itemType: string;
  occasion: string;
  colorPreference: string;
  quantity: number;
  deadline: string;
  deliveryPreference: string;
  description: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  itemType: "",
  occasion: "",
  colorPreference: "",
  quantity: 1,
  deadline: "",
  deliveryPreference: "Standard delivery: 7-8 days after approval",
  description: "",
};

const STEP_LABELS = ["What You Want", "The Details", "Contact & Timing"] as const;
type Step = 1 | 2 | 3;

function CustomPage() {
  const { ref, type, occasion } = Route.useSearch();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    itemType: type || INITIAL_FORM.itemType,
    occasion: occasion || INITIAL_FORM.occasion,
    description: ref ? `Inspired by "${ref}" from the inspiration gallery.\n\n` : INITIAL_FORM.description,
  }));
  const [customColor, setCustomColor] = useState(false);

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitNote, setSubmitNote] = useState("");
  const [samplePath, setSamplePath] = useState("");
  const [samplePreview, setSamplePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedSwatch = COLOR_SWATCHES.find((c) => c.name === form.colorPreference);

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

  async function handleSubmit() {
    setSending(true);
    setSubmitNote("");
    const result = await saveCustomRequest({
      name: form.name,
      email: form.email,
      phone: form.phone,
      itemType: form.itemType,
      occasion: form.occasion,
      colorPreference: form.colorPreference,
      quantity: form.quantity,
      deadline: form.deadline,
      deliveryPreference: form.deliveryPreference,
      sampleImagePath: samplePath,
      idea: form.description,
    });
    setSending(false);
    setSent(true);
    setSubmitNote(
      result.offline
        ? "The request was saved on this device, but Supabase could not be reached."
        : result.notificationWarning
          ? `Your request was saved. Email notification needs attention: ${result.notificationWarning}`
          : "Your quote request was received. Check your inbox — we've sent a confirmation.",
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageBanner
        kicker="Custom Quote"
        title="Request something"
        italic="made just for you."
        image={catGifts}
        blurb="For items not listed in the shop, tell us what you want made, share a sample image, and we'll follow up with a quote."
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

        <div className="rounded-sm border border-border bg-card p-6 md:p-10">
          {sent ? (
            <div className="grid place-items-center py-10 text-center">
              <Sparkles className="h-8 w-8 text-gold" />
              <h3 className="mt-4 font-display text-3xl text-ink">Quote request received</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/75">{submitNote}</p>
            </div>
          ) : (
            <div className="grid gap-6">
              <div>
                <h3 className="font-display text-2xl text-ink">Start a Custom Quote</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  For unlisted items, special designs, bulk ideas, and quote-only requests.
                </p>
              </div>

              <StepIndicator step={step} />

              {step === 1 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Item type">
                      <input
                        required
                        value={form.itemType}
                        onChange={(e) => update("itemType", e.target.value)}
                        placeholder="Blanket, pillow, tumbler, robe..."
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Occasion">
                      <input
                        value={form.occasion}
                        onChange={(e) => update("occasion", e.target.value)}
                        placeholder="Birthday, wedding, ministry..."
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-2">
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Color preference
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_SWATCHES.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          aria-label={c.name}
                          onClick={() => {
                            setCustomColor(false);
                            update("colorPreference", c.name);
                          }}
                          className={`h-8 w-8 rounded-full border-2 transition ${
                            !customColor && form.colorPreference === c.name
                              ? "border-gold ring-2 ring-gold/40"
                              : "border-border hover:border-gold/60"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomColor(true);
                          update("colorPreference", "");
                        }}
                        className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition ${
                          customColor
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border text-foreground/70 hover:border-gold hover:text-gold"
                        }`}
                      >
                        Other
                      </button>
                    </div>

                    {customColor ? (
                      <input
                        value={form.colorPreference}
                        onChange={(e) => update("colorPreference", e.target.value)}
                        placeholder="Describe the color you want"
                        className={`${inputCls} mt-1`}
                      />
                    ) : (
                      form.colorPreference && (
                        <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-ink">
                          <span
                            className="h-3 w-3 rounded-full border border-black/10"
                            style={{ backgroundColor: selectedSwatch?.hex }}
                          />
                          Selected: {form.colorPreference}
                        </span>
                      )
                    )}
                  </div>

                  <Field label="Quantity">
                    <input
                      type="number"
                      min={1}
                      value={form.quantity}
                      onChange={(e) => update("quantity", Math.max(1, Number(e.target.value) || 1))}
                      className={`${inputCls} max-w-[140px]`}
                    />
                  </Field>

                  <StepNav
                    onNext={() => setStep(2)}
                    nextDisabled={!form.itemType.trim()}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="grid gap-4">
                  <Field label="Describe what you want">
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Tell us what you want made, the exact wording or scripture, any photo/logo to include, and how it should look."
                      className={inputCls}
                    />
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

                  <StepNav
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    nextDisabled={!form.description.trim()}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Your name">
                      <input
                        required
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <Field label="Phone (optional)">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="For quick follow-up, if you prefer texting or calling"
                      className={inputCls}
                    />
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Needed by">
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => update("deadline", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Delivery preference">
                      <select
                        value={form.deliveryPreference}
                        onChange={(e) => update("deliveryPreference", e.target.value)}
                        className={inputCls}
                      >
                        <option>Standard delivery: 7-8 days after approval</option>
                        <option>Rush / express request: extra fee if available</option>
                        <option>Not sure yet</option>
                      </select>
                    </Field>
                  </div>

                  <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="button"
                      disabled={sending || uploading || !form.name.trim() || !form.email.trim()}
                      onClick={handleSubmit}
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
                    >
                      {sending ? "Submitting..." : "Request Quote"} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] sm:gap-3 sm:text-[11px]">
      {STEP_LABELS.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] ${
                done
                  ? "border-gold bg-gold text-ink"
                  : active
                    ? "border-ink bg-ink text-background"
                    : "border-border text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : n}
            </span>
            <span className={active || done ? "text-ink" : "text-muted-foreground"}>{label}</span>
            {i < STEP_LABELS.length - 1 && <span className="h-px w-4 bg-border sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-2 flex items-center justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={nextDisabled}
        onClick={onNext}
        className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:opacity-60"
      >
        Continue <ArrowRight className="h-4 w-4" />
      </button>
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
