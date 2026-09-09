// Raw HTTP endpoint (wired up in server.ts, same pattern as the Square
// webhook), triggered daily by Vercel Cron (see the "crons" entry in
// vercel.json) — no GitHub Actions / billing dependency involved. Vercel
// automatically sends "Authorization: Bearer $CRON_SECRET" when it invokes
// a cron path, using whatever CRON_SECRET is set to in the project's env
// vars, so nothing sensitive needs to live in the committed vercel.json.
// Counts orders stuck at status "paid" (paid but fulfillment hasn't
// started) and texts a reminder via Twilio if there are any.

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sendReminderSms(body: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.TWILIO_TO_NUMBER;
  if (!accountSid || !authToken || !from || !to) {
    throw new Error("Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, TWILIO_TO_NUMBER.");
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio send failed (${response.status}): ${text}`);
  }
}

export async function handleOrderReminderRequest(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ ok: false, error: "CRON_SECRET is not configured." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  // Bearer header is how Vercel Cron authenticates in production; the
  // header/query fallbacks are just for manual curl/browser testing.
  const provided = bearer ?? request.headers.get("x-cron-secret") ?? url.searchParams.get("secret") ?? "";
  if (!timingSafeEqual(provided, secret)) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid");

    if (error) throw error;

    if (!count) {
      return new Response(JSON.stringify({ ok: true, count: 0, sent: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }

    const adminOrdersUrl = process.env.ADMIN_ORDERS_URL || "https://breakthroughcollection.com/admin/orders";
    const message = `Breakthrough Collection: ${count} order${count === 1 ? "" : "s"} paid and awaiting fulfillment.\n${adminOrdersUrl}`;
    await sendReminderSms(message);

    return new Response(JSON.stringify({ ok: true, count, sent: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Order reminder failed:", error);
    return new Response(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
