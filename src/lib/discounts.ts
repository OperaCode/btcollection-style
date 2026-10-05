import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type DiscountCode = Tables<"discount_codes">;

export type DiscountResolution =
  | { ok: true; code: string; percentOff: number; amount: number }
  | { ok: false; error: string };

// Looks up and validates a discount code against the current subtotal and
// customer email, entirely server-side (service role) — the client only
// ever proposes a code string, never a discount amount. Shared by both the
// "Apply" preview in the cart and the real checkout, so a code can't be
// previewed as valid and then rejected (or vice versa) from two copies of
// the same logic drifting apart.
export async function resolveDiscount(
  supabaseAdmin: SupabaseClient<Database>,
  input: { code: string; email: string; subtotal: number },
): Promise<DiscountResolution> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a code." };

  const { data: discount, error } = await supabaseAdmin
    .from("discount_codes")
    .select("*")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  if (!discount || !discount.active) return { ok: false, error: "This code isn't valid." };

  const now = Date.now();
  if (discount.starts_at && new Date(discount.starts_at).getTime() > now) {
    return { ok: false, error: "This code isn't active yet." };
  }
  if (discount.expires_at && new Date(discount.expires_at).getTime() < now) {
    return { ok: false, error: "This code has expired." };
  }
  if (input.subtotal < Number(discount.min_subtotal)) {
    return {
      ok: false,
      error: `This code requires a minimum order of $${Number(discount.min_subtotal).toFixed(2)}.`,
    };
  }

  const email = input.email.trim().toLowerCase();
  if (email) {
    const { count, error: usageError } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("discount_code", code)
      .ilike("email", email);
    if (usageError) throw usageError;
    if (count && count > 0) return { ok: false, error: "This code has already been used on this account." };
  }

  const percentOff = Number(discount.percent_off);
  const amount = Math.round(input.subtotal * (percentOff / 100) * 100) / 100;
  return { ok: true, code, percentOff, amount };
}

// Unauthenticated on purpose, same reasoning as Shippo's checkout rate
// quotes — this only tells a guest whether a code is valid and what it's
// worth, so they can see it applied before paying. Nothing here can be used
// to actually redeem or spend the discount; that only happens for real
// inside startOrderCheckout once payment is underway.
const previewDiscount = createServerFn({ method: "POST" })
  .validator((data: { code: string; email: string; subtotal: number }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return resolveDiscount(supabaseAdmin, data);
  });

export async function previewDiscountCode(input: { code: string; email: string; subtotal: number }) {
  return previewDiscount({ data: input });
}

// The homepage announcement strip wants to advertise "the" current promo,
// not validate a specific code someone typed in — different question from
// resolveDiscount above. Unauthenticated: a code + percent-off is meant to
// be publicly advertised, that's the whole point of a banner.
const getActivePromoBanner = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("discount_codes")
    .select("code, percent_off, starts_at, expires_at")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error || !data) return null;

  const now = Date.now();
  const live = data.find((d) => {
    if (d.starts_at && new Date(d.starts_at).getTime() > now) return false;
    if (d.expires_at && new Date(d.expires_at).getTime() < now) return false;
    return true;
  });
  return live ? { code: live.code, percentOff: Number(live.percent_off) } : null;
});

export async function getActiveDiscountBanner() {
  return getActivePromoBanner();
}

// --- Admin CRUD (mirrors src/lib/categories.ts's pattern: plain RLS-bound
// client, gated by the "Admins manage discount codes" policy) ---

export const DISCOUNT_CODES_QUERY_KEY = ["admin", "discount-codes"] as const;

export async function listDiscountCodes() {
  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// Safety net for running one promo at a time: activating a code
// auto-deactivates every other one, rather than letting "active" codes pile
// up silently (the banner only ever shows one anyway — this just makes the
// data match what's actually advertised, and avoids an old forgotten code
// still being redeemable at checkout).
async function deactivateOtherDiscountCodes(exceptId?: string) {
  let query = supabase.from("discount_codes").update({ active: false }).eq("active", true);
  if (exceptId) query = query.neq("id", exceptId);
  const { error } = await query;
  if (error) throw error;
}

export async function createDiscountCode(input: TablesInsert<"discount_codes">) {
  if (input.active) await deactivateOtherDiscountCodes();
  const { data, error } = await supabase
    .from("discount_codes")
    .insert({ ...input, code: input.code.trim().toUpperCase() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDiscountCode(id: string, input: TablesUpdate<"discount_codes">) {
  if (input.active) await deactivateOtherDiscountCodes(id);
  const payload = input.code ? { ...input, code: input.code.trim().toUpperCase() } : input;
  const { error } = await supabase.from("discount_codes").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteDiscountCode(id: string) {
  const { error } = await supabase.from("discount_codes").delete().eq("id", id);
  if (error) throw error;
}
