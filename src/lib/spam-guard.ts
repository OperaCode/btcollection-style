// Lightweight, dependency-free spam gate for the public contact, custom
// request, and newsletter forms: a hidden "honeypot" field real visitors
// never see or fill in (screen readers and generic form-filling bots often
// do), plus a minimum time-on-form check (a human takes at least a couple
// of seconds; a script submits instantly). Neither needs a third-party key.
//
// This is checked server-side, in the createServerFn handler itself — not
// just in the form component — since the RPC endpoint is what's actually
// reachable from outside the page. It won't stop someone who deliberately
// targets that endpoint by hand (that needs real rate limiting or a CAPTCHA,
// which is a bigger call involving a third-party service — flagged
// separately), but it does stop the generic bots that are the common case
// for a small storefront.
const MIN_FILL_TIME_MS = 2500;

export type SpamGuardFields = {
  honeypot?: string;
  formRenderedAt?: number;
};

export function isLikelySpam(input: SpamGuardFields): boolean {
  if (input.honeypot && input.honeypot.trim().length > 0) return true;
  if (typeof input.formRenderedAt === "number" && Date.now() - input.formRenderedAt < MIN_FILL_TIME_MS) {
    return true;
  }
  return false;
}
