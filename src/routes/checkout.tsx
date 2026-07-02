import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Lock, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { useCart, formatUSD } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — BT Collection LLC" },
      { name: "description", content: "Secure checkout for your order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

type Step = 1 | 2 | 3;

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>(1);
  const [orderId, setOrderId] = useState("");
  const [shipping, setShipping] = useState({ name: "", email: "", address: "", city: "", zip: "", state: "" });

  const shippingCost = subtotal > 75 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shippingCost;

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center">
          <h1 className="font-display text-4xl text-ink">Your bag is empty</h1>
          <p className="mt-4 text-sm text-foreground/70">Add pieces to your bag before checking out.</p>
          <Link to="/shop" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink">
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
                onChange={setShipping}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepPayment
                onBack={() => setStep(1)}
                onPay={() => {
                  setOrderId(`BTC-${Math.floor(100000 + Math.random() * 900000)}`);
                  clear();
                  setStep(3);
                }}
                total={total}
              />
            )}
            {step === 3 && <StepConfirmation orderId={orderId} email={shipping.email} />}
          </div>

          {step !== 3 && (
            <aside className="h-fit rounded-sm border border-border bg-cream/50 p-6 md:p-8">
              <h2 className="font-display text-xl text-ink">Order Summary</h2>
              <ul className="mt-5 divide-y divide-border">
                {items.map((it) => (
                  <li key={`${it.id}-${it.variant ?? ""}`} className="flex gap-3 py-3">
                    <div className="relative">
                      <img src={it.img} alt="" className="h-16 w-14 rounded-sm object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-background">
                        {it.qty}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm text-ink">{it.name}</span>
                      {it.variant && <span className="text-[11px] text-muted-foreground">Size {it.variant}</span>}
                    </div>
                    <span className="text-sm text-ink">{formatUSD(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <div className="flex justify-between"><dt className="text-foreground/75">Subtotal</dt><dd className="text-ink">{formatUSD(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-foreground/75">Shipping</dt><dd className="text-ink">{shippingCost === 0 ? "Free" : formatUSD(shippingCost)}</dd></div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg text-ink"><dt>Total</dt><dd>{formatUSD(total)}</dd></div>
              </dl>
            </aside>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Steps({ step }: { step: Step }) {
  const labels = ["Shipping", "Payment", "Confirmation"];
  return (
    <ol className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-3">
            <span className={`grid h-7 w-7 place-items-center rounded-full border text-xs ${
              done ? "border-gold bg-gold text-ink" : active ? "border-ink bg-ink text-background" : "border-border text-muted-foreground"
            }`}>
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
  onChange,
  onNext,
}: {
  data: { name: string; email: string; address: string; city: string; zip: string; state: string };
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
        <Field label="Full Name"><input required value={data.name} onChange={(e) => onChange({ ...data, name: e.target.value })} className={inputCls} /></Field>
        <Field label="Email"><input required type="email" value={data.email} onChange={(e) => onChange({ ...data, email: e.target.value })} className={inputCls} /></Field>
      </div>
      <div className="mt-4">
        <Field label="Street Address"><input required value={data.address} onChange={(e) => onChange({ ...data, address: e.target.value })} className={inputCls} /></Field>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City"><input required value={data.city} onChange={(e) => onChange({ ...data, city: e.target.value })} className={inputCls} /></Field>
        <Field label="State"><input required maxLength={2} value={data.state} onChange={(e) => onChange({ ...data, state: e.target.value.toUpperCase() })} className={inputCls} /></Field>
        <Field label="ZIP"><input required value={data.zip} onChange={(e) => onChange({ ...data, zip: e.target.value })} className={inputCls} /></Field>
      </div>
      <button
        type="submit"
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
      >
        Continue to Payment <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function StepPayment({ onBack, onPay, total }: { onBack: () => void; onPay: () => void; total: number }) {
  const [card, setCard] = useState({ number: "", exp: "", cvc: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onPay();
      }}
      className="rounded-sm border border-border bg-card p-6 md:p-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Payment</h2>
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-gold" /> Secure
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground/70">All transactions are encrypted end-to-end.</p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Field label="Card Number">
          <input required placeholder="1234 1234 1234 1234" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className={inputCls} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expiration"><input required placeholder="MM / YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} className={inputCls} /></Field>
          <Field label="CVC"><input required placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} className={inputCls} /></Field>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
        >
          Pay {formatUSD(total)} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}

function StepConfirmation({ orderId, email }: { orderId: string; email: string }) {
  return (
    <div className="rounded-sm border border-border bg-card p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
        <Sparkles className="h-6 w-6" />
      </div>
      <h2 className="mt-6 font-display text-4xl text-ink">Thank you!</h2>
      <p className="mt-3 text-sm text-foreground/75">
        Your order <span className="font-medium text-ink">{orderId}</span> is confirmed.
      </p>
      {email && (
        <p className="mt-1 text-sm text-foreground/75">
          A receipt has been sent to <span className="text-ink">{email}</span>.
        </p>
      )}
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-3 rounded-full border border-border px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-foreground/75 hover:border-gold hover:text-gold"
        >
          Back to Home
        </Link>
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