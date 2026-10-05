import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Header, Footer } from "@/components/site/SiteChrome";
import { createCustomRequestCheckoutUrl } from "@/lib/custom-request-payment";

export const Route = createFileRoute("/custom/pay/$id")({
  head: () => ({
    meta: [{ title: "Pay Your Quote — Breakthrough Collection LLC" }, { name: "robots", content: "noindex" }],
  }),
  component: PayPage,
});

// Unlike the old version of this page, checkout is no longer started
// automatically in the loader — the customer picks a payment method
// directly (card via Stripe, or PayPal), same two-button pattern as the
// main cart checkout.
function PayPage() {
  const { id } = Route.useParams();
  const [submittingGateway, setSubmittingGateway] = useState<"stripe" | "paypal" | null>(null);
  const submitting = submittingGateway !== null;
  const [error, setError] = useState<string | null>(null);

  async function handlePay(gateway: "stripe" | "paypal") {
    setSubmittingGateway(gateway);
    setError(null);
    try {
      const result = await createCustomRequestCheckoutUrl({ data: { id, gateway } });
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      setError(result.error ?? "Something went wrong starting checkout.");
      setSubmittingGateway(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong starting checkout.");
      setSubmittingGateway(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl text-ink">Pay Your Quote</h1>
        <p className="mt-4 text-sm text-foreground/70">Choose how you'd like to pay to complete your custom order.</p>

        {error && <p className="mt-6 text-xs text-destructive">{error}</p>}

        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handlePay("stripe")}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3.5 text-[11px] uppercase tracking-[0.18em] text-background transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5 flex-shrink-0" />
            {submittingGateway === "stripe" ? "Redirecting..." : "Pay with Card"}
          </button>

          {/* Styled after PayPal's own gold checkout button so it reads as
              PayPal at a glance rather than another pill button in our
              site's own colors. */}
          <button
            type="button"
            onClick={() => handlePay("paypal")}
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FFC439] px-4 py-3.5 transition hover:bg-[#f0b429] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5 flex-shrink-0 text-[#003087]" />
            {submittingGateway === "paypal" ? (
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#003087]">Redirecting...</span>
            ) : (
              <span className="text-lg font-bold italic tracking-tight">
                <span className="text-[#003087]">Pay</span>
                <span className="text-[#009cde]">Pal</span>
              </span>
            )}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
