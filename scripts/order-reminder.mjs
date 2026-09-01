// Standalone reminder job — run on a schedule by
// .github/workflows/order-reminder.yml, not part of the deployed app.
// Counts orders stuck at status "paid" (paid but fulfillment hasn't
// started) and texts a reminder via Twilio if there are any.
import { createClient } from "@supabase/supabase-js";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const TWILIO_ACCOUNT_SID = requireEnv("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = requireEnv("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = requireEnv("TWILIO_FROM_NUMBER");
const TWILIO_TO_NUMBER = requireEnv("TWILIO_TO_NUMBER");
const ADMIN_ORDERS_URL = process.env.ADMIN_ORDERS_URL || "https://breakthroughcollection.com/admin/orders";

async function sendSms(body) {
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ From: TWILIO_FROM_NUMBER, To: TWILIO_TO_NUMBER, Body: body }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio send failed (${response.status}): ${text}`);
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "paid");

  if (error) throw error;

  if (!count) {
    console.log("No paid-and-pending orders — skipping SMS.");
    return;
  }

  const message = `Breakthrough Collection: ${count} order${count === 1 ? "" : "s"} paid and awaiting fulfillment.\n${ADMIN_ORDERS_URL}`;
  await sendSms(message);
  console.log(`Sent reminder for ${count} paid order(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
