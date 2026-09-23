import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { verifyAdmin } from "@/lib/verify-admin";

// customization-uploads is a private bucket (see storage migration) — only
// an admin should ever be able to view a specific customer's uploaded photo.
// Verifies the caller's access token belongs to an admin (via the service
// role client, bypassing RLS) before generating a short-lived signed URL.
const getSignedCustomizationUrl = createServerFn({ method: "POST" })
  .validator((data: { path: string; accessToken: string }) => data)
  .handler(async ({ data }) => {
    const supabaseAdmin = await verifyAdmin(data.accessToken);

    const { data: signed, error } = await supabaseAdmin.storage
      .from("customization-uploads")
      .createSignedUrl(data.path, 600);
    if (error || !signed) throw error ?? new Error("Could not create a signed URL.");
    return { url: signed.signedUrl };
  });

export async function getCustomizationPhotoUrl(path: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Not signed in.");
  return getSignedCustomizationUrl({ data: { path, accessToken } });
}
