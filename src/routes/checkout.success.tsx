import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { z } from "zod";
import { Announcement, Header, Footer } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/checkout/success")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({ meta: [{ title: "Order Received — BT Collection LLC" }] }),
  component: Success,
});

function Success() {
  const { id } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <Announcement />
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/20 text-gold"><Check className="h-8 w-8" /></div>
        <h1 className="mt-6 font-display text-4xl text-ink">Thank you for your order</h1>
        <p className="mt-4 text-foreground/70">Your order has been received. We'll be in touch shortly with next steps for payment and shipping.</p>
        {id && <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Order #{id.slice(0, 8)}</p>}
        <Link to="/shop" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.22em] text-background">Continue Shopping</Link>
      </section>
      <Footer />
    </div>
  );
}