import { supabase } from "@/integrations/supabase/client";

// Product feed for the Meta catalog (Commerce Manager → Catalog → Data
// sources → Data feed → scheduled feed URL /meta-catalog.xml). Each item's
// id is the product's database id — the same content_id the pixel and
// Conversions API send — which is what lets Meta match site events to
// catalog items. Don't change the id format without re-uploading the
// catalog, or the match rate drops to 0%.

const BRAND = "Breakthrough Collection";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `\n      <${name}>${xmlEscape(String(value))}</${name}>`;
}

export async function handleMetaCatalogRequest(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;

  const { data: products, error } = await supabase
    .from("products")
    .select("id, slug, name, description, base_price, category, images, in_stock")
    .eq("hidden_from_shop", false);
  if (error) throw error;

  const items = (products ?? [])
    .filter((p) => p.images?.length)
    .map((p) => {
      const [image, ...extraImages] = p.images as string[];
      return `    <item>${tag("g:id", p.id)}${tag("g:title", p.name.slice(0, 200))}${tag(
        "g:description",
        (p.description || p.name).slice(0, 9999),
      )}${tag("g:availability", p.in_stock ? "in stock" : "out of stock")}${tag("g:condition", "new")}${tag(
        "g:price",
        `${Number(p.base_price).toFixed(2)} USD`,
      )}${tag("g:link", `${origin}/product/${p.slug}`)}${tag("g:image_link", image)}${extraImages
        .slice(0, 20)
        .map((url) => tag("g:additional_image_link", url))
        .join("")}${tag("g:brand", BRAND)}${tag("g:product_type", p.category)}
    </item>`;
    });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${BRAND}</title>
    <link>${xmlEscape(origin)}</link>
    <description>${BRAND} products</description>
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
