import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Header, Footer, PageHeader } from "@/components/site/SiteChrome";
import { useCart, formatUSD } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Breakthrough Collection LLC" },
      { name: "description", content: "Review the pieces in your bag before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 8;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <PageHeader
        kicker="Your Bag"
        title="Shopping"
        italic="Cart"
        blurb="Review your selection before continuing to checkout."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {items.length === 0 ? (
          <div className="grid place-items-center py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h2 className="mt-6 font-display text-3xl text-ink">Your bag is empty</h2>
            <p className="mt-3 max-w-sm text-sm text-foreground/70">
              Explore our collection of faith-inspired pieces made to be given, gifted, and
              treasured.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
            >
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr]">
            <ul className="divide-y divide-border border-y border-border">
              {items.map((it) => (
                <li key={`${it.id}-${it.variant ?? ""}`} className="flex gap-4 py-6 md:gap-6">
                  <Link to="/product/$slug" params={{ slug: it.id }} className="shrink-0">
                    <img
                      src={it.img}
                      alt=""
                      className="h-28 w-24 rounded-sm object-cover md:h-32 md:w-28"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/product/$slug"
                          params={{ slug: it.id }}
                          className="truncate font-display text-xl text-ink hover:text-gold"
                        >
                          {it.name}
                        </Link>
                        {it.variant && (
                          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            Size · {it.variant}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-foreground/75">{formatUSD(it.price)}</p>
                      </div>
                      <span className="text-sm font-medium text-ink">
                        {formatUSD(it.price * it.qty)}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          aria-label="Decrease"
                          onClick={() => setQty(it.id, it.qty - 1, it.variant)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-ink"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <button
                          aria-label="Increase"
                          onClick={() => setQty(it.id, it.qty + 1, it.variant)}
                          className="grid h-9 w-9 place-items-center text-foreground/70 hover:text-ink"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.id, it.variant)}
                        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit rounded-sm border border-border bg-cream/50 p-6 md:p-8">
              <h2 className="font-display text-2xl text-ink">Order Summary</h2>
              <dl className="mt-6 space-y-3 border-b border-border pb-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-foreground/75">Subtotal</dt>
                  <dd className="text-ink">{formatUSD(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-foreground/75">Shipping</dt>
                  <dd className="text-ink">{shipping === 0 ? "Free" : formatUSD(shipping)}</dd>
                </div>
                <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <dt>Taxes</dt>
                  <dd>Calculated at checkout</dd>
                </div>
              </dl>
              <div className="flex justify-between pt-5">
                <span className="font-display text-lg text-ink">Total</span>
                <span className="font-display text-lg text-ink">{formatUSD(total)}</span>
              </div>
              <Link
                to="/checkout"
                className="mt-6 flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="mt-3 block text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
