import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

// customization-uploads is a private bucket (see storage migration) — only
// an admin should ever be able to view a specific customer's uploaded photo.
// Verifies the caller's access token belongs to an admin (via the service
// role client, bypassing RLS) before generating a short-lived signed URL.
const getSignedCustomizationUrl = createServerFn({ method: "POST" })
  .validator((data: { path: string; accessToken: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(data.accessToken);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Unauthorized");

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
