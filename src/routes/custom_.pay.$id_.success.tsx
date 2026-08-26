import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { confirmCustomRequestPayment } from "@/lib/custom-request-payment";

export const Route = createFileRoute("/custom_/pay/$id_/success")({
  head: () => ({
    meta: [{ title: "Payment Confirmed — Breakthrough Collection LLC" }, { name: "robots", content: "noindex" }],
  }),
  component: PaySuccessPage,
});

function PaySuccessPage() {
  const { id } = Route.useParams();
  const [state, setState] = useState<"loading" | "paid" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    async function check() {
      try {
        const result = await confirmCustomRequestPayment({ data: { id } });
        if (cancelled) return;

        if (result.paid) {
          setState("paid");
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
  }, [id]);

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
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-6 font-display text-4xl text-ink">Payment received!</h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
              Thank you — your custom order is confirmed and work is starting. A confirmation email is on its
              way.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[12px] uppercase tracking-[0.22em] text-background hover:bg-gold hover:text-ink"
            >
              Back to Home
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <h1 className="mt-6 font-display text-3xl text-ink">We couldn't confirm this payment</h1>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">{error}</p>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
