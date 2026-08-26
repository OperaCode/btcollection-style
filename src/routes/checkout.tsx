import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Lock,
  ArrowRight,
  ArrowLeft,
  Truck,
  RefreshCw,
  User,
  MapPin,
  Phone,
} from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { useCart, formatUSD } from "@/lib/cart";
import { startOrderCheckout } from "@/lib/paid-order-checkout";
import { getCheckoutShippingRates, type ShippingAddress, type ShippoRate } from "@/lib/shippo";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Breakthrough Collection LLC" },
      { name: "description", content: "Secure checkout for your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Step = 1 | 2 | 3;

function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    state: "",
  });
  const [selectedRate, setSelectedRate] = useState<ShippoRate | null>(null);

  const shippingCost = selectedRate ? Number(selectedRate.amount) : 0;
  const total = subtotal + shippingCost;

  function continueFromShipping() {
    const phoneDigits = shipping.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setShippingError("Enter a valid 10-digit phone number, for example (555) 555-5555.");
      return;
    }
    setShippingError(null);
    setSelectedRate(null);
    setStep(2);
  }

  async function handlePay() {
    setSubmitting(true);
    setPayError(null);
    try {
      const phoneDigits = shipping.phone.replace(/\D/g, "");
      const result = await startOrderCheckout({
        data: {
          email: shipping.email,
          shippingAddress: { ...shipping, phone: `+1${phoneDigits}` },
          items,
          subtotal,
          shipping: shippingCost,
          total,
          deliveryMethod: selectedRate
            ? `${selectedRate.provider} ${selectedRate.service}`
            : undefined,
        },
      });
      window.location.href = result.url;
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Could not start checkout. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <h1 className="font-display text-4xl text-ink">Your bag is empty</h1>
          <p className="mt-4 text-sm text-foreground/70">
            Add pieces to your bag before checking out.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
          >
            Shop the Collection
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Secure Checkout</p>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Complete your order</h1>
        </div>

        <Steps step={step} />

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            {step === 1 && (
              <StepShipping
                data={shipping}
                error={shippingError}
                onChange={(next) => {
                  setShipping(next);
                  setShippingError(null);
                }}
                onNext={continueFromShipping}
              />
            )}
            {step === 2 && (
              <StepDelivery
                address={shipping}
                selectedRate={selectedRate}
                onSelect={setSelectedRate}
              />
            )}
            {step === 3 && (
              <StepReview
                shipping={shipping}
                selectedRate={selectedRate}
                onEditShipping={() => setStep(1)}
                onEditDelivery={() => setStep(2)}
              />
            )}
          </div>

          <div className="flex h-fit flex-col gap-6">
            <aside className="rounded-sm border border-border bg-cream/50 p-6 md:p-8">
              <h2 className="font-display text-xl text-ink">Order Summary</h2>
              <ul className="mt-5 divide-y divide-border">
                {items.map((it) => (
                  <li
                    key={`${it.id}-${JSON.stringify(it.customization ?? {})}`}
                    className="flex gap-3 py-3"
                  >
                    <div className="relative">
                      <img src={it.img} alt="" className="h-16 w-14 rounded-sm object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-background">
                        {it.qty}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm text-ink">{it.name}</span>
                      {it.customization?.size && (
                        <span className="text-[11px] text-muted-foreground">
                          Size {it.customization.size}
                        </span>
                      )}
                      {(it.customization?.text ||
                        it.customization?.photoPath ||
                        it.customization?.note ||
                        it.customization?.occasion) && (
                        <span className="text-[11px] text-gold">Personalized</span>
                      )}
                    </div>
                    <span className="text-sm text-ink">{formatUSD(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-foreground/75">Subtotal</dt>
                  <dd className="text-ink">{formatUSD(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/75">Shipping</dt>
                  <dd className="text-ink">{selectedRate ? formatUSD(shippingCost) : "—"}</dd>
                </div>
                {selectedRate && (
                  <div className="flex justify-between">
                    <dt className="text-foreground/75">Delivery</dt>
                    <dd className="text-right text-ink">
                      {selectedRate.provider} {selectedRate.service}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg text-ink">
                  <dt>Total</dt>
                  <dd>{formatUSD(total)}</dd>
                </div>
              </dl>
            </aside>

            {step === 2 && (
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!selectedRate}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue to Review <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                {payError && <p className="text-xs text-destructive">{payError}</p>}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold disabled:opacity-50"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    {submitting
                      ? "Redirecting to secure payment..."
                      : `Complete Payment · ${formatUSD(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const labels = ["Shipping", "Delivery", "Review"];
  return (
    <ol className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${
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
            {i < labels.length - 1 && <span className="h-px w-8 bg-border" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepShipping({
  data,
  error,
  onChange,
  onNext,
}: {
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zip: string;
    state: string;
  };
  error: string | null;
  onChange: (v: typeof data) => void;
  onNext: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNext();
      }}
      className="rounded-sm border border-border bg-card p-6 md:p-8"
    >
      <h2 className="font-display text-2xl text-ink">Shipping Information</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name">
          <input
            required
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Phone">
          <input
            required
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="(555) 555-5555"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Street Address">
          <input
            required
            value={data.address}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City">
          <input
            required
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="State">
          <input
            required
            maxLength={2}
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value.toUpperCase() })}
            className={inputCls}
          />
        </Field>
        <Field label="ZIP">
          <input
            required
            value={data.zip}
            onChange={(e) => onChange({ ...data, zip: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>
      {error && (
        <p className="mt-3 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
      >
        Continue to Delivery <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function StepDelivery({
  address,
  selectedRate,
  onSelect,
}: {
  address: ShippingAddress;
  selectedRate: ShippoRate | null;
  onSelect: (rate: ShippoRate) => void;
}) {
  const rates = useQuery({
    queryKey: ["checkout-shipping-rates", address],
    queryFn: () => getCheckoutShippingRates(address),
  });

  const sorted = rates.data?.rates ?? [];
  const addressWarning =
    rates.data && !rates.data.addressValid
      ? rates.data.addressMessages[0] ||
        "We couldn't fully verify this address. Please double-check it before continuing."
      : null;

  return (
    <div className="rounded-sm border border-border bg-card p-6 md:p-8">
      <h2 className="font-display text-2xl text-ink">Delivery Method</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Live rates for {address.city}, {address.state} {address.zip}.
      </p>

      {addressWarning && (
        <p className="mt-4 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-xs text-ink">
          {addressWarning}
        </p>
      )}

      <div className="mt-6 grid gap-3">
        {rates.isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">Fetching live rates...</p>
        )}

        {rates.isError && (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-destructive">
              Couldn't fetch shipping rates. Double-check your address, or try again.
            </p>
            <button
              type="button"
              onClick={() => rates.refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-foreground/75 hover:border-gold hover:text-gold"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        )}

        {!rates.isLoading && !rates.isError && sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No delivery options were found for this address. Please check it and go back.
          </p>
        )}

        {sorted.map((rate) => (
          <button
            key={rate.object_id}
            type="button"
            onClick={() => onSelect(rate)}
            className={`flex items-center justify-between gap-4 rounded-sm border p-4 text-left transition ${
              selectedRate?.object_id === rate.object_id
                ? "border-gold bg-gold/10"
                : "border-border hover:border-gold/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-gold" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {rate.provider} {rate.service}
                </div>
                <div className="text-xs text-muted-foreground">
                  {rate.estimated_days
                    ? `${rate.estimated_days} business day${rate.estimated_days === 1 ? "" : "s"}`
                    : rate.duration_terms || "Estimated delivery varies"}
                </div>
              </div>
            </div>
            <span className="shrink-0 text-sm font-medium text-ink">
              {formatUSD(Number(rate.amount))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepReview({
  shipping,
  selectedRate,
  onEditShipping,
  onEditDelivery,
}: {
  shipping: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  selectedRate: ShippoRate | null;
  onEditShipping: () => void;
  onEditDelivery: () => void;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Review Your Order</h2>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-gold" /> Secure
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        Please double-check everything below before you complete payment.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="flex items-start gap-3 rounded-sm border border-border bg-cream/40 p-4">
          <User className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Contact
            </div>
            <div className="mt-1 text-ink">{shipping.name}</div>
            <div className="text-foreground/75">{shipping.email}</div>
          </div>
          <button
            type="button"
            onClick={onEditShipping}
            className="text-[10px] uppercase tracking-[0.18em] text-gold hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-sm border border-border bg-cream/40 p-4">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Shipping Address
            </div>
            <div className="mt-1 text-foreground/75">
              {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
            </div>
          </div>
          <button
            type="button"
            onClick={onEditShipping}
            className="text-[10px] uppercase tracking-[0.18em] text-gold hover:underline"
          >
            Edit
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-sm border border-border bg-cream/40 p-4">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <div className="min-w-0 flex-1 text-sm">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Phone
            </div>
            <div className="mt-1 text-foreground/75">{shipping.phone}</div>
          </div>
          <button
            type="button"
            onClick={onEditShipping}
            className="text-[10px] uppercase tracking-[0.18em] text-gold hover:underline"
          >
            Edit
          </button>
        </div>

        {selectedRate && (
          <div className="flex items-start gap-3 rounded-sm border border-border bg-cream/40 p-4">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div className="min-w-0 flex-1 text-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Delivery
              </div>
              <div className="mt-1 text-foreground/75">
                {selectedRate.provider} {selectedRate.service}
              </div>
            </div>
            <button
              type="button"
              onClick={onEditDelivery}
              className="text-[10px] uppercase tracking-[0.18em] text-gold hover:underline"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
