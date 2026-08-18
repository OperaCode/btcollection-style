import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export const PRODUCTS_QUERY_KEY = ["public-products"] as const;

export async function listPublicProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("hidden_from_shop", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPublicProduct(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("hidden_from_shop", false)
    .single();
  if (error) throw error;
  return data;
}
