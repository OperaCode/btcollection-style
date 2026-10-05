import Stripe from "stripe";
import { createServerOnlyFn } from "@tanstack/react-start";
import type { CartItem } from "@/lib/cart";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to your Vercel environment variables.`);
  return value;
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Unlike Square, there's no separate "environment" setting to get wrong —
// Stripe determines live vs. test mode from which secret key you use
// (sk_test_... vs sk_live_...), so there's no equivalent of the
// token/environment-mismatch class of bug Square's VITE_SQUARE_ENVIRONMENT
// setup was prone to.
let _stripe: Stripe | undefined;
function getStripeClient() {
  if (!_stripe) _stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"));
  return _stripe;
}

type CreateCheckoutInput = {
  orderId: string;
  items: CartItem[];
  shippingLabel: string | null;
  shippingAmount: number;
  successUrl: string;
  cancelUrl: string;
  buyerEmail?: string;
  // Extra *positive* line items beyond products/shipping — e.g. a custom
  // request's one-off fee. Not used for sales tax any more when
  // automaticTax is on (see below) — Stripe computes and displays that
  // itself. Line items still can't have a negative amount, so a discount
  // still can't be represented this way — see `discount` below.
  extraLines?: Array<{ label: string; amount: number }>;
  // A discount code's dollar-off amount. Stripe Checkout discounts work via
  // Coupon objects rather than a plain field on the session, so this
  // creates a one-time, single-use coupon for the exact amount already
  // computed and stored server-side, then attaches it to the session —
  // never a percentage Stripe would recompute against its own idea of the
  // order total.
  discount?: { label: string; amount: number };
  // When set, hands Stripe Tax the customer's already-collected shipping
  // address (via a Customer object) and turns on automatic_tax, so the
  // Checkout page itself calculates and displays the real, address-exact
  // tax rate — more accurate than this app's own flat per-state table
  // (src/lib/tax.ts), and the customer never has to re-enter their address
  // just for tax purposes. Requires Stripe Tax to actually be configured
  // (an active registration for whichever states you collect tax in) —
  // without a registration for a given state, Stripe just charges $0 tax
  // there, same as having no nexus.
  automaticTax?: boolean;
  shippingAddress?: { address: string; city: string; state: string; zip: string };
};

// PayPal does not calculate sales tax. Ask Stripe Tax for the same
// address-level calculation that Stripe Checkout uses, so the two gateways
// never disagree. Checkout products carry an explicit Stripe tax code from
// the server-side catalogue lookup, so apparel and drinkware are classified
// correctly instead of all inheriting one account-level default.
type CalculateTaxInput = {
  items: CartItem[];
  shippingAmount: number;
  shippingAddress: { address: string; city: string; state: string; zip: string };
  discountAmount?: number;
};

const calculateTax = createServerOnlyFn(async (data: CalculateTaxInput) => {
  const stripe = getStripeClient();
  let discountRemaining = Math.round((data.discountAmount ?? 0) * 100);
  const lineItems = data.items
    .map((item, index) => {
      const amount = Math.round(item.price * item.qty * 100);
      // The fixed Checkout coupon applies to merchandise, not shipping.
      const discount = Math.min(amount, discountRemaining);
      discountRemaining -= discount;
      return {
        amount: amount - discount,
        reference: `${item.id}-${index}`.slice(0, 200),
        tax_behavior: "exclusive" as const,
        ...(item.taxCode ? { tax_code: item.taxCode } : {}),
      };
    })
    .filter((item) => item.amount > 0);

  const calculation = await stripe.tax.calculations.create({
    currency: "usd",
    line_items: lineItems,
    customer_details: {
      address: {
        line1: data.shippingAddress.address,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        postal_code: data.shippingAddress.zip,
        country: "US",
      },
      address_source: "shipping",
    },
    ...(data.shippingAmount > 0
      ? {
          shipping_cost: {
            amount: Math.round(data.shippingAmount * 100),
            tax_behavior: "exclusive" as const,
          },
        }
      : {}),
  });

  return calculation.tax_amount_exclusive / 100;
});

export async function calculateStripeTax(input: CalculateTaxInput) {
  return calculateTax(input);
}

const createCheckoutSession = createServerOnlyFn(async (data: CreateCheckoutInput) => {
  const stripe = getStripeClient();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = data.items.map((item) => ({
    quantity: item.qty,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(item.price * 100),
      product_data: {
        name: item.name.slice(0, 500),
        // Lets the product thumbnail show up next to the line item on the
        // Checkout page itself, not just in our own order summary. Must be
        // an absolute https URL — product images come from Supabase
        // Storage's getPublicUrl, which already is one.
        ...(item.img ? { images: [item.img] } : {}),
        ...(item.taxCode ? { tax_code: item.taxCode } : {}),
      },
      // Required by Stripe once automatic_tax is on — tells it our prices
      // don't already include tax, so it should add tax on top rather than
      // assume it's baked in.
      ...(data.automaticTax ? { tax_behavior: "exclusive" as const } : {}),
    },
  }));

  for (const line of data.extraLines ?? []) {
    if (line.amount <= 0) continue;
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(line.amount * 100),
        product_data: { name: line.label.slice(0, 500) },
        ...(data.automaticTax ? { tax_behavior: "exclusive" as const } : {}),
      },
    });
  }

  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
  if (data.discount && data.discount.amount > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: Math.round(data.discount.amount * 100),
      currency: "usd",
      duration: "once",
      name: data.discount.label.slice(0, 40),
    });
    discounts = [{ coupon: coupon.id }];
  }

  // Shipping goes through shipping_options rather than a plain line item
  // when automatic tax is on — that's what tells Stripe Tax this amount is
  // specifically shipping, which some states exempt or tax differently
  // from the merchandise itself. A plain line item would just get taxed
  // like any other product.
  let shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] | undefined;
  if (data.shippingAmount > 0) {
    if (data.automaticTax) {
      shippingOptions = [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: Math.round(data.shippingAmount * 100), currency: "usd" },
            display_name: (data.shippingLabel || "Shipping").slice(0, 100),
            tax_behavior: "exclusive",
          },
        },
      ];
    } else {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(data.shippingAmount * 100),
          product_data: { name: (data.shippingLabel || "Shipping").slice(0, 500) },
        },
      });
    }
  }

  // Create a Customer carrying the shipping address we already collected
  // on our own checkout page, so Stripe Tax has a location to calculate
  // from immediately — the customer isn't asked to enter their address a
  // second time on Stripe's page.
  let customerId: string | undefined;
  if (data.automaticTax && data.shippingAddress) {
    const customer = await stripe.customers.create({
      email: data.buyerEmail,
      address: {
        line1: data.shippingAddress.address,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        postal_code: data.shippingAddress.zip,
        country: "US",
      },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    shipping_options: shippingOptions,
    discounts,
    client_reference_id: data.orderId,
    customer: customerId,
    // Stripe rejects passing both customer and customer_email together.
    customer_email: customerId ? undefined : data.buyerEmail,
    automatic_tax: data.automaticTax ? { enabled: true } : undefined,
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: { orderId: data.orderId },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return { url: session.url, stripeSessionId: session.id };
});

export async function createStripeCheckout(input: CreateCheckoutInput) {
  return createCheckoutSession(input);
}

const fetchCheckoutSession = createServerOnlyFn(async (data: { sessionId: string }) => {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(data.sessionId);
  const paid = session.payment_status === "paid";
  const paymentId =
    typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);
  // The real, address-exact tax Stripe actually calculated and charged —
  // only present when automatic_tax was on for this session. Read back so
  // the order we record locally matches what the customer was actually
  // charged, rather than our own pre-checkout estimate.
  const taxAmount = session.total_details?.amount_tax != null ? session.total_details.amount_tax / 100 : null;
  return { paid, paymentId, taxAmount };
});

export async function getStripeSessionStatus(sessionId: string) {
  return fetchCheckoutSession({ sessionId });
}
