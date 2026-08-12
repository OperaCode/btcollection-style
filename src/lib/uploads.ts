import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/heic"];

// Uploads straight to the private customization-uploads bucket (anon/authenticated
// can only INSERT, never read/list — see the storage migration). Only the
// resulting path is kept client-side; the admin panel views the photo later
// via a server-generated signed URL.
export async function uploadCustomizationPhoto(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const type =
    file.type ||
    (extension === "jpg" || extension === "jpeg" ? "image/jpeg" : `image/${extension}`);
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error("Please upload a PNG, JPEG, WEBP, or HEIC image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be smaller than 8MB.");
  }
  const ext = extension || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("customization-uploads")
    .upload(path, file, { contentType: type, upsert: false });
  if (error) throw new Error(error.message || "Photo upload failed. Please try again.");
  return path;
}
