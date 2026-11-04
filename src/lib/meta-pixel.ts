import { useEffect, useRef } from "react";
import { sha256, type TikTokContent, type TikTokEvent } from "@/lib/tiktok-pixel";

// Meta (Facebook/Instagram) Pixel. Mirrors tiktok-pixel.ts: the base snippet
// is injected into <head> by __root.tsx when VITE_META_PIXEL_ID is set, and
// everything here is a silent no-op otherwise, so callers never need to guard.

// Validated so the id can be safely interpolated into the inline snippet.
const rawPixelId = (import.meta.env.VITE_META_PIXEL_ID as string | undefined)?.trim() ?? "";
export const META_PIXEL_ID = /^\d+$/.test(rawPixelId) ? rawPixelId : "";

// Meta's standard base code, verbatim apart from the pixel id.
export function metaPixelSnippet() {
  if (!META_PIXEL_ID) return null;
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`;
}

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (!META_PIXEL_ID || typeof window === "undefined") return null;
  return (window as unknown as { fbq?: Fbq }).fbq ?? null;
}

// Same event names and inputs as trackTikTok, translated to Meta's
// parameter shape, so both pixels can be fired side by side.
export function trackMeta(
  event: TikTokEvent,
  data: { contents?: TikTokContent[]; value?: number; eventId?: string; query?: string } = {},
) {
  const f = fbq();
  if (!f) return;
  const { contents, value, eventId, query } = data;
  const params: Record<string, unknown> = {};
  if (query) params.search_string = query;
  if (contents?.length) {
    params.content_type = "product";
    params.content_ids = contents.map((c) => c.content_id);
    params.contents = contents.map((c) => ({
      id: c.content_id,
      quantity: c.quantity ?? 1,
      ...(c.price !== undefined ? { item_price: c.price } : {}),
    }));
    params.num_items = contents.reduce((n, c) => n + (c.quantity ?? 1), 0);
    if (contents.length === 1 && contents[0].content_name) params.content_name = contents[0].content_name;
  }
  if (value !== undefined) {
    params.value = Math.round(value * 100) / 100;
    params.currency = "USD";
  }
  try {
    if (eventId) f("track", event, params, { eventID: eventId });
    else f("track", event, params);
  } catch {}
}

// Debounced like useTikTokSearchTracking — see the note there.
export function useMetaSearchTracking(query: string) {
  const lastTracked = useRef("");
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || q.toLowerCase() === lastTracked.current) return;
    const timer = setTimeout(() => {
      lastTracked.current = q.toLowerCase();
      trackMeta("Search", { query: q });
    }, 1000);
    return () => clearTimeout(timer);
  }, [query]);
}

export function metaPageView() {
  try {
    fbq()?.("track", "PageView");
  } catch {}
}

// Manual advanced matching: re-running init with hashed customer details
// attaches them to every later event. phone should be digits with country
// code and no "+" (e.g. 15555555555).
export async function identifyMeta({ email, phone }: { email?: string; phone?: string }) {
  const f = fbq();
  if (!f || !crypto?.subtle) return;
  try {
    const params: Record<string, string> = {};
    if (email) params.em = await sha256(email);
    if (phone) params.ph = await sha256(phone.replace(/\D/g, ""));
    if (Object.keys(params).length) f("init", META_PIXEL_ID, params);
  } catch {}
}
