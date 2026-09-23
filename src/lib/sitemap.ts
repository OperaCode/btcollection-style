import { supabase } from "@/integrations/supabase/client";

// Everything a search engine can actually reach without signing in or going
// through checkout. /admin, /cart, /checkout and the payment-success pages
// are intentionally left out (also blocked in robots.txt).
const STATIC_PATHS = [
  "/",
  "/shop",
  "/about",
  "/contact",
  "/custom",
  "/inspiration",
  "/shipping",
  "/returns",
  "/privacy",
  "/terms",
];

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function urlTag(loc: string, lastmod?: string | null) {
  const lastmodTag = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : "";
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n  </url>`;
}

export async function handleSitemapRequest(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("hidden_from_shop", false);

  const urls = [
    ...STATIC_PATHS.map((path) => urlTag(`${origin}${path}`)),
    ...(products ?? []).map((p) => urlTag(`${origin}/product/${p.slug}`, p.updated_at)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
