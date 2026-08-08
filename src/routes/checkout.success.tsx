import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Loader2, Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { useCart } from "@/lib/cart";
import { confirmOrderPayment } from "@/lib/order-payment";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Breakthrough Collection LLC" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
  component: CheckoutSuccessPage,
});

// Hex approximations of the site's oklch brand tokens (canvas-confetti needs
// hex/rgb, same values already used for email-client compatibility in
// email-template.ts) so the celebration reads as "us" rather than generic.
const CONFETTI_COLORS = ["#C8A45C", "#E4CFA0", "#F7F2EA", "#1F1D2B"];

function fireConfetti() {
  const end = Date.now() + 2200;

  confetti({
    particleCount: 100,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.3 },
    colors: CONFETTI_COLORS,
  });

  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors: CONFETTI_COLORS });
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors: CONFETTI_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function CheckoutSuccessPage() {
  const { orderId } = Route.useSearch();
  const { clear } = useCart();
  const [state, setState] = useState<"loading" | "paid" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setState("error");
      setError("Missing order reference.");
      return;
    }

    let cancelled = false;
    let attempt = 0;

    async function check() {
      try {
        const result = await confirmOrderPayment({ data: { orderId } });
        if (cancelled) return;

        if (result.paid) {
          setState("paid");
          clear();
          fireConfetti();
          return;
        }

        // Square may take a moment to finalize the order after redirecting
        // back — retry a few times before treating it as a real failure.
        attempt += 1;
        if (attempt < 4) {
          setTimeout(check, 1500);
        } else {
          setState("error");
          setError(result.error ?? "Payment could not be confirmed.");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setError("Payment could not be confirmed.");
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [orderId, clear]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        {state === "loading" && (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold" />
            <h1 className="mt-6 font-display text-3xl text-ink">Confirming your payment...</h1>
          </>
        )}

        {state === "paid" && (
          <>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-5xl text-ink">Thank you!</h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
              Your order <span className="font-medium text-ink">{orderId.slice(0, 8)}</span> is confirmed.
              A receipt is on its way to your inbox.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
              >
                Continue Shopping
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-border px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-foreground/75 hover:border-gold hover:text-gold"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="mt-6 font-display text-3xl text-ink">We couldn't confirm this payment</h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">{error}</p>
            <Link
              to="/checkout"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
            >
              Return to Checkout
            </Link>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
