import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart, useUI } from "@/lib/stores";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-gold">Your Bag</div>
            <h2 className="font-display text-2xl text-ink">Shopping Cart</h2>
          </div>
          <button onClick={close} className="rounded-full p-2 text-foreground/70 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-display text-xl text-ink">Your bag is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Discover thoughtfully made pieces to gift or keep.
              </p>
              <Link
                to="/shop"
                onClick={close}
                className="mt-6 rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background hover:bg-ink/90"
              >
                Shop the Collection
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4">
                  <img src={i.image} alt={i.name} className="h-24 w-20 rounded-sm object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-base leading-tight text-ink">{i.name}</h3>
                        {i.customization?.name && (
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-gold">
                            Personalized: {i.customization.name}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(i.id)}
                        className="text-xs text-muted-foreground hover:text-ink"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-1 rounded-full border border-border">
                        <button
                          onClick={() => setQty(i.id, i.quantity - 1)}
                          className="grid h-7 w-7 place-items-center text-foreground/70 hover:text-ink"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{i.quantity}</span>
                        <button
                          onClick={() => setQty(i.id, i.quantity + 1)}
                          className="grid h-7 w-7 place-items-center text-foreground/70 hover:text-ink"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-ink">
                        ${(i.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="uppercase tracking-[0.18em] text-muted-foreground">Subtotal</span>
              <span className="font-display text-2xl text-ink">${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              to="/checkout"
              onClick={close}
              className="mt-4 grid place-items-center rounded-full bg-ink py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-ink/90"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/cart"
              onClick={close}
              className="mt-2 grid place-items-center rounded-full border border-border py-3 text-[12px] uppercase tracking-[0.22em] text-foreground/80 hover:border-gold hover:text-gold"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}