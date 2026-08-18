import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { CATEGORIES } from "@/lib/categories";
import { sendCustomRequestQuote, sendCustomRequestStatusUpdate } from "@/lib/custom-request-email";

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

export async function uploadProductImage(file: File) {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/heic"];
  const extension = file.name.split(".").pop()?.toLowerCase();
  const type =
    file.type ||
    (extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension ?? "jpg"}`);

  if (!allowed.includes(type)) {
    throw new Error("Please upload a PNG, JPEG, WEBP, or HEIC image.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image must be smaller than 8MB.");
  }

  const ext = extension || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: type, upsert: false });

  if (error) throw new Error(error.message || "Product image upload failed.");

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
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

// Statuses where the customer should automatically get an email when the
// owner moves the request there. "awaiting_payment" is handled separately
// by sendCustomRequestQuoteAndNotify since it needs a price. "processing" is
// only ever set by confirmCustomRequestPayment on successful Square payment
// — all payment goes through the site, so it's excluded from the admin's
// manual status dropdown, but stays in this set as defense in depth in case
// it's ever set through another path. "reviewing" is the automatic starting
// state (no email needed) and "cancelled" is left silent since that's
// usually a conversation the owner would rather have directly.
const STATUS_NOTIFY = new Set(["processing", "ready", "shipped", "delivered"]);

export async function updateCustomRequestStatus(
  request: CustomRequest,
  status: CustomRequest["status"],
) {
  const { error } = await supabase
    .from("custom_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", request.id);
  if (error) throw error;

  if (STATUS_NOTIFY.has(status)) {
    await sendCustomRequestStatusUpdate({
      data: { id: request.id, fullName: request.full_name, email: request.email, status },
    });
  }
}

export async function sendCustomRequestQuoteAndNotify(
  request: CustomRequest,
  quotedPrice: number,
  quoteNote: string,
) {
  const { error } = await supabase
    .from("custom_requests")
    .update({
      status: "awaiting_payment",
      quoted_price: quotedPrice,
      quote_note: quoteNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", request.id);
  if (error) throw error;

  await sendCustomRequestQuote({
    data: {
      id: request.id,
      fullName: request.full_name,
      email: request.email,
      quotedPrice,
      quoteNote: quoteNote || null,
    },
  });
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
    supabase
      .from("custom_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "reviewing"),
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
