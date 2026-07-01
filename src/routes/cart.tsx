import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { Announcement, Header, Footer, PageHero } from "@/components/site/SiteChrome";
import { useCart } from "@/lib/stores";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Cart — BT Collection LLC" }] }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Announcement />
      <Header />
      <PageHero kicker="Your Bag" title="Shopping" italic="Cart" image={heroImg} />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1fr_360px] md:px-8">
        <div>
          {items.length === 0 ? (
            <div className="rounded-md border border-border p-12 text-center">
              <p className="font-display text-2xl text-ink">Your bag is empty</p>
              <Link to="/shop" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background">Shop the Collection</Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 py-5">
                  <img src={i.image} alt={i.name} className="h-32 w-24 rounded-sm object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link to="/product/$slug" params={{ slug: i.slug }} className="font-display text-xl text-ink hover:text-gold">{i.name}</Link>
                        {i.customization?.name && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">Personalized: {i.customization.name}</p>}
                      </div>
                      <button onClick={() => remove(i.id)} className="text-foreground/50 hover:text-ink"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button onClick={() => setQty(i.id, i.quantity - 1)} className="grid h-8 w-8 place-items-center"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm">{i.quantity}</span>
                        <button onClick={() => setQty(i.id, i.quantity + 1)} className="grid h-8 w-8 place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                      <span className="font-medium text-ink">${(i.price * i.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <aside className="h-fit rounded-md border border-border bg-cream/40 p-6">
          <h2 className="font-display text-2xl text-ink">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</dd></div>
            <div className="flex justify-between border-t border-border pt-3 font-display text-xl text-ink"><dt>Total</dt><dd>${total.toFixed(2)}</dd></div>
          </dl>
          <Link to="/checkout" className="mt-6 grid place-items-center rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-ink/90">Checkout</Link>
        </aside>
      </section>
      <Footer />
    </div>
  );
}