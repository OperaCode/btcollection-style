// TikTok Pixel. The base snippet is injected into <head> by __root.tsx when
// VITE_TIKTOK_PIXEL_ID is set; everything here is a silent no-op otherwise
// (local dev, previews, SSR), so callers never need to guard.

// Validated so the id can be safely interpolated into the inline snippet.
const rawPixelId = (import.meta.env.VITE_TIKTOK_PIXEL_ID as string | undefined)?.trim() ?? "";
export const TIKTOK_PIXEL_ID = /^[A-Z0-9]+$/i.test(rawPixelId) ? rawPixelId : "";

// TikTok's standard base code, verbatim apart from the pixel id.
export function tiktokPixelSnippet() {
  if (!TIKTOK_PIXEL_ID) return null;
  return `!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
  ttq.load('${TIKTOK_PIXEL_ID}');
  ttq.page();
}(window, document, 'ttq');`;
}

type Ttq = {
  page: () => void;
  track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
  identify: (params: Record<string, string>) => void;
};

function ttq(): Ttq | null {
  if (!TIKTOK_PIXEL_ID || typeof window === "undefined") return null;
  return ((window as unknown as { ttq?: Ttq }).ttq) ?? null;
}

export type TikTokContent = {
  content_id: string;
  content_name?: string;
  quantity?: number;
  price?: number;
};

export function toTikTokContents(
  items: { id: string; name: string; qty: number; price: number }[],
): TikTokContent[] {
  return items.map((i) => ({ content_id: i.id, content_name: i.name, quantity: i.qty, price: i.price }));
}

export type TikTokEvent =
  | "ViewContent"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "CompletePayment";

export function trackTikTok(
  event: TikTokEvent,
  data: { contents?: TikTokContent[]; value?: number; eventId?: string } = {},
) {
  const t = ttq();
  if (!t) return;
  const { contents, value, eventId } = data;
  const params: Record<string, unknown> = {};
  if (contents?.length) {
    params.contents = contents.map((c) => ({ ...c, content_type: "product" }));
  }
  if (value !== undefined) {
    params.value = Math.round(value * 100) / 100;
    params.currency = "USD";
  }
  try {
    t.track(event, params, eventId ? { event_id: eventId } : undefined);
  } catch {}
}

export function tiktokPageView() {
  try {
    ttq()?.page();
  } catch {}
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Advanced matching — TikTok accepts SHA-256 hashes, so the raw email/phone
// never leave the browser. phone should be E.164 (e.g. +15555555555).
export async function identifyTikTok({ email, phone }: { email?: string; phone?: string }) {
  const t = ttq();
  if (!t || !crypto?.subtle) return;
  try {
    const params: Record<string, string> = {};
    if (email) params.email = await sha256(email);
    if (phone) params.phone_number = await sha256(phone);
    if (Object.keys(params).length) t.identify(params);
  } catch {}
}
