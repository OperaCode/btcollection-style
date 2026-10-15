-- TikTok Events API matching data, captured when checkout starts (the
-- _ttp cookie, the ttclid ad-click id, IP and user agent) and read back
-- when the order is paid, so the server-side CompletePayment event can be
-- attributed to the right TikTok user and ad click. Nullable: checkout
-- works without it, and it's only ever read by the server.
alter table public.checkout_sessions
  add column if not exists tiktok_context jsonb;
