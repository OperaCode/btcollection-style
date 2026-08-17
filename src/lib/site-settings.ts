import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { SOCIAL_LINKS, WHATSAPP_URL, CONTACT_EMAIL } from "@/lib/site-config";

export type SiteSettings = Tables<"site_settings">;
export type SiteSettingsUpdate = TablesUpdate<"site_settings">;

export const SITE_SETTINGS_QUERY_KEY = ["site-settings"] as const;

export async function getSiteSettings() {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSiteSettings(input: SiteSettingsUpdate) {
  const { error } = await supabase.from("site_settings").update(input).eq("id", 1);
  if (error) throw error;
}

// Merges admin-entered overrides with the env-based defaults from site-config.ts,
// so the public site keeps working even before an admin has filled in Settings.
export function useSiteSettings() {
  const query = useQuery({ queryKey: SITE_SETTINGS_QUERY_KEY, queryFn: getSiteSettings });
  const row = query.data;
  return {
    ...query,
    social: {
      instagram: row?.social_instagram || SOCIAL_LINKS.instagram,
      facebook: row?.social_facebook || SOCIAL_LINKS.facebook,
      tiktok: row?.social_tiktok || SOCIAL_LINKS.tiktok,
      pinterest: row?.social_pinterest || SOCIAL_LINKS.pinterest,
      etsy: row?.social_etsy || SOCIAL_LINKS.etsy,
    },
    whatsappUrl: row?.whatsapp_url || WHATSAPP_URL,
    contactEmail: row?.contact_email || CONTACT_EMAIL,
  };
}
