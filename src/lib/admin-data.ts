import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { CATEGORIES } from "@/lib/categories";

export type AdminProduct = Tables<"products">;
export type AdminOrder = Tables<"orders">;
export type AdminOrderItem = Tables<"order_items">;
export type NewsletterSubscriber = Tables<"newsletter_subscribers">;
export type CustomRequest = Tables<"custom_requests">;

export const PRODUCT_CATEGORIES = CATEGORIES;

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

export async function listNewsletterSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function listCustomRequests() {
  const { data, error } = await supabase
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateCustomRequestStatus(id: string, status: CustomRequest["status"]) {
  const { error } = await supabase
    .from("custom_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getDashboardStats() {
  const [
    { count: orderCount },
    { data: orderTotals },
    { count: activeCount },
    { count: outOfStockCount },
    { count: subscriberCount },
    { count: customRequestCount },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total").neq("status", "cancelled"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("in_stock", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("in_stock", false),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("custom_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const revenue = (orderTotals ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return {
    orderCount: orderCount ?? 0,
    revenue,
    activeProducts: activeCount ?? 0,
    outOfStock: outOfStockCount ?? 0,
    subscriberCount: subscriberCount ?? 0,
    customRequestCount: customRequestCount ?? 0,
  };
}
