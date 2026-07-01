import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";
import { useCart } from "@/lib/stores";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — BT Collection LLC" }] }),
  component: Checkout,
});

const STEPS = ["Shipping", "Delivery", "Review", "Confirmation"];

function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({ fullName: "", email: "", address: "", city: "", state: "", zip: "", country: "United States" });
  const [delivery, setDelivery] = useState<"standard" | "express" | "pickup">("standard");
  const [placing, setPlacing] = useState(false);
  const shipping = delivery === "pickup" ? 0 : delivery === "express" ? 18 : subtotal >= 75 ? 0 : 8;
  const total = subtotal + shipping;

  async function place() {
    setPlacing(true);
    try {
      const { data: sess } = await supabase.auth.getUser();
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: sess.user?.id ?? null,
          email: addr.email,
          status: "pending",
          subtotal,
          shipping,
          total,
          shipping_address: addr,
          delivery_method: delivery,
        })
        .select()
        .single();
      if (error) throw error;
      const lineItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        customization: i.customization ?? null,
      }));
      await supabase.from("order_items").insert(lineItems);
      clear();
      navigate({ to: "/checkout/success", search: { id: order.id } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not place order. Please sign in first.");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-10 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-xs ${i <= step ? "bg-ink text-background" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`ml-2 hidden text-[11px] uppercase tracking-[0.22em] md:inline ${i <= step ? "text-ink" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`mx-3 h-px flex-1 ${i < step ? "bg-ink" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl text-ink">Shipping Address</h1>
            {["fullName", "email", "address", "city", "state", "zip"].map((k) => (
              <input key={k} placeholder={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())} value={(addr as any)[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm" />
            ))}
            <button onClick={() => setStep(1)} disabled={!addr.email || !addr.address} className="w-full rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background disabled:opacity-50">Continue to Delivery</button>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-ink">Delivery Method</h1>
            {([
              { id: "standard", label: "Standard Shipping", eta: "3–5 business days", cost: subtotal >= 75 ? 0 : 8 },
              { id: "express", label: "Express Shipping", eta: "1–2 business days", cost: 18 },
              { id: "pickup", label: "Local Pickup", eta: "Ready in 24h", cost: 0 },
            ] as const).map((d) => (
              <button key={d.id} onClick={() => setDelivery(d.id)} className={`flex w-full items-center justify-between rounded-md border px-5 py-4 text-left ${delivery === d.id ? "border-gold bg-cream/40" : "border-border"}`}>
                <div>
                  <div className="font-medium text-ink">{d.label}</div>
                  <div className="text-xs text-muted-foreground">{d.eta}</div>
                </div>
                <div className="text-ink">{d.cost === 0 ? "Free" : `$${d.cost}`}</div>
              </button>
            ))}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(0)} className="flex-1 rounded-full border border-border py-3.5 text-[12px] uppercase tracking-[0.22em]">Back</button>
              <button onClick={() => setStep(2)} className="flex-1 rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background">Review Order</button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl text-ink">Review Your Order</h1>
            <ul className="mt-6 divide-y divide-border">
              {items.map((i) => (
                <li key={i.id} className="flex justify-between py-3 text-sm">
                  <span>{i.name} × {i.quantity}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>${shipping.toFixed(2)}</dd></div>
              <div className="flex justify-between font-display text-xl text-ink"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>
            <p className="mt-6 rounded-md border border-gold/30 bg-cream/40 p-4 text-xs text-foreground/70">Payments are not yet enabled. This will place a pending order that our team will follow up on for payment.</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-border py-3.5 text-[12px] uppercase tracking-[0.22em]">Back</button>
              <button onClick={place} disabled={placing || items.length === 0} className="flex-1 rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background disabled:opacity-50">{placing ? "Placing..." : "Place Order"}</button>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}