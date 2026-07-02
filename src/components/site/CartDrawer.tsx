import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart, formatUSD } from "@/lib/cart";
import { useEffect } from "react";

export function CartDrawer() {
  const { items, isOpen, closeDrawer, setQty, remove, subtotal } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={closeDrawer}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Your Bag</p>
            <h2 className="mt-1 font-display text-2xl text-ink">Shopping Cart</h2>
          </div>
          <button
            aria-label="Close cart"
            onClick={closeDrawer}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground/80 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-gold/40 text-gold">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <h3 className="mt-5 font-display text-2xl text-ink">Your bag is empty</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Discover pieces made to be given, gifted, and treasured.
            </p>
            <Link
              to="/shop"
              onClick={closeDrawer}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
            >
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {items.map((it) => (
                <li key={`${it.id}-${it.variant ?? ""}`} className="flex gap-4 py-5">
                  <img src={it.img} alt="" className="h-24 w-20 shrink-0 rounded-sm object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-display text-lg leading-tight text-ink">{it.name}</h4>
                        {it.variant && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                            {it.variant}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-ink">{formatUSD(it.price * it.qty)}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          aria-label="Decrease"
                          className="grid h-8 w-8 place-items-center text-foreground/70 hover:text-ink"
                          onClick={() => setQty(it.id, it.qty - 1, it.variant)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{it.qty}</span>
                        <button
                          aria-label="Increase"
                          className="grid h-8 w-8 place-items-center text-foreground/70 hover:text-ink"
                          onClick={() => setQty(it.id, it.qty + 1, it.variant)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.id, it.variant)}
                        className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-gold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-6 py-5">
              <div className="flex items-center justify-between text-sm text-foreground/75">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatUSD(subtotal)}</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Shipping & taxes calculated at checkout.</p>
              <Link
                to="/checkout"
                onClick={closeDrawer}
                className="mt-4 flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cart"
                onClick={closeDrawer}
                className="mt-2 block text-center text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-gold"
              >
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}