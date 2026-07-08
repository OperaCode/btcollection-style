-- Admin access for products/orders management + first-admin bootstrap.
--
-- HOW TO APPLY: paste this whole file into the Supabase SQL editor for this
-- project (Lovable Cloud → Backend → SQL Editor) and run it once.
--
-- Before running, replace the email below with the address you will sign up
-- with at /admin/login. That account will automatically receive the
-- 'admin' role the moment it signs up.
do $$
begin
  -- no-op guard block so the file is a single paste-and-run unit
end $$;

-- 1. Make sure RLS is on for the tables the admin area touches.
alter table if exists public.products enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_items enable row level security;
alter table if exists public.user_roles enable row level security;

-- 2. Public storefront can read products; only admins can write.
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3. Admins can see and update every order / order item.
--    (Existing guest-checkout insert policies on orders/order_items are left
--    untouched — this only adds admin read/update access.)
drop policy if exists "Admins view all orders" on public.orders;
create policy "Admins view all orders"
  on public.orders for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins view all order items" on public.order_items;
create policy "Admins view all order items"
  on public.order_items for select
  using (public.has_role(auth.uid(), 'admin'));

-- 4. A signed-in user can read their own role (needed for the client-side
--    admin check); admins can read every row in user_roles.
drop policy if exists "Users read own role" on public.user_roles;
create policy "Users read own role"
  on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

-- 5. First-admin bootstrap: the moment an auth user signs up with this
--    email, they're granted the 'admin' role automatically.
--    >>> REPLACE THE EMAIL BELOW BEFORE RUNNING <<<
create or replace function public.handle_new_admin_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'REPLACE_WITH_ADMIN_EMAIL@example.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_admin_bootstrap on auth.users;
create trigger on_auth_user_created_admin_bootstrap
  after insert on auth.users
  for each row execute function public.handle_new_admin_bootstrap();
