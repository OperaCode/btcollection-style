// Shared "is this caller an admin" check for server functions that take a
// plain accessToken from the client (rather than running behind the
// requireSupabaseAuth middleware) — verifies the token against Supabase
// auth, then checks the admin role via the service-role client (bypasses
// RLS). Throws "Unauthorized" on any failure so callers can treat it as a
// single gate.
export async function verifyAdmin(accessToken: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userData.user) throw new Error("Unauthorized");

  const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (roleError || !isAdmin) throw new Error("Unauthorized");

  return supabaseAdmin;
}
