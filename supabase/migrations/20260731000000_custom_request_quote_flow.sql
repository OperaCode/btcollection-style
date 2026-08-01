-- Support the quote + notify flow for custom requests: color preference
-- captured at submission, a price/note captured when the owner sends a
-- quote, a phone number for faster follow-up, and a timestamp so admin can
-- see whether the customer-facing email for the current status actually
-- sent (mirrors welcome_email_sent_at / notification_sent_at elsewhere).
alter table if exists public.custom_requests
  add column if not exists phone text,
  add column if not exists color_preference text,
  add column if not exists quoted_price numeric,
  add column if not exists quote_note text,
  add column if not exists customer_notified_at timestamptz,
  add column if not exists customer_notification_error text;
