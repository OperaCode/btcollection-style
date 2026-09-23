-- Every public-facing write on these four tables (orders, order_items,
-- custom_requests, newsletter_subscribers) has always gone through a
-- service-role server function in src/lib/*.ts — never the anon/authenticated
-- Supabase client. The earlier migrations nonetheless left direct INSERT
-- grants and "with check (true)" (or equivalent) RLS policies on them for
-- anon/authenticated, which means anyone holding the public publishable key
-- (i.e. anyone who has opened the site) could bypass the app entirely and
-- POST straight to Supabase's REST API to:
--   - insert a fully-formed "paid" order, skipping checkout and payment
--   - insert a custom_requests row with status='awaiting_payment' and an
--     arbitrary quoted_price, then pay that self-chosen price through the
--     existing (legitimate) custom-order checkout flow
--   - flood the newsletter_subscribers list with junk rows
-- None of that insert path is needed by the app, so this revokes the grants
-- and drops the permissive policies. Admin SELECT/UPDATE (all gated on
-- has_role) is untouched, and so is service_role, which bypasses RLS/grants
-- entirely and is what every real write now uses.

drop policy if exists "Anyone can create orders" on public.orders;
drop policy if exists "create own order" on public.orders;
revoke insert on public.orders from anon, authenticated;

drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "insert own order items" on public.order_items;
revoke insert on public.order_items from anon, authenticated;

drop policy if exists "Anyone can create custom requests" on public.custom_requests;
revoke insert on public.custom_requests from anon, authenticated;

drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
revoke insert on public.newsletter_subscribers from anon, authenticated;
