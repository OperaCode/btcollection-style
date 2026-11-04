-- Meta Conversions API matching data, captured when checkout starts (the
-- _fbp/_fbc cookies, IP and user agent) and read back when the order is
-- paid, so the server-side Purchase event can be attributed to the right
-- Meta user and ad click. Nullable: checkout works without it, and it's
-- only ever read by the server.
alter table public.checkout_sessions
  add column if not exists meta_context jsonb;
