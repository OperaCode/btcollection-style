import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import catFaith from "@/assets/cat-faith.jpg";
import catMugs from "@/assets/cat-mugs.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGifts from "@/assets/cat-gifts.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import upload01 from "@/assets/product-uploads/upload-01.jpeg";
import upload02 from "@/assets/product-uploads/upload-02.jpeg";
import upload03 from "@/assets/product-uploads/upload-03.jpeg";
import upload04 from "@/assets/product-uploads/upload-04.jpeg";
import upload05 from "@/assets/product-uploads/upload-05.jpeg";
import upload06 from "@/assets/product-uploads/upload-06.jpeg";
import upload07 from "@/assets/product-uploads/upload-07.jpeg";
import upload08 from "@/assets/product-uploads/upload-08.jpeg";
import upload09 from "@/assets/product-uploads/upload-09.jpeg";
import upload10 from "@/assets/product-uploads/upload-10.jpeg";
import upload11 from "@/assets/product-uploads/upload-11.jpeg";
import upload12 from "@/assets/product-uploads/upload-12.jpeg";
import upload13 from "@/assets/product-uploads/upload-13.jpeg";
import upload14 from "@/assets/product-uploads/upload-14.jpeg";
import upload15 from "@/assets/product-uploads/upload-15.jpeg";

export type Product = Tables<"products">;

export const PRODUCTS_QUERY_KEY = ["public-products"] as const;

const LOCAL_IMAGES: Record<string, string> = {
  "local:p1": p1,
  "local:p2": p2,
  "local:p3": p3,
  "local:p4": p4,
  "local:cat-faith": catFaith,
  "local:cat-mugs": catMugs,
  "local:cat-accessories": catAccessories,
  "local:cat-gifts": catGifts,
  "local:upload-01": upload01,
  "local:upload-02": upload02,
  "local:upload-03": upload03,
  "local:upload-04": upload04,
  "local:upload-05": upload05,
  "local:upload-06": upload06,
  "local:upload-07": upload07,
  "local:upload-08": upload08,
  "local:upload-09": upload09,
  "local:upload-10": upload10,
  "local:upload-11": upload11,
  "local:upload-12": upload12,
  "local:upload-13": upload13,
  "local:upload-14": upload14,
  "local:upload-15": upload15,
};

function resolveProductImages(product: Product): Product {
  return {
    ...product,
    images: product.images.map((image) => LOCAL_IMAGES[image] ?? image),
  };
}

export async function listPublicProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(resolveProductImages);
}

export async function getPublicProduct(slug: string) {
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).single();
  if (error) throw error;
  return resolveProductImages(data);
}
