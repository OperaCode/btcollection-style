// Admin-managed product categories (max 8, enforced by a DB trigger — see
// supabase/migrations/20260910000000_categories_table.sql). Used by the shop
// filter chips, the admin product form, the admin product list filter chips,
// and the admin gallery "Product type" dropdown — the single source of truth
// previously drifted across a hardcoded array and manual SQL renames.
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Category = Tables<"categories">;

export const CATEGORIES_QUERY_KEY = ["categories"] as const;
export const MAX_CATEGORIES = 8;

export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function createCategory(input: { name: string; sort_order: number }) {
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, input: { name?: string; sort_order?: number }) {
  const { error } = await supabase.from("categories").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string, name: string) {
  const [{ count: productCount }, { count: galleryCount }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category", name),
    supabase.from("gallery_projects").select("id", { count: "exact", head: true }).eq("product_type", name),
  ]);
  const total = (productCount ?? 0) + (galleryCount ?? 0);
  if (total > 0) {
    throw new Error(
      `"${name}" is used by ${productCount ?? 0} product(s) and ${galleryCount ?? 0} gallery project(s). Reassign them before deleting.`,
    );
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderCategories(orderedIds: string[]) {
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("categories").update({ sort_order: index }).eq("id", id)),
  );
}
