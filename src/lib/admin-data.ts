import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type AdminProduct = Tables<"products">;
export type AdminOrder = Tables<"orders">;
export type AdminOrderItem = Tables<"order_items">;

export const PRODUCT_CATEGORIES = ["Faith Apparel", "Mugs", "Accessories", "Gift Sets"] as const;

export async function listProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createProduct(input: TablesInsert<"products">) {
  const { data, error } = await supabase.from("products").insert(input).select("id").single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, input: TablesUpdate<"products">) {
  const { error } = await supabase.from("products").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function listOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listOrderItems(orderId: string) {
  const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: AdminOrder["status"]) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats() {
  const [{ count: orderCount }, { data: orderTotals }, { count: activeCount }, { count: outOfStockCount }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total").neq("status", "cancelled"),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("in_stock", true),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("in_stock", false),
    ]);

  const revenue = (orderTotals ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return {
    orderCount: orderCount ?? 0,
    revenue,
    activeProducts: activeCount ?? 0,
    outOfStock: outOfStockCount ?? 0,
  };
}
