// Server-only Stripe client. Load inside server handlers:
// const { stripe } = await import("@/lib/stripe.server");
// Top-level import is only safe from other .server.ts modules — route files
// and lib modules without the .server suffix ship to the client bundle.
import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}
